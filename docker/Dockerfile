FROM ubuntu:latest

RUN ln -sf /usr/share/zoneinfo/Europe/Budapest /etc/localtime && \
	echo Europe/Budapest > /etc/timezone

RUN apt-get update -y && \
    apt-get full-upgrade -y && \
    apt-get remove --purge apache2 -y && \
    apt-get install git ca-certificates curl gnupg nginx php php-fpm -y

RUN mkdir -p /etc/apt/keyrings && \
	curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
	echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_21.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
	apt-get update && \
	apt-get install nodejs -y

RUN service nginx start && \
    rm -rf /var/www/html && \
    mkdir -p "/var/www/{shop,forum}"

RUN git clone https://github.com/sudonite/turbo-spork.git /tmp/turbo-spork && \
	cd /tmp/turbo-spork/shop/Frontend && \
	npm install && \
	npm run build
