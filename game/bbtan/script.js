// BBTAN Clone - Game Logic

// DOM elements
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const UIround = document.getElementById('round');
const UIballs = document.getElementById('balls');
const UIscore = document.getElementById('score');
const UIcombo = document.getElementById('combo');

// Game constants
const W = canvas.width, H = canvas.height;
const BALL_RADIUS = 6, BALL_SPEED = 450;   // px/s
const BRICK_SIZE = 48;                      // width = height
const ROW_SPACING = 4;
let currentRound = 1;

// Helper functions
const rand = (a, b) => Math.random() * (b - a) + a;

// Ball class
class Ball {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.vx = dir.x * BALL_SPEED;
    this.vy = dir.y * BALL_SPEED;
    this.active = true;
  }

  update(dt) {
    if (!this.active) return;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Wall reflections
    if (this.x < BALL_RADIUS && this.vx < 0) {
      this.x = BALL_RADIUS;
      this.vx *= -1;
    }
    if (this.x > W - BALL_RADIUS && this.vx > 0) {
      this.x = W - BALL_RADIUS;
      this.vx *= -1;
    }
    if (this.y < BALL_RADIUS && this.vy < 0) {
      this.y = BALL_RADIUS;
      this.vy *= -1;
    }

    // Floor – stop & collect
    if (this.y > H - BALL_RADIUS) {
      this.active = false;
      this.y = H - BALL_RADIUS;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ffbe0b';
    ctx.fill();
  }
}

// Brick class
class Brick {
  constructor(col, row, hits, kind = 'normal') {
    this.x = col * (BRICK_SIZE + ROW_SPACING);
    this.y = row * (BRICK_SIZE + ROW_SPACING);
    this.hits = hits;
    this.kind = kind; // 'normal', 'plus', 'split', 'laser'
  }

  get rect() {
    return { x: this.x, y: this.y, w: BRICK_SIZE, h: BRICK_SIZE };
  }

  update(dt) {} // Bricks don't move yet

  draw() {
    // Different colors for different brick types
    let color;
    switch (this.kind) {
      case 'plus':
        color = `hsl(120 80% 55%)`; // Green for +1 ball
        break;
      case 'split':
        color = `hsl(60 80% 55%)`; // Yellow for split
        break;
      default:
        color = `hsl(${(this.hits * 35) % 360} 80% 55%)`;
    }

    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, BRICK_SIZE, BRICK_SIZE);
    ctx.fillStyle = '#000';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw different symbols for power-ups
    if (this.kind === 'plus') {
      ctx.fillText('+1', this.x + BRICK_SIZE / 2, this.y + BRICK_SIZE / 2);
    } else if (this.kind === 'split') {
      ctx.fillText('×2', this.x + BRICK_SIZE / 2, this.y + BRICK_SIZE / 2);
    } else {
      ctx.fillText(this.hits, this.x + BRICK_SIZE / 2, this.y + BRICK_SIZE / 2);
    }
  }
}

// Game state
let balls = [];
let bricks = [];
let launchPoint = { x: W / 2, y: H - BALL_RADIUS };
let aimVector = null;
let state = 'aim'; // 'aim', 'fly', 'roundEnd', 'gameOver'
let totalBallsCollected = 1; // Start with 1 ball
let combo = 0;
let score = 0;

// Input handling
let currentMousePos = null;

canvas.addEventListener('mousedown', e => {
  if (state !== 'aim') return;
  e.preventDefault();

  // Get current mouse position for aiming
  const pos = getCanvasPos(e);
  const dx = pos.x - launchPoint.x;
  const dy = pos.y - launchPoint.y;
  const len = Math.hypot(dx, dy);

  if (len > 10) { // Minimum distance to shoot
    const shootVector = { x: dx / len, y: dy / len };
    launchVolley(shootVector, totalBallsCollected);
    state = 'fly';
    aimVector = null; // Clear aim line after shooting
  }
});

canvas.addEventListener('mousemove', e => {
  if (state !== 'aim') return;
  currentMousePos = getCanvasPos(e);

  // Always show aim line pointing to cursor when in game area
  const dx = currentMousePos.x - launchPoint.x;
  const dy = currentMousePos.y - launchPoint.y;
  const len = Math.hypot(dx, dy);

  if (len > 10) { // Minimum distance to show aim line
    aimVector = { x: dx / len, y: dy / len };
  } else {
    aimVector = null;
  }
});

canvas.addEventListener('mouseleave', () => {
  currentMousePos = null;
  aimVector = null;
});

// Touch support for mobile
canvas.addEventListener('touchstart', e => {
  if (state !== 'aim') return;
  e.preventDefault();

  const touch = e.touches[0];
  const pos = getCanvasPos(touch);
  const dx = pos.x - launchPoint.x;
  const dy = pos.y - launchPoint.y;
  const len = Math.hypot(dx, dy);

  if (len > 10) {
    const shootVector = { x: dx / len, y: dy / len };
    launchVolley(shootVector, totalBallsCollected);
    state = 'fly';
    aimVector = null;
  }
});

