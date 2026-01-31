FROM node:20.19.6

WORKDIR /usr/src/app

COPY package.json ./
COPY tsconfig.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

CMD ["npm", "run", "start"]
