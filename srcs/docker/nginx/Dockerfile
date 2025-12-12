FROM debian:bullseye

RUN apt-get update
RUN apt install -y nginx
RUN apt install -y openssl

RUN openssl req -x509 -nodes \
    --out /etc/ssl/certs/inception.crt \
    --keyout /etc/ssl/private/inception.key \
    --subj="/C=FR/ST=IDF/L=Lyon/O=42/OU=42/CN=zigotos.42.fr/UID=zigoto"

COPY conf/default.conf /etc/nginx/conf.d/default.conf
COPY files/index.html /var/www/html/index.html

# COPY conf/default.conf /etc/nginx/sites-available/

CMD ["nginx", "-g", "daemon off;"]