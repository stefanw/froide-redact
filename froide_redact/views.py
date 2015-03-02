import tempfile

from django.http import HttpResponse
from django.shortcuts import render

import requests

from .utils import convert_to_html, apply_redactions


def redact(request):
    url = request.GET.get('url')
    response = requests.get(url)
    original_pdf = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
    original_pdf.write(response.content)
    original_pdf.close()
    print original_pdf.name
    converted_html_path, _ = original_pdf.name.rsplit('.', 1)
    converted_html_path += '.html'
    convert_to_html(original_pdf.name, converted_html_path)
    if request.method == 'POST':
        redactions = request.POST.get('redactions')
        redacted_pdf = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        redacted_pdf.close()
        html = False
        if request.GET.get('html'):
            html = True
        apply_redactions(converted_html_path, redacted_pdf.name, redactions, html=html)
        print redacted_pdf.name
        if request.GET.get('html'):
            html_path = redacted_pdf.name.replace('.pdf', '.html')
            return HttpResponse(file(html_path).read(), content_type='text/html')
        return HttpResponse(file(redacted_pdf.name).read(), content_type='application/pdf')
    return render(request, 'froide_redact/index.html', {
        'contents': open(converted_html_path).read()
    })
