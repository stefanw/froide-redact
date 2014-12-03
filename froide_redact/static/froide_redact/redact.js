/* jshint strict: true, es3: true */
/* global console: false, rangy: false */

(function(exports){
'use strict';

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
  rangy.deserializeSelection(serialized, this.win.document.body, this.win);
  this.redactTextSelection();
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


exports.Redactor = Redactor;

})(typeof window === 'undefined' ? exports: window);
