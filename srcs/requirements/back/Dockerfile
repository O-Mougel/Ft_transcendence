FROM alpine:3.22.0

RUN apk update && apk add yarn && yarn add fastify

COPY server/server.js /home/.

WORKDIR home/

CMD ["node", "server"]
