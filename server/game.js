const { GRID_SIZE } = require('./constants');

function createGameState() {
  return {
    players: [
      {
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
      {
        pos: {
          x: 18,
          y: 10,
        },
        vel: {
          x: 0,
          y: 0,
        },
        snake: [
          { x: 20, y: 10 },
          { x: 19, y: 10 },
          { x: 28, y: 10 },
        ],
      },
    ],
    food: {},
    gridSize: GRID_SIZE,
  };
}

function gameLoop(state) {
  if (!state) return;

  // Define the 2 players
  const playerOne = state.players[0];
  const playerTwo = state.players[1];
  
  // Move snake1
  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;
  
  // Move snake2
  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  // Check if snak bumps into grid border1
  if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE - 1 || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE - 1) {
    return 2;
  }

  // Check if snak bumps into grid border2
  if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE - 1 || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE - 1) {
    return 1;
  }

  // Check for food1
  let ate1;
  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    ate1 = true;
    randomFood(state);
  }

  // Check for food2
  let ate2;
  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    ate2 = true;
    randomFood(state);
  }

  // Snake movement1
  if (playerOne.vel.x || playerOne.vel.y) {

    // Check if snak bumped into itself
    for (let cell of playerOne.snake) {
      if (cell.x == playerOne.pos.x && cell.y == playerOne.pos.y) {
        return 2;
      }
    }
    
      // Update the rest the snake's body position
      playerOne.snake.push({ ...playerOne.pos });
      !ate1 && playerOne.snake.shift();
  }

  // Snake movement2
  if (playerTwo.vel.x || playerTwo.vel.y) {

    // Check if snak bumped into itself
    for (let cell of playerTwo.snake) {
      if (cell.x == playerTwo.pos.x && cell.y == playerTwo.pos.y) {
        return 1;
      }
    }
    
      // Update the rest the snake's body position
      playerTwo.snake.push({ ...playerTwo.pos });
      !ate2 && playerTwo.snake.shift();
  }

  // Return false if game is still going
  return false;
}

function randomFood(state) {
  // Create new food
  const food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };

  // Check if food's position is inside of the snake1
  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y == food.y) {
      return randomFood(state);
    }
  }

  // Check if food's position is inside of the snake2
  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y == food.y) {
      return randomFood(state);
    }
  }

  // Return new state
  state.food = food;
}

function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case 37: // Left
      return { x: -1, y: 0 };

    case 38: // Down
      return { x: 0, y: -1 };

    case 39: // Right
      return { x: 1, y: 0 };

    case 40: // Up
      return { x: 0, y: 1 };

    default:
      break;
  }
}

function initGame() {
  const state = createGameState();
  randomFood(state);
  return state;
}

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
};
