/* jshint strict: true, es3: true */
/* global console: false, rangy: false */

(function(exports){
'use strict';

var $ = exports.$ || window.jQuery;

function getPathTo(element) {
  if (element.id !== '') {
    return 'id("' + element.id + '")';
  }
  if (element === document.body) {
    return element.tagName;
  }
  var ix = 0;
  var siblings = element.parentNode.childNodes;
  for (var i= 0; i<siblings.length; i++) {
    var sibling = siblings[i];
    if (sibling === element) {
      return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
    }
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      ix += 1;
    }
  }
}

var getReplacement = function(len, repl){
  repl = repl === undefined ? '!' : repl;
  var s = [];
  for (var i = 0; i < len; i += 1) {
    s.push(repl);
  }
  return s.join('');
};
var getOffset = function(e){
  return [
    (e.offsetX || e.originalEvent.layerX),
    (e.offsetY || e.originalEvent.layerY)
  ];
};

function HTMLRedactor(options){
  this.containerId = options.container;
  this.url = options.htmlUrl;
  this.htmlContent = options.htmlContent;

  this.container = $('#' + this.containerId);

  this.prevButton = $('.htmlredactor-prev', this.container);
  this.nextButton = $('.htmlredactor-next', this.container);

  this.totalPagesDisplay = $('.htmlredactor-total', this.container);
  this.currentPageDisplay = $('.htmlredactor-current', this.container);

  this.iframeContainer = $('.htmlredactor-iframe-container', this.container);
  this.redactions = [];
}

HTMLRedactor.prototype.init = function() {
  var self = this;

  var deferred = $.Deferred();

  if (self.url){
    this.iframe = $('<iframe name="iframe" class="htmlredactor-iframe" src="' + self.url + '"></iframe>');
  } else {
    this.iframe = $('<iframe name="iframe" class="htmlredactor-iframe"></iframe>');
  }
  self.iframe.css('width', this.container.css('width'));
  var iFrameLoaded = function(){
    self.iframeWindow = self.iframe[0].contentWindow;
    self.contents = self.iframe.contents();
    self.redactor = new Redactor(self.iframeWindow, self.contents);

    self.pages = $('.pf', self.contents);

    // Using promise to fetch the page
    self.currentPage = 1;
    self.numPages = self.pages.length;
    // self.renderPage(self.currentPage);

    self.totalPagesDisplay.text(self.numPages);
    self.currentPageDisplay.text(self.currentPage);

    self.prevButton.on('click', function(){
      self.currentPage -= 1;
      if (self.currentPage < 1) {
        self.currentPage = 1;
      }
      self.updateButtons();
      self.renderPage(self.currentPage);
      self.currentPageDisplay.text(self.currentPage);
    });

    self.nextButton.on('click', function(){
      self.currentPage += 1;
      if (self.currentPage > self.numPages) {
        self.currentPage = self.numPages;
      }
      self.updateButtons();
      self.renderPage(self.currentPage);
      self.currentPageDisplay.text(self.currentPage);
    });

    self.updateButtons();
    self.setupEventListeners();

    deferred.resolve();

  };

  this.iframeContainer.append(this.iframe);
  if (self.url) {
    this.iframe.on('load', iFrameLoaded);
  } else {
    self.iframe[0].contentWindow.document.write(self.htmlContent);
    window.setTimeout(iFrameLoaded, 1000);
  }


  return deferred;
};

HTMLRedactor.prototype.setupEventListeners = function(){
  var self = this;
  self.mouseDownImage = null;
  self.mouseDownCoordinates = null;
  var contents = this.contents;

  $('body', contents).mousedown(function(e){
    console.log('mousedown', e);
  });
  $('body', contents).mouseup(function(e){
    console.log('mouseup', e);
  });

  $('.pc img', contents).mousedown(function(e){
    console.log('image mousedown');
    e.preventDefault();
    console.log(e);
    console.log($(this).offset());
    self.mouseDownImage = $(this);
    self.mouseDownCoordinates = getOffset(e);
  });

  $('.pc img', contents).mouseup(function(e){
    console.log('image mouseup');
    e.preventDefault();
    e.stopPropagation();
    self.handleImageRedaction(e, $(this));
  });

  $('.pc', contents).mouseup(function(e){
    self.handleImageRedaction(e);
  });

  $('.pc a', contents).click(function(e){
    console.log('link mouseup');
    e.preventDefault();
    $(this).remove();
  });
  $('.pc .t', contents).mouseup(function(e){
    console.log('text mouseup');
    e.preventDefault();
    self.handleImageRedaction(e);
    var serialized = self.redactor.serializeSelection();
    self.redactions.push({type: 'selection', value: serialized});
    self.redactor.redactTextSelection();
  });
};

HTMLRedactor.prototype.handleImageRedaction = function(e, image) {
  if (this.mouseDownImage === null || (image && this.mouseDownImage[0] !== image[0])) {
    this.mouseDownImage = null;
    this.mouseDownCoordinates = null;
    return false;
  }
  console.log('image redaction', this.mouseDownImage, this.mouseDownCoordinates);

  var imagePath = getPathTo(this.mouseDownImage[0]);

  var newOffset;
  if (image) {
    newOffset = getOffset(e);
  } else {
    /* TODO: fix this, it's broken */
    /* mouse went out of image, find out which corner */
    newOffset = getOffset(e);
    var targetOffset = $(e.target).offset();
    var imageOffset = this.mouseDownImage.offset();
    var imageX = imageOffset.left - targetOffset.left;
    var imageY = imageOffset.top - targetOffset.top;

    if (newOffset[0] < imageX) {
      newOffset[0] = 0;
    } else if (newOffset[0] > imageX + this.mouseDownImage[0].width) {
      newOffset[0] = this.mouseDownImage[0].width;
    }
    if (newOffset[1] < imageY) {
      newOffset[1] = 0;
    } else if (newOffset[1] > imageY + this.mouseDownImage[0].height) {
      newOffset[1] = this.mouseDownImage[0].height;
    }
  }

  var x, y, w, h;
  if (this.mouseDownCoordinates[0] < newOffset[0]) {
    x = this.mouseDownCoordinates[0];
    w = newOffset[0] - x;
  } else {
    x = newOffset[0];
    w = this.mouseDownCoordinates[0] - x;
  }
  if (this.mouseDownCoordinates[1] < newOffset[1]) {
    y = this.mouseDownCoordinates[1];
    h = newOffset[1] - y;
  } else {
    y = newOffset[1];
    h = this.mouseDownCoordinates[1] - y;
  }

  var dimensions = {
    xpath: imagePath,
    x: x,
    y: y,
    w: w,
    h: h
  };

  this.redactions.push({type: 'image', value: dimensions});
  this.redactor.redactImage(this.mouseDownImage[0], dimensions);

  this.mouseDownImage = null;
  this.mouseDownCoordinates = null;
  return true;
};

HTMLRedactor.prototype.updateButtons = function(){
  var self = this;
  if (self.currentPage == 1) {
    self.prevButton.prop('disabled', true);
  } else {
    self.prevButton.prop('disabled', false);
  }
  if (self.currentPage == self.numPages) {
    self.nextButton.prop('disabled', true);
  } else {
    self.nextButton.prop('disabled', false);
  }
};

HTMLRedactor.prototype.renderPage = function(pageno) {
  if (pageno === undefined) {
    pageno = this.currentPage;
  }

  var iframeWindowOffset = this.iframe.height();
  var pageOffset = $(this.pages[pageno - 1]).offset().top;
  var dest = 0;
  if (pageOffset > iframeWindowOffset) {
    dest = iframeWindowOffset;
  } else {
    dest = pageOffset;
  }

  $('#page-container', this.contents).animate({scrollTop: dest}, 500, 'swing');
};

HTMLRedactor.prototype.getRedactions = function(){
  return JSON.stringify(this.redactions);
};

exports.HTMLRedactor = HTMLRedactor;

})(typeof window === 'undefined' ? exports: window);
