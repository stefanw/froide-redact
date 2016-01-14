from django.http import HttpResponse
from django.shortcuts import render

import requests

from .utils import convert_pdfupload_to_html, apply_redactions


def redact(request):
    url = request.GET.get('url')
    response = requests.get(url)
    converted_html_path = convert_pdfupload_to_html(response.content)
    if request.method == 'POST':
        redactions = request.POST.get('redactions')

        output_type = 'pdf'
        content_type = 'application/pdf'
        if request.POST.get('type') == 'html':
            output_type = 'html'
            content_type = 'text/html'

        output_file = apply_redactions(converted_html_path, redactions,
                         output_type=output_type)
        print(output_file)
        with open(output_file) as f:
            return HttpResponse(f.read(), content_type=content_type)

    return render(request, 'froide_redact/index.html', {
        'contents': open(converted_html_path).read()
    })
