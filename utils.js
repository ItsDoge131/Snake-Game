// utils.js - Utility functions for Snake Game (e.g., random fruit position, collision detection, etc.)

function randomFruitPosition(snake, gridSize, canvasWidth, canvasHeight) {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize
    };
  } while (snake.some(segment => segment.x === position.x && segment.y === position.y));
  return position;
}
