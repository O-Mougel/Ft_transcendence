FROM node:20.19.6

WORKDIR /usr/src/app

#faster for cache
COPY package.json ./
COPY tsconfig.json ./

# RUN npm ci
RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start"]
