import os
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


def convert_to_html(pdf_file, output_file):
    output_path = os.path.dirname(output_file)
    arguments = ['pdf2htmlEX',
        '--embed-javascript', '0',
        '--optimize-text', '1',
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


def apply_redactions(html_file, output_file, redactions):
    home_path = os.path.dirname(output_file)

    bin_path = os.path.join(os.path.dirname(__file__), 'bin', 'phantom_redact.js')
    print bin_path
    arguments = ['phantomjs', bin_path, html_file, output_file, redactions]
    print ' '.join(arguments)
    if call_binary(arguments, home=home_path):
        if os.path.exists(output_file):
            return output_file
