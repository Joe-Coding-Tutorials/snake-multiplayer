const socket = require('socket.io');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { gameLoop, getUpdatedVelocity, initGame } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeId } = require('./utils');

const server = http.createServer((req, res) => {
  if (req.url == '/') {
    fs.readFile(path.join(__dirname, '..', 'frontend', 'index.html'), (err, data) => {
      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    });
  }
  if (req.url == '/index.js') {
    fs.readFile(path.join(__dirname, '..', 'frontend', 'index.js'), (err, data) => {
      res.end(data);
    });
  }
});

const io = socket(server);

const state = {};
const clientRooms = {};

io.on('connection', client => {
  client.on('keyDown', handleKeyDown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(gameCode) {
    const room = io.sockets.adapter.rooms.get(gameCode);

    const allUsers = [];
    if (room) {
      room.forEach(user => allUsers.push(user));
    }

    let numClients = 0;
    if (allUsers.length) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownGame');
      return;
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = gameCode;

    client.join(gameCode);
    client.number = 2;
    client.emit('init', 2);

    startGameInterval(gameCode);
  }

  function handleNewGame() {
    let roomName = makeId(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);

    // console.log(state);
  }

  function handleKeyDown(keyCode) {
    const roomName = clientRooms[client.id];

    if (!roomName) return;

    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.err(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if (!winner) {
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(roomName, state) {
  io.sockets.in(roomName).emit('gameState', JSON.stringify(state));
}

function emitGameOver(roomName, winner) {
  io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }));
}

server.listen(3000, '0.0.0.0');
