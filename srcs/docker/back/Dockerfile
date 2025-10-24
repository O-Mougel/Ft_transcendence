FROM node:alpine

RUN apk update
RUN apk add yarn
RUN yarn add fastify @fastify/mysql

WORKDIR home/

CMD ["tail", "-f"]
#CMD ["node", "server"]
