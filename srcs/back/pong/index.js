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


app.get('/', (req, res) => {
  res.send('<h1>Hello world -- </h1>');
});

let rooms = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on 3000');
});