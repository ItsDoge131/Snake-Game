const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let snake = [
  { x: 200, y: 200 },
  { x: 180, y: 200 },
  { x: 160, y: 200 }
];
let direction = { x: 1, y: 0 };
let fruit = randomFruitPosition(snake, gridSize, canvasWidth, canvasHeight);
let score = 0;
window.isPaused = false;
let gameLoopId;


let pauseKey = localStorage.getItem('pauseKey') || 'Escape';
let restartKey = localStorage.getItem('restartKey') || 'r';
let pauseGamepad = localStorage.getItem('pauseGamepad') || '0';
let restartGamepad = localStorage.getItem('restartGamepad') || '1';


const buttonNames = {
  0: 'A',
  1: 'B',
  2: 'X',
  3: 'Y',
  4: 'LB',
  5: 'RB',
  6: 'LT',
  7: 'RT',
  8: 'Back',
  9: 'Start',
  10: 'Left Stick',
  11: 'Right Stick',
  12: 'D-Pad Up',
  13: 'D-Pad Down',
  14: 'D-Pad Left',
  15: 'D-Pad Right',
  16: 'Xbox Button'
};

function getButtonDisplay(index) {
  const name = buttonNames[index] || 'Unknown';
  return `${name} (${index})`;
}


let scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);


  ctx.fillStyle = '#00FF00';
  snake.forEach(segment => {
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
  });

  ctx.fillStyle = '#FF0000';
  ctx.fillRect(fruit.x, fruit.y, gridSize, gridSize);

  
  document.getElementById('score').textContent = `Score: ${score}`;

 
  if (isPaused) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#FFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvasWidth / 2, canvasHeight / 2);
  }
}

function update() {
  const inputDirection = getInputDirection();
  if (inputDirection.x !== 0 || inputDirection.y !== 0) {
    direction = inputDirection;
  }

  const head = { x: snake[0].x + direction.x * gridSize, y: snake[0].y + direction.y * gridSize };

 
  if (head.x < 0) head.x = canvasWidth - gridSize;
  else if (head.x >= canvasWidth) head.x = 0;
  if (head.y < 0) head.y = canvasHeight - gridSize;
  else if (head.y >= canvasHeight) head.y = 0;


  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    resetGame();
    return;
  }

  snake.unshift(head);


  if (head.x === fruit.x && head.y === fruit.y) {
    score++;
    fruit = randomFruitPosition(snake, gridSize, canvasWidth, canvasHeight);
  } else {
    snake.pop();
  }
}

function resetGame() {

  if (score > 0) {
    scoreHistory.push({score: score, date: new Date().toLocaleString()});
    localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
    updateHistoryDisplay();
  }
  snake = [
    { x: 200, y: 200 },
    { x: 180, y: 200 },
    { x: 160, y: 200 }
  ];
  direction = { x: 1, y: 0 };
  fruit = randomFruitPosition(snake, gridSize, canvasWidth, canvasHeight);
  score = 0;
  
  inputDirection = { x: 0, y: 0 };
  lastInputDirection = { x: 0, y: 0 };
}

function gameLoop() {
  if (!isPaused) {
    update();
  }
  draw();
}

function togglePause() {
  isPaused = !isPaused;
  const button = document.getElementById('pauseButton');
  button.textContent = isPaused ? 'Resume' : 'Pause';
}

function restartGame() {
  if (confirm('Are you sure you want to restart the game?')) {
    resetGame();
    isPaused = false;
    const button = document.getElementById('pauseButton');
    button.textContent = 'Pause';
    
    inputDirection = { x: 0, y: 0 };
    lastInputDirection = { x: 0, y: 0 };
  }
}

document.getElementById('pauseButton').addEventListener('click', togglePause);
document.getElementById('restartButton').addEventListener('click', restartGame);

window.addEventListener('keydown', e => {
  if (document.getElementById('settingsModal').style.display !== 'block') {
    if (e.key === pauseKey) {
      togglePause();
    } else if (e.key === restartKey || e.key === restartKey.toUpperCase()) {
      restartGame();
    }
  }
});


let currentSetting = null;
let tempPauseKey = pauseKey;
let tempRestartKey = restartKey;
let tempPauseGamepad = pauseGamepad;
let tempRestartGamepad = restartGamepad;

