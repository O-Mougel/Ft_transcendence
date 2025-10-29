FROM node:alpine

RUN apk update
RUN apk add yarn
RUN yarn add fastify 
RUN yarn add nodemon --save-dev
RUN yarn add zod
RUN yarn add sqlite3

WORKDIR home/server

CMD ["tail", "-f"]
#CMD ["node", "server"]
#CMD ["yarn", "run", "dev"]
