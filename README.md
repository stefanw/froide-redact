# Redaction in the browser

How it works:

1. PDF is converted to HTML with [html2pdfEx](https://coolwanglu.github.io/pdf2htmlEX/)
2. HTML is loaded in the browser and redacted in the browser
3. Serialized redaction operations (text selections, image black outs) are sent to the server
4. Server loads HTML into [phantomjs](http://phantomjs.org/), applies redaction operations and either returns the redacted HTML or prints page back to PDF


## Installation

### On your machine

Install [html2pdfEx](https://coolwanglu.github.io/pdf2htmlEX/) and [phantomjs](http://phantomjs.org/).

    pip install -r requirements.txt
    python manage.py runserver

Then visit:
<http://localhost:8000/?url=http://localhost:8000/static/example.pdf>


### Using docker

    docker build -t froide_redact .
    docker run -p 8000:8000 -i -t froide_redact

Then visit:
<http://localdocker:8000/?url=http://localdocker:8000/static/example.pdf>


## Usage

The links above open a sample pdf rendered as html.

- Select parts of the text to redact that part
- Click on links to remove the links (probably doesn't work yet)
- Draw rectangles on images to redact them (a bit broken still)

Click one of the redact buttons at the top and get back either HTML or PDF. HTML may work better.


## Issues

Stil a couple, see [Issues](https://github.com/stefanw/froide-redact/issues).


## Credits

Based on the initial prototype called [Foist](https://github.com/obshtestvo/foist) and long research with [Tony Bowden](https://github.com/tmtmtmtm) and [Anton Stoychev](https://github.com/antitoxic) sponsored by [MySociety](https://www.mysociety.org/).
