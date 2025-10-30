const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require('cors');



app.use(cors({
  origin: "*"
}));

io.on('connect', (socket) => {
  console.log('a user connected');

  socket.on('join', (message) => {
    console.log(message);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use(express.static('/home/vdomasch/Documents/42git/transcendence/srcs/front/'));

app.get('/', (req, res) => {
  res.sendFile('/home/vdomasch/Documents/42git/transcendence/srcs/front/index.html');
});

server.listen(3000, () => {
  console.log('listening on 3000');
});