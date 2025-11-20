FROM node:latest

WORKDIR /usr/src/app


#faster for cache
COPY front/package.json ./
COPY front/package-lock.json ./
COPY front/tsconfig.json ./

RUN npm ci
RUN npm install -g nodemon

# COPY . .

EXPOSE 3001


CMD ["npm", "start"]
