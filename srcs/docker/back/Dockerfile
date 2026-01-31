FROM node:20-alpine

WORKDIR /home

RUN apk add --no-cache bash sqlite openssl

ENV DATABASE_URL="file:./dev.db"

COPY package.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npx prisma migrate dev --name init

CMD ["npm", "run", "start"]
