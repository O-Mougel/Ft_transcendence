FROM nginx:stable-alpine

RUN apk add --no-cache openssl

RUN openssl req -x509 -nodes \
    --out /etc/ssl/certs/inception.crt \
    --keyout /etc/ssl/private/inception.key \
    --subj="/C=FR/ST=IDF/L=Lyon/O=42/OU=42/CN=vdomasch.42.fr/UID=vdomasch"


COPY conf/default.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]