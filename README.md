# Redaction in the browser

How it works:

1. PDF is converted to HTML with [html2pdfEx](https://coolwanglu.github.io/pdf2htmlEX/)
2. HTML is loaded in the browser and redacted in the browser
3. Serialized redaction operations (text selections, image black outs) are sent to the server
4. Server loads HTML into [phantomjs](http://phantomjs.org/), applies redaction operations and prints page back to PDF

## Installation

### On your machine

Install [html2pdfEx](https://coolwanglu.github.io/pdf2htmlEX/) and [phantomjs](http://phantomjs.org/).

    pip install -r requirements.txt
    python manage.py runserver

### Using docker

    docker build -t froide_redact .
    docker run -p 8000:8000 -i -t froide_redact


## Usage

The links to the bottom open a sample pdf rendered as html.

- Select parts of the text to redact that part
- Click on links to remove the links
- Draw rectangles on images to make a redact them

### Local Version

Redacted PDF generation:
<http://localhost:8000/?url=http://localhost:8000/static/example.pdf>

Redacted HTML generation:
<http://localhost:8000/?url=http://localhost:8000/static/example.pdf&html=1>

### Docker version

Then visit for PDF generation:
<http://localdocker:8000/?url=http://localdocker:8000/static/example.pdf>

Or visit the following for redacted HTML generation:
<http://localdocker:8000/?url=http://localdocker:8000/static/example.pdf&html=1>


## Issues

Stil a couple, see [Issues](https://github.com/stefanw/froide-redact/issues).


## Credits

Based on the initial prototype called [Foist](https://github.com/obshtestvo/foist) and long research with [Tony Bowden](https://github.com/tmtmtmtm) and [Anton Stoychev](https://github.com/antitoxic) sponsored by [MySociety](https://www.mysociety.org/).
