FROM ubuntu:latest

SHELL ["/bin/bash", "-c"]

EXPOSE 80

ENV TZ=Europe/Budapest
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

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
	mkdir /var/www/shop && \
	cp -R dist/* /var/www/shop/

RUN mkdir /var/www/forum && \
	cd /var/www/forum && \
	wget https://resources.mybb.com/downloads/mybb_1837.zip && \
	unzip mybb_1837.zip && \
	mv /var/www/forum/Upload/* /var/www/forum && \
	rm mybb_1837.zip && \
	rmdir Upload

RUN cp /tmp/repo/docker/default /etc/nginx/sites-available/default && \
	chmod -R 0755 /var/www && \
	chown -R www-data:www-data /var/www

RUN mkdir /app && \
	cp -R /tmp/repo/shop/Backend/* /app/ && \
	cd /app && \
	python3 -m venv env && \
	source env/bin/activate && \
	pip install -r /app/requirements.txt && \
	pip install gunicorn && \ 
	cd /var/www/forum && \
	php-fpm8.1 -R -D && \
	service nginx start && \
	cd /app && \
	service mariadb start && \
	mariadb -e "GRANT ALL ON *.* TO 'root'@'localhost' IDENTIFIED BY 'SuperSecurePassword' WITH GRANT OPTION;" && \
	mysql -u root -pSuperSecurePassword -e "FLUSH PRIVILEGES; CREATE DATABASE IF NOT EXISTS forum;" && \
	python manage.py runserver 0.0.0.0:8000

EXPOSE 80
