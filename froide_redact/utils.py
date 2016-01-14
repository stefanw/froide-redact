import os
import tempfile
import logging
import subprocess

logging.basicConfig(level=logging.DEBUG)


def call_binary(arguments, home=None):
    env = dict(os.environ)

    if home:
        env.update({'HOME': home})

    logging.info("Running: %s", ' '.join(arguments))
    logging.info("Env: %s", env)

    p = subprocess.Popen(
        arguments,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env
    )
    out, err = p.communicate()
    p.wait()
    if err:
        logging.error(err)
    logging.info(out)
    return p.returncode == 0


def convert_pdfupload_to_html(pdfupload):
    original_pdf = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
    original_pdf.write(pdfupload)
    original_pdf.close()
    print(original_pdf.name)
    converted_html_path, _ = original_pdf.name.rsplit('.', 1)
    converted_html_path += '.html'
    if convert_to_html(original_pdf.name, converted_html_path):
        return converted_html_path


def convert_to_html(pdf_file, output_file):
    output_path = os.path.dirname(output_file)
    arguments = ['pdf2htmlEX',
        '--embed-javascript', '0',
        # '--embed-font', '0',
        # '--decompose-ligature', '1',
        '--optimize-text', '1',
        # '--proof', '1',
        '--dest-dir', output_path,
        pdf_file]
    home_path = os.path.dirname(output_file)

    if call_binary(arguments, home=home_path):
        if os.path.exists(output_file):
            contents = open(output_file).read()
            script = False
            with open(output_file, 'w') as outfile:
                for line in contents.splitlines():
                    if '<script>'in line and '</script>' in line:
                        continue
                    if '<script>' in line:
                        script = True
                        continue
                    if '</script>' in line:
                        script = False
                        continue
                    if script:
                        continue
                    outfile.write(line + '\n')
            return output_file


def apply_redactions(html_file, redactions, output_type='pdf',
                     pdf_engine='wkhtmltopdf'):

    phantom_suffix = 'html' if pdf_engine == 'wkhtmltopdf' else 'pdf'
    phantom_f = tempfile.NamedTemporaryFile(suffix='.%s' % phantom_suffix, delete=False)
    phantom_f.close()
    phantom_out = phantom_f.name

    home_path = os.path.dirname(phantom_out)

    bin_path = os.path.join(os.path.dirname(__file__), 'bin', 'phantom_redact.js')
    print(bin_path)

    arguments = ['phantomjs', bin_path, html_file, phantom_out, redactions]
    if pdf_engine != 'phantomjs':
        arguments.append('html')

    print(' '.join(arguments))
    phantom_return = call_binary(arguments, home=home_path)

    if not phantom_return:
        return
    if not os.path.exists(phantom_out):
        return

    if pdf_engine == 'phantomjs':
        return phantom_out

    output_f = tempfile.NamedTemporaryFile(suffix='.%s' % output_type, delete=False)
    output_f.close()
    output_file = output_f.name

    arguments = ['wkhtmltopdf', '--print-media-type', phantom_out, output_file]
    print(' '.join(arguments))
    wkhtmltopdf_return = call_binary(arguments, home=home_path)
    if not wkhtmltopdf_return:
        return
    if not os.path.exists(output_file):
        return
    return output_file
