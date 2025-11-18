FROM node:latest

WORKDIR /usr/src/app


#faster for cache
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./

RUN npm ci

# ???
EXPOSE 3001


CMD ["npm", "start"]