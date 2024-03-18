FROM ubuntu:latest

RUN apt update -y && \
	apt full-upgrade -y && \
	apt install git curl gnupg nginx python3.10-venv systemd -y

RUN mkdir -p /etc/apt/keyrings && \
	curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
	echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_21.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
	apt update -y && \
	apt install nodejs -y

RUN git clone https://github.com/sudonite/turbo-spork.git /tmp/repo && \
	cd /tmp/repo/shop/Frontend && \
	npm install && \
	npm install typescript && \
	npm run build && \
	rm -rf /var/www/html/* && \
	cp -R dist/* /var/www/html/ && \

RUN mkdir /app && \
	cp -R /tmp/repo/shop/Backend/* /app/ && \
	python3 -m venv env && \
	source env/bin/activate && \
	pip install -r requirements.txt && \
	pip install gunicorn && \
	cp /tmp/repo/docker/default /etc/nginx/sites-available/default && \
	service nginx start
