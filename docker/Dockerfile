FROM ubuntu:latest

SHELL ["/bin/bash", "-c"]

ENV TZ=Europe/Budapest
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 80

RUN apt-get update -y && \
	apt-get full-upgrade -y && \
	apt-get install git curl wget nano gnupg nginx python3.10-venv unzip socat php php-cli php-fpm php-gd php-mbstring php-xml php-mysql php-pgsql mariadb-server -y

RUN mkdir -p /etc/apt/keyrings && \
	curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
	echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_21.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
	apt-get update -y && \
	apt-get install nodejs -y

RUN git clone https://github.com/sudonite/turbo-spork.git /tmp/repo && \
	cd /tmp/repo/shop/Frontend && \
	npm install && \
	npm install typescript && \
	npm run build && \
	rm -rf /var/www/html/* && \
	cp -R dist/* /var/www/html/

RUN mkdir /app && \
	cp -R /tmp/repo/shop/Backend/* /app/ && \
	python3 -m venv env && \
	source env/bin/activate && \
	pip install -r /app/requirements.txt && \
	pip install gunicorn && \
	cp /tmp/repo/docker/default /etc/nginx/sites-available/default && \
	cd /app && \

RUN mkdir /var/www/forum && \
	cd /var/www/forum && \
	wget https://resources.mybb.com/downloads/mybb_1837.zip && \
	unzip mybb_1837.zip && \
	mv /var/www/forum/Upload/* /var/www/forum && \
	rm mybb_1837.zip && \
	rmdir Upload && \
	# CHANGE THIS TO 127.0.0.1
	# ADD DB mysql -u root -e "CREATE DATABASE forum;" && \
	cd /var/www/forum && \
	php-fpm8.1 -R && \
	service nginx start && \
	gunicorn --bind 0.0.0.0:8000 backend.wsgi