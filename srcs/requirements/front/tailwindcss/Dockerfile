FROM node:latest

WORKDIR /usr/src/app


#faster for cache
COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

# ???
EXPOSE 3000


CMD ["npm", "start"]