canvas.addEventListener('touchmove', e => {
  if (state !== 'aim') return;
  e.preventDefault();

  const touch = e.touches[0];
  currentMousePos = getCanvasPos(touch);

  const dx = currentMousePos.x - launchPoint.x;
  const dy = currentMousePos.y - launchPoint.y;
  const len = Math.hypot(dx, dy);

  if (len > 10) {
    aimVector = { x: dx / len, y: dy / len };
  } else {
    aimVector = null;
  }
});

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

// Machine-gun multiball launch
function launchVolley(dir, count) {
  let i = 0;
  const timer = setInterval(() => {
    balls.push(new Ball(launchPoint.x, launchPoint.y, dir));
    if (++i === count) clearInterval(timer);
  }, 60); // 60ms delay between balls
}

// Screen shake effect
function screenshake(intensity = 6, dur = 150) {
  const start = performance.now();
  (function shake(t) {
    const n = (t - start) / dur;
    if (n >= 1) {
      canvas.style.transform = '';
      return;
    }
    const dx = (Math.random() * 2 - 1) * intensity * (1 - n);
    const dy = (Math.random() * 2 - 1) * intensity * (1 - n);
    canvas.style.transform = `translate(${dx}px,${dy}px)`;
    requestAnimationFrame(shake);
  })(start);
}

// Round management
spawnRow();

function spawnRow() {
  // Push existing bricks down
  bricks.forEach(b => b.y += BRICK_SIZE + ROW_SPACING);
  // New random row
  const cols = Math.floor(W / (BRICK_SIZE + ROW_SPACING));
  for (let c = 0; c < cols; c++) {
    if (Math.random() < 0.7) {
      let kind = 'normal';
      let hits = currentRound;

      // Add power-ups occasionally
      const powerUpChance = Math.random();
      if (powerUpChance < 0.1) { // 10% chance for +1 ball
        kind = 'plus';
        hits = 1;
      } else if (powerUpChance < 0.15) { // 5% chance for split
        kind = 'split';
        hits = 1;
      }

      bricks.push(new Brick(c, 0, hits, kind));
    }
  }
}

// Game loop
let last = performance.now();

function loop(now) {
  const dt = (now - last) / 1000;
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function update(dt) {
  if (state === 'fly') {
    balls.forEach(b => b.update(dt));
    bricks.forEach(br => checkCollision(br));
    if (balls.every(b => !b.active)) { // End of volley
      balls = []; // Collected
      combo = 0; // Reset combo when volley ends
      UIcombo.textContent = combo;
      currentRound++;
      UIround.textContent = currentRound;
      spawnRow();
      state = 'aim';
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  
  // Draw bricks
  bricks.forEach(br => br.draw());
  
  // Draw aim line
  if (aimVector) {
    ctx.beginPath();
    ctx.moveTo(launchPoint.x, launchPoint.y);
    ctx.lineTo(
      launchPoint.x + aimVector.x * 60,
      launchPoint.y + aimVector.y * 60
    );
    ctx.strokeStyle = '#888';
    ctx.stroke();
  }
  
  // Draw balls
  balls.forEach(b => b.draw());
}

// Collision detection
function checkCollision(br) {
  balls.forEach(ball => {
    if (!ball.active) return;
    const r = br.rect;
    if (
      ball.x + BALL_RADIUS > r.x &&
      ball.x - BALL_RADIUS < r.x + r.w &&
      ball.y + BALL_RADIUS > r.y &&
      ball.y - BALL_RADIUS < r.y + r.h
    ) {
      // Pick side to reflect
      const prevY = ball.y - ball.vy / 60;
      let hitHorizontal = prevY <= r.y || prevY >= r.y + r.h;
      if (hitHorizontal) ball.vy *= -1;
      else ball.vx *= -1;

      br.hits--;
      if (br.hits <= 0) {
        // Handle power-ups
        if (br.kind === 'plus') {
          totalBallsCollected++;
          UIballs.textContent = totalBallsCollected;
        } else if (br.kind === 'split') {
          // Create two new balls at ±20 degrees
          const angle = Math.atan2(ball.vy, ball.vx);
          const splitAngle = 20 * Math.PI / 180; // 20 degrees in radians

          balls.push(new Ball(ball.x, ball.y, {
            x: Math.cos(angle + splitAngle),
            y: Math.sin(angle + splitAngle)
          }));
          balls.push(new Ball(ball.x, ball.y, {
            x: Math.cos(angle - splitAngle),
            y: Math.sin(angle - splitAngle)
          }));
        }

        // Combo and score system
        combo++;
        score += 10 * combo;
        UIscore.textContent = score;
        UIcombo.textContent = combo;

        // Screen shake for big combos
        if (combo >= 3) {
          screenshake();
        }

        bricks.splice(bricks.indexOf(br), 1);
      }
    }
  });
}

// Start the game
requestAnimationFrame(loop);
