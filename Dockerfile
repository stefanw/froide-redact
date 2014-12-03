FROM debian:sid

RUN apt-get update && apt-get install -y wget pdf2htmlex phantomjs python-pip
ADD requirements.txt /code/requirements.txt
WORKDIR /code
RUN pip install -r requirements.txt
ADD . /code/
CMD python manage.py runserver 0.0.0.0:8000
