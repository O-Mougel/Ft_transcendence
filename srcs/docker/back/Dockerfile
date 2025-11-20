FROM alpine:3.18

RUN apk update
WORKDIR /home
RUN apk add --no-cache nodejs-current npm sqlite

RUN npm init -y
RUN npm install -g typescript
RUN npx tsc --init
RUN npm install @prisma/client fastify fastify-zod zod zod-to-json-schema @fastify/jwt
RUN npm install ts-node-dev typescript @types/node --save-dev

RUN npm install dotenv

RUN npm install sqlite3 sqlite

CMD ["npm", "run", "dev"]
