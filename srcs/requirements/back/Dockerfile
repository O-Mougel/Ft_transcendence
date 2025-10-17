FROM node:alpine

RUN apk update
RUN apk add yarn
RUN yarn add fastify 

COPY server/* /home/.

WORKDIR home/

#CMD ["tail", "-f"]
CMD ["node", "server"]
