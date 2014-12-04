var page = require('webpage').create(),
    system = require('system'),
    fs = require('fs'),
    address, output, size;

var address = system.args[1];
var output = system.args[2];
// console.log(phantom.libraryPath, system.args[0], fs.absolute(system.args[0]));
var redactions = JSON.parse(system.args[3]);
console.log(redactions);

page.viewportSize = { width: 600, height: 600 };
page.paperSize = { format: 'A4', orientation: 'portrait', margin: '1cm' };
page.zoomFactor = 1;

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

page.open(address, function (status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
        phantom.exit(1);
    } else {
        console.log(phantom.libraryPath + "/../static/jquery/jquery.js");
        page.injectJs(phantom.libraryPath + "/../static/jquery/jquery.js");
        page.injectJs(phantom.libraryPath + "/../static/rangy/lib/rangy-core.js");
        page.injectJs(phantom.libraryPath + "/../static/rangy/lib/rangy-serializer.js");
        page.injectJs(phantom.libraryPath + "/../static/rangy/lib/rangy-classapplier.js");
        page.injectJs(phantom.libraryPath + "/../static/froide_redact/redact.js");
        window.setTimeout(function () {
            page.evaluate(function(redactions) {
              console.log('Applying redactions...');
              var css = '.pf { page-break-after : always; }';
              head = document.head || document.getElementsByTagName('head')[0];
              style = document.createElement('style');
              style.appendChild(document.createTextNode(css));
              head.appendChild(style);

              var redactor = new Redactor();
              redactor.applyRedactions(redactions);
              console.log('Rendering output...');

            }, redactions);
            window.setTimeout(function(){
              page.render(output);
              console.log('Done. Exiting.');
              phantom.exit();
            }, 200);
        }, 200);
    }
});
