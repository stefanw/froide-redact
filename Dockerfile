FROM debian:sid

RUN apt-get update && apt-get install -y wget pdf2htmlex libjpeg8 libssl1.0.0 xfonts-75dpi fontconfig libx11-6 libxext6 libxrender1 xfonts-base npm python-pip
RUN apt-get install -y nodejs && ln -s /usr/bin/nodejs /usr/bin/node
RUN npm install phantomjs && ln -s /node_modules/phantomjs/bin/phantomjs /usr/local/bin/phantomjs
RUN wget "http://download.gna.org/wkhtmltopdf/0.12/0.12.2.1/wkhtmltox-0.12.2.1_linux-wheezy-amd64.deb" && dpkg -i wkhtmltox-0.12.2.1_linux-wheezy-amd64.deb
ADD requirements.txt /code/requirements.txt
WORKDIR /code
RUN pip install -U -r requirements.txt
ADD . /code/
CMD python manage.py runserver 0.0.0.0:8000