document.getElementById('settingsButton').addEventListener('click', () => {
  document.getElementById('settingsModal').style.display = 'block';
  document.getElementById('pauseKeyInput').value = `${pauseKey} (${pauseKey.charCodeAt(0)})`;
  document.getElementById('restartKeyInput').value = `${restartKey} (${restartKey.charCodeAt(0)})`;
  document.getElementById('pauseGamepadInput').value = getButtonDisplay(parseInt(pauseGamepad));
  document.getElementById('restartGamepadInput').value = getButtonDisplay(parseInt(restartGamepad));
  tempPauseKey = pauseKey;
  tempRestartKey = restartKey;
  tempPauseGamepad = pauseGamepad;
  tempRestartGamepad = restartGamepad;
  isPaused = true;
  const button = document.getElementById('pauseButton');
  button.textContent = 'Resume';
});

document.getElementById('pauseKeyInput').addEventListener('focus', () => {
  currentSetting = 'pause';
});

document.getElementById('restartKeyInput').addEventListener('focus', () => {
  currentSetting = 'restart';
});

document.getElementById('pauseKeyInput').addEventListener('keydown', (e) => {
  e.preventDefault();
  tempPauseKey = e.key;
  document.getElementById('pauseKeyInput').value = `${tempPauseKey} (${e.keyCode})`;
});

document.getElementById('restartKeyInput').addEventListener('keydown', (e) => {
  e.preventDefault();
  tempRestartKey = e.key;
  document.getElementById('restartKeyInput').value = `${tempRestartKey} (${e.keyCode})`;
});

document.getElementById('pauseGamepadInput').addEventListener('focus', () => {
  currentSetting = 'pauseGamepad';
});

document.getElementById('restartGamepadInput').addEventListener('focus', () => {
  currentSetting = 'restartGamepad';
});


window.addEventListener('gamepadconnected', (e) => {
  console.log('Gamepad connected:', e.gamepad);
});

window.addEventListener('gamepaddisconnected', (e) => {
  console.log('Gamepad disconnected:', e.gamepad);
});

function checkGamepad() {
  const gamepads = navigator.getGamepads();
  for (let i = 0; i < gamepads.length; i++) {
    const gamepad = gamepads[i];
    if (gamepad) {
    
      if (document.getElementById('settingsModal').style.display !== 'block') {
        
        if (gamepad.buttons[12].pressed && lastInputDirection.y === 0) {
          inputDirection = { x: 0, y: -1 };
        } else if (gamepad.buttons[13].pressed && lastInputDirection.y === 0) {
          inputDirection = { x: 0, y: 1 };
        } else if (gamepad.buttons[14].pressed && lastInputDirection.x === 0) {
          inputDirection = { x: -1, y: 0 };
        } else if (gamepad.buttons[15].pressed && lastInputDirection.x === 0) {
          inputDirection = { x: 1, y: 0 };
        }

      
        const threshold = 0.5;
        if (Math.abs(gamepad.axes[0]) > threshold || Math.abs(gamepad.axes[1]) > threshold) {
          if (Math.abs(gamepad.axes[1]) > Math.abs(gamepad.axes[0])) {
            if (gamepad.axes[1] < -threshold && lastInputDirection.y === 0) {
              inputDirection = { x: 0, y: -1 };
            } else if (gamepad.axes[1] > threshold && lastInputDirection.y === 0) {
              inputDirection = { x: 0, y: 1 };
            }
          } else {
            if (gamepad.axes[0] < -threshold && lastInputDirection.x === 0) {
              inputDirection = { x: -1, y: 0 };
            } else if (gamepad.axes[0] > threshold && lastInputDirection.x === 0) {
              inputDirection = { x: 1, y: 0 };
            }
          }
        }

        
        gamepad.buttons.forEach((button, index) => {
          if (button.pressed) {
            if (index.toString() === pauseGamepad) {
              togglePause();
            } else if (index.toString() === restartGamepad) {
              restartGame();
            }
          }
        });
      } else {
        
        gamepad.buttons.forEach((button, index) => {
          if (button.pressed && currentSetting) {
            if (currentSetting === 'pauseGamepad') {
              tempPauseGamepad = index.toString();
              document.getElementById('pauseGamepadInput').value = getButtonDisplay(index);
            } else if (currentSetting === 'restartGamepad') {
              tempRestartGamepad = index.toString();
              document.getElementById('restartGamepadInput').value = getButtonDisplay(index);
            }
          }
        });
      }
    }
  }
}

setInterval(checkGamepad, 100);

document.getElementById('toGamepad').addEventListener('click', () => {
  document.getElementById('settingsModal').classList.add('show-gamepad');
});

