FROM debian:bullseye

RUN apt-get update
RUN apt install -y nginx
RUN apt install -y openssl

RUN openssl req -x509 -nodes \
    --out /etc/ssl/certs/transcendence.crt \
    --keyout /etc/ssl/private/transcendence.key \
    --subj="/C=FR/ST=IDF/L=Lyon/O=42/OU=42/CN=zigotos.42.fr/UID=zigoto" #<- maybe change this 😅

COPY ./conf/default.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
