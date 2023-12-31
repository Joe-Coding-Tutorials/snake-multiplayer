const BG_COLOR = '#231f20';
const SNAKE_COLOR = '#c2c2c2';
const FOOD_COLOR = '#e66916';

const socket = io('/');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameButton = document.getElementById('newGameButton');
const joinGameButton = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameButton.addEventListener('click', newGame);
joinGameButton.addEventListener('click', joinGame);

function newGame() {
  socket.emit('newGame');
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

const gameState = {
  player: {
    pos: {
      x: 3,
      y: 10,
    },
    vel: {
      x: 1,
      y: 0,
    },
    snake: [
      { x: 1, y: 10 },
      { x: 2, y: 10 },
      { x: 3, y: 10 },
    ],
  },
  food: {
    x: 7,
    y: 7,
  },
  gridSize: 20,
};

function init() {
  initialScreen.style.display = 'none';
  gameScreen.style.display = 'block';

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);

  gameActive = true;
}

function keydown(e) {
  socket.emit('keyDown', e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridSize = state.gridSize;
  const size = canvas.width / gridSize;

  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOR);
  paintPlayer(state.players[1], size, 'red');
}

function paintPlayer(playerState, size, color) {
  const snake = playerState.snake;

  ctx.fillStyle = color;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

// paintGame(gameState);

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) return;

  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) return;

  data = JSON.parse(data);

  if (data.winner === playerNumber) {
    alert('You win!');
  } else {
    alert('You lose.');
  }

  gameActive = false;
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
  reset();
  alert('Unknown Game Code');
}

function handleTooManyPlayers() {
  reset();
  alert('Game already full');
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  gameCodeDisplay.innerText = '';
  initialScreen.style.display = 'block';
  gameScreen.style.display = 'none';
}
