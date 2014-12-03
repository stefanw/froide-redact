# Redaction in the browser

How it works:

1. PDF is converted to HTML with [html2pdfEx](https://coolwanglu.github.io/pdf2htmlEX/)
2. HTML is loaded in the browser and redacted in the browser
3. Serialized redaction operations (text selections, image black outs) are sent to the server
4. Server loads HTML into [phantomjs](http://phantomjs.org/), applies redaction operations and prints page back to PDF

## Demo

### On your machine

Install [html2pdfEx](https://coolwanglu.github.io/pdf2htmlEX/) and [phantomjs](http://phantomjs.org/).

    pip install -r requirements.txt
    python manage.py runserver

Then visit:
<http://localhost:8000/?url=http://localhost:8000/static/example.pdf>


### Using docker

    docker built -t froide_redact .
    docker run -p 8000:8000 -i -t froide_redact

Then visit:
<http://localdocker:8000/?url=http://localdocker:8000/static/example.pdf>


## Issues

- Image redactions do not work yet.
- Final text is somehow doubled, copying text sucks
- Final PDF pages are not cut off quite where they should be
- Needs testing, testing, testing


## Credits

Based on the initial prototype called [Foist](https://github.com/obshtestvo/foist) and long research with [Tony Bowden](https://github.com/tmtmtmtm) and [Anton Stoychev](https://github.com/antitoxic) sponsored by [MySociety](https://www.mysociety.org/).
