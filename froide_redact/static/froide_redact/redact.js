/* jshint strict: true, es3: true */
/* global console: false, rangy: false */

(function(exports){
'use strict';

function getElementByXpath(path, doc) {
  doc = doc || document;
  return document.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function Redactor(win, contents){
  rangy.init();
  this.win = win || window;
  this.contents = contents || window.document;
  this.redactedClassName = 'to-be-redacted';
  this.redactor = rangy.createCssClassApplier(this.redactedClassName);
}

Redactor.prototype.serializeSelection = function(){
  return rangy.serializeSelection(rangy.getSelection(this.win), true, this.win.document.body);
};

Redactor.prototype.applyRedactions = function(redactions) {
  for (var i = 0; i < redactions.length; i += 1) {
    this['apply_' + redactions[i].type](redactions[i].value);
  }
};

Redactor.prototype.apply_selection = function(serialized) {
  if (serialized === '') {
    return;
  }
  rangy.deserializeSelection(serialized, this.win.document.body, this.win);
  this.redactTextSelection();
};

Redactor.prototype.apply_image = function(serialized) {
  var img = getElementByXpath(serialized.xpath, this.win.document);
  this.redactImage(img, serialized);
};

Redactor.prototype.redactTextSelection = function(){
  this.redactor.applyToSelection(this.win);
  var self = this;
  $('.' + this.redactedClassName, this.contents).each(function(i, span){
    var width = $(span).width();
    var height = $(span).parent().height();
    $(span).css({
      width: width + 'px',
      height: height + 'px',
      'background-color': '#000',
      display: 'inline-block',
      overflow: 'hidden'
    }).removeClass(self.redactedClassName).addClass('redacted').text('');
  });
};

Redactor.prototype.redactImage = function(image, dimensions){
  var canvas = document.createElement('canvas');
  var img = document.createElement('img');
  img.src = image.src;
  var xratio = img.width / image.width;
  var yratio = img.height / image.height;
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#000';

  ctx.fillRect(dimensions.x * xratio, dimensions.y * yratio,
               dimensions.w * xratio, dimensions.h * yratio);
  console.log('Redacted at '+ dimensions.x + ',' + dimensions.y);
  image.src = canvas.toDataURL('image/png');
};


exports.Redactor = Redactor;

})(typeof window === 'undefined' ? exports: window);