document.getElementById('toKeyboard').addEventListener('click', () => {
  document.getElementById('settingsModal').classList.remove('show-gamepad');
});

document.getElementById('saveKeyboard').addEventListener('click', () => {
  pauseKey = tempPauseKey;
  restartKey = tempRestartKey;
  localStorage.setItem('pauseKey', pauseKey);
  localStorage.setItem('restartKey', restartKey);
  document.getElementById('settingsModal').style.display = 'none';
  isPaused = false;
  const button = document.getElementById('pauseButton');
  button.textContent = 'Pause';
  alert('Keyboard settings saved successfully!');
});

document.getElementById('cancelKeyboard').addEventListener('click', () => {
  tempPauseKey = pauseKey;
  tempRestartKey = restartKey;
  document.getElementById('pauseKeyInput').value = `${pauseKey} (${pauseKey.charCodeAt(0)})`;
  document.getElementById('restartKeyInput').value = `${restartKey} (${restartKey.charCodeAt(0)})`;
  document.getElementById('settingsModal').style.display = 'none';
  isPaused = false;
  const button = document.getElementById('pauseButton');
  button.textContent = 'Pause';
});

document.getElementById('resetKeyboard').addEventListener('click', () => {
  tempPauseKey = 'Escape';
  tempRestartKey = 'r';
  document.getElementById('pauseKeyInput').value = `${tempPauseKey} (${tempPauseKey.charCodeAt(0)})`;
  document.getElementById('restartKeyInput').value = `${tempRestartKey} (${tempRestartKey.charCodeAt(0)})`;
  document.getElementById('pauseKeyInput').readOnly = false;
  document.getElementById('restartKeyInput').readOnly = false;
  currentSetting = null;
  alert('Keyboard settings reset to defaults!');
  setTimeout(() => {
    const input = document.getElementById('pauseKeyInput');
    input.focus();
    input.select();
  }, 100);
});


document.getElementById('saveGamepad').addEventListener('click', () => {
  pauseGamepad = tempPauseGamepad;
  restartGamepad = tempRestartGamepad;
  localStorage.setItem('pauseGamepad', pauseGamepad);
  localStorage.setItem('restartGamepad', restartGamepad);
  document.getElementById('settingsModal').style.display = 'none';
  isPaused = false;
  const button = document.getElementById('pauseButton');
  button.textContent = 'Pause';
  alert('Gamepad settings saved successfully!');
});

document.getElementById('cancelGamepad').addEventListener('click', () => {
  tempPauseGamepad = pauseGamepad;
  tempRestartGamepad = restartGamepad;
  document.getElementById('pauseGamepadInput').value = getButtonDisplay(parseInt(pauseGamepad));
  document.getElementById('restartGamepadInput').value = getButtonDisplay(parseInt(restartGamepad));
  document.getElementById('settingsModal').style.display = 'none';
  isPaused = false;
  const button = document.getElementById('pauseButton');
  button.textContent = 'Pause';
});

document.getElementById('resetGamepad').addEventListener('click', () => {
  tempPauseGamepad = '0';
  tempRestartGamepad = '1';
  document.getElementById('pauseGamepadInput').value = getButtonDisplay(0);
  document.getElementById('restartGamepadInput').value = getButtonDisplay(1);
  currentSetting = null;
  alert('Gamepad settings reset to defaults!');
  setTimeout(() => {
    const input = document.getElementById('pauseGamepadInput');
    input.focus();
    input.select();
  }, 100);
});

document.querySelectorAll('.close-settings').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    document.getElementById('settingsModal').style.display = 'none';
    isPaused = false;
    const button = document.getElementById('pauseButton');
    button.textContent = 'Pause';
  });
});


document.querySelectorAll('.close-note').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    document.querySelectorAll('.note').forEach(note => {
      note.style.display = 'none';
    });
    localStorage.setItem('noteHidden', 'true');
  });
});


if (localStorage.getItem('noteHidden') === 'true') {
  document.querySelectorAll('.note').forEach(note => {
    note.style.display = 'none';
  });
}


function updateHistoryDisplay() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  scoreHistory.sort((a, b) => b.score - a.score);
  scoreHistory.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = `Score: ${entry.score} - ${entry.date}`;
    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (confirm('Delete this score?')) {
        scoreHistory.splice(index, 1);
        localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
        updateHistoryDisplay();
      }
    });
    historyList.appendChild(item);
  });
}


updateHistoryDisplay();

gameLoopId = setInterval(gameLoop, 100);
