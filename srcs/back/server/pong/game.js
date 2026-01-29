import {
  WIDTH,
  HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  BASE_BALL_SPEED,
  WIN_SCORE,
  BASE_PADDLE_SPEED,
  STEP,
  MAX_BALL_SPEED,
} from './config.js';

import { AIPlayer } from './AI.js';

function getTournamentRound(tournament) {
  if (!tournament) return null;
  const size = tournament.size;
  const round = tournament.r;

  const roundsMap = {
    4: ["Semifinal", "Final"],
    8: ["Quaterfinal", "Semifinal", "Final"],
    16: ["Octofinal", "Quaterfinal", "Semifinal", "Final"],
  };

  const rounds = roundsMap[size];
  if (!rounds || round < 0 || round >= rounds.length) return null;
  return rounds[round];
}

class Paddle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.direction = "none";
  }

  moveUp() {
    if (this.y > 0) this.y -= BASE_PADDLE_SPEED;
  }

  moveDown() {
    if (this.y + this.height < HEIGHT) this.y += BASE_PADDLE_SPEED;
  }
}

export class Game {
  constructor() {
    this.mode = 0; // 0 = vs AI, 1 = 2 paddles, 2 = 4 paddles, 3 = ranked
    this.isGameStarted = false;

    this.leftScore = 0;
    this.rightScore = 0;
    this.nbExchanges = 0;
    this.longestStreak = 0;
    this.AIPlayer = null;
    this.tournamentId = null;
    this.tournamentRound = null;
    this.persistMatch = true;
    this.mainTournamentPlayer = null;

    this.player1 = null;
    this.player2 = null;

    this.startTime = null;

    this.id = null; // game unique id, set by GameManager
    

    this.leftPaddle = new Paddle(10, HEIGHT / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
    this.rightPaddle = new Paddle(WIDTH - (10 + PADDLE_WIDTH), HEIGHT / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Extra paddles for mode === 2
    this.leftPaddle2 = new Paddle(WIDTH / 4 - PADDLE_WIDTH, HEIGHT / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
     this.rightPaddle2 = new Paddle(WIDTH * 3 / 4, HEIGHT / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);

    this.ball = {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      radius: BALL_RADIUS,

      // vx/vy store direction * speed (always normalized to 'speed')
      vx: Math.random() > 0.5 ? 1 : -1,
      vy: (Math.random() - 0.5) * 0.1, // small initial vertical component

      speed: BASE_BALL_SPEED,
      lastSidePossession: null,
    };

    this.normalizeBallVelocity();
  }

  // Single-speed utilities

  normalizeBallVelocity() {
    const mag = Math.hypot(this.ball.vx, this.ball.vy);
    if (mag < 1e-8) {
      // fallback if ever degenerate
      this.ball.vx = this.ball.speed;
      this.ball.vy = 0;
      return;
    }
    const s = this.ball.speed / mag;
    this.ball.vx *= s;
    this.ball.vy *= s;
  }


  // Game lifecycle

  resetBall() {
    this.ball.x = WIDTH / 2;
    this.ball.y = HEIGHT / 2;

    this.ball.speed = BASE_BALL_SPEED;

    this.ball.vx = this.ball.vx !== 0 ? (this.ball.vx < 0 ? -1 : 1) : (Math.random() > 0.5 ? 1 : -1);
    this.ball.vy = (Math.random() - 0.5) * 0.1;

    this.normalizeBallVelocity();
    this.ball.lastSidePossession = null;
    if (this.longestStreak < this.nbExchanges)
      this.longestStreak = this.nbExchanges;
    this.nbExchanges = 0;
  }

  incrementNbExchanges() {
    this.nbExchanges += 1;
    if (this.nbExchanges > this.longestStreak) this.longestStreak = this.nbExchanges;
  }

  incrementBallSpeed(side) {
    console.log('Ball speed: ', this.ball.speed);
    if (side !== this.ball.lastSidePossession) { // only increase speed if the ball bounces on the opposite side paddle
      if (this.ball.speed < MAX_BALL_SPEED) {
        this.incrementNbExchanges();
        this.ball.speed += STEP;
        this.normalizeBallVelocity();
      }
      this.ball.lastSidePossession = side;
    }
  }

  checkScore() {
    let gameOver = false;

    // Right wall -> left scores
    if (this.ball.x > WIDTH) {
      this.leftScore += 1;
      this.resetBall();
    }

    // Left wall -> right scores
    if (this.ball.x < 0) {
      this.rightScore += 1;
      this.resetBall();
    }

    if (this.leftScore >= WIN_SCORE || this.rightScore >= WIN_SCORE) {
      gameOver = true;
    }

    return gameOver;
  }

  // Core physics tick

  moveBall() {
    const x0 = this.ball.x;
    const y0 = this.ball.y;

    // velocities are always (direction * speed)
    const vx = this.ball.vx;
    const vy = this.ball.vy;

    const x1 = x0 + vx;
    const y1 = y0 + vy;

    // Move first (then do precise collision reposition like you already do)
    this.ball.x = x1;
    this.ball.y = y1;

    // Boundary collisions (top/bottom)
    this.boundaryCollision();

    // Paddle collisions
    // Ball moving to the right -> check right paddles sides of rightPaddle, rightPaddle2, leftPaddle2 (bounce-back) 
    if (vx > 0) {
      if (this.handleBallPaddleCollision(this.rightPaddle, 'right', x0, y0, vx, vy)) return; // RIGHT PADDLE (main)

      if (this.mode === 2) { // 4-paddle mode
          if (this.handleBallPaddleCollision(this.rightPaddle2, 'right', x0, y0, vx, vy)) return;  // RIGHT PADDLE 2
          if (this.handleBallPaddleCollision(this.leftPaddle2, 'left', x0, y0, vx, vy)) return;  // LEFT PADDLE 2
      }
    }

    // Ball moving to the left -> check left paddles sides of leftPaddle, leftPaddle2, rightPaddle2 (bounce-back)
    if (vx < 0) {
      if (this.handleBallPaddleCollision(this.leftPaddle, 'left', x0, y0, vx, vy)) return; // LEFT PADDLE (main)

      if (this.mode === 2) { // 4-paddle mode
        if (this.handleBallPaddleCollision(this.leftPaddle2, 'left', x0, y0, vx, vy)) return;  // LEFT PADDLE 2
        if (this.handleBallPaddleCollision(this.rightPaddle2, 'right', x0, y0, vx, vy)) return;  // RIGHT PADDLE 2
      }
    }    
  }

  boundaryCollision() {
    const top = 5 + this.ball.radius;
    const bottom = HEIGHT - 5 - this.ball.radius;

    if (this.ball.y < top) { // top collision
      const penetrationDelta = top - this.ball.y;
      this.ball.y = top + penetrationDelta;   // mirror back inside
      this.ball.vy = -this.ball.vy;
      this.normalizeBallVelocity();
    } else if (this.ball.y > bottom) { // bottom collision
      const penetrationDelta = this.ball.y - bottom;
      this.ball.y = bottom - penetrationDelta; // mirror back inside
      this.ball.vy = -this.ball.vy;
      this.normalizeBallVelocity();
    }
  }

  sweepSphereAABB(x0, y0, vx, vy, minX, minY, maxX, maxY) {
    const epsilon = 1e-12; // small value to avoid division by zero

    let timeEntryX = -Infinity, timeExitX = Infinity;
    if (Math.abs(vx) < epsilon) { // moving parallel to Y axis
      if (x0 < minX || x0 > maxX) return null;
    } else {
      const tx1 = (minX - x0) / vx;
      const tx2 = (maxX - x0) / vx;
      timeEntryX = Math.min(tx1, tx2); // earliest time of impact on X axis
      timeExitX  = Math.max(tx1, tx2); // latest time of leaving on X axis
    }

    let timeEntryY = -Infinity, timeExitY = Infinity;
    if (Math.abs(vy) < epsilon) { // moving parallel to X axis
      if (y0 < minY || y0 > maxY) return null;
    } else {
      const ty1 = (minY - y0) / vy;
      const ty2 = (maxY - y0) / vy;
      timeEntryY = Math.min(ty1, ty2); // earliest time of impact on Y axis
      timeExitY  = Math.max(ty1, ty2); // latest time of leaving on Y axis
    }

    const entry = Math.max(timeEntryX, timeEntryY); // earliest time of impact, both axes need to be colliding
    const exit  = Math.min(timeExitX, timeExitY); // latest time of leaving, either axis leaves

    if (entry > exit || exit < 0 || entry > 1) return null;

    const t = Math.max(0, entry); // clamp to [0, 1]

    let nx = 0, ny = 0;
    if (timeEntryX > timeEntryY) nx = (vx > 0) ? -1 : 1; // hit left/right face
    else                   ny = (vy > 0) ? -1 : 1; // hit top/bottom face

    return { t, nx, ny };
  }

  handleBallPaddleCollision(paddle, side, x0, y0, vx, vy) {
  const r = this.ball.radius;
  
  // Define the bounding box of the paddle
  const minX = paddle.x - r;
  const minY = paddle.y - r;
  const maxX = paddle.x + paddle.width + r;
  const maxY = paddle.y + paddle.height + r;


  if (x0 >= minX && x0 <= maxX && y0 >= minY && y0 <= maxY) return false; // if ball starts inside paddle, ignore collision

  const hit = this.sweepSphereAABB(x0, y0, vx, vy, minX, minY, maxX, maxY);
  if (!hit) return false;

  // Move the ball impact point
  const impactX = x0 + vx * hit.t;
  const impactY = y0 + vy * hit.t;
  this.ball.x = impactX;
  this.ball.y = impactY;

  // Reflect
  const dot = vx * hit.nx + vy * hit.ny; // Dot product to get the angle of reflection
  this.ball.vx = vx - 2 * dot * hit.nx;
  this.ball.vy = vy - 2 * dot * hit.ny;

  // After reflection, handle the curve based on the paddle's edge
  if (Math.abs(hit.nx) > 0.5) { // Horizontal bounce (left/right face)
    const halfHeight = paddle.height / 2;
    let u = (impactY - (paddle.y + halfHeight)) / halfHeight; // [-1, 1]
    u = Math.max(-1, Math.min(1, u)); // clamp

    const p = 2; // Exponent for curve control (higher = more curve near edges)
    const curve = Math.sign(u) * Math.pow(Math.abs(u), p); // curve factor
    this.ball.vy = curve * 4; // Adjust the vertical speed (higher = more vertical)
  } else if (Math.abs(hit.ny) > 0.5) { // Vertical bounce (top/bottom face)
    // Handle horizontal paddle curve effect (influencing the bounce angle)
    const halfWidth = paddle.width / 2;
    let u = (impactX - (paddle.x + halfWidth)) / halfWidth;
    u = Math.max(-1, Math.min(1, u));

    const p = 2.5; // Exponent for curve control
    const curve = Math.sign(u) * Math.pow(Math.abs(u), p);
    this.ball.vx = curve * 3; // Adjust the horizontal speed
  }

  // Normalize the velocity of the ball after the reflection
  this.normalizeBallVelocity();

  // Continue ball movement during remaining time
  const remaining = 1 - hit.t;
  this.ball.x += this.ball.vx * remaining;
  this.ball.y += this.ball.vy * remaining;

  // Clamp the ball within the bounds
  if (this.ball.x < 0) this.ball.x = 5 + BALL_RADIUS;
  if (this.ball.x > WIDTH) this.ball.x = WIDTH - BALL_RADIUS;
  if (this.ball.y < 0) this.ball.y = BALL_RADIUS;
  if (this.ball.y > HEIGHT) this.ball.y = HEIGHT - BALL_RADIUS;

  // Increase ball speed after a successful bounce
  if (Math.abs(hit.nx) > 0.5) this.incrementBallSpeed(side);

  return true;
}


  movePaddles() {
    // Left paddle
    if (this.leftPaddle.direction === "up")
      this.leftPaddle.moveUp();
    else if (this.leftPaddle.direction === "down")
      this.leftPaddle.moveDown();
    
    // Right paddle
    if (this.rightPaddle.direction === "up")
      this.rightPaddle.moveUp();
    else if (this.rightPaddle.direction === "down")
      this.rightPaddle.moveDown();
    
    if (this.mode !== 2) return; // not 4-paddle mode

    // Left paddle 2
    if (this.leftPaddle2.direction === "up")
      this.leftPaddle2.moveUp();
    else if (this.leftPaddle2.direction === "down")
      this.leftPaddle2.moveDown();
    
    // Right paddle 2
    if (this.rightPaddle2.direction === "up")
      this.rightPaddle2.moveUp();
    else if (this.rightPaddle2.direction === "down")
      this.rightPaddle2.moveDown();
  }

  start(data) {
    this.isGameStarted = true;
    this.tournamentId = data?.tournament?.tournamentId || null;
    if (this.tournamentId)
      this.tournamentRound = getTournamentRound(data?.tournament);
    const gameMode = ["AI", "2P", "4P", "RANKED"];
    console.log('Game started', gameMode[data.mode]);
    if (this.mode === 0) {
      this.AIPlayer = new AIPlayer(this.rightPaddle, this.leftPaddle, this);
    }
    this.startTime = Date.now() / 1000;
    this.normalizeBallVelocity();
  }

  stop() {
    this.isGameStarted = false;
    this.reset();
    this.startTime = null;
    // delete this.AIPlayer;
  }

  reset() {
    this.isGameStarted = false;

    this.resetBall();

    this.leftPaddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    this.rightPaddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;

    if (this.mode === 2) {
      this.leftPaddle2.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
      this.rightPaddle2.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    }

    this.leftScore = 0;
    this.rightScore = 0;
  }

  updatePaddleDirection(side, direction) {
    if (side === 'left') {
      if (direction === 'up') this.leftPaddle.direction = "up";
      if (direction === 'down') this.leftPaddle.direction = "down";
      if (direction === 'none') this.leftPaddle.direction = "none";
    }
    if (side === 'right') {
      if (direction === 'up') this.rightPaddle.direction = "up";
      if (direction === 'down') this.rightPaddle.direction = "down";
      if (direction === 'none') this.rightPaddle.direction = "none";
    }

    if (this.mode !== 2) return;

    if (side === 'left2') {
      if (direction === 'up') this.leftPaddle2.direction = "up";
      if (direction === 'down') this.leftPaddle2.direction = "down";
      if (direction === 'none') this.leftPaddle2.direction = "none";
    }
    if (side === 'right2') {
      if (direction === 'up') this.rightPaddle2.direction = "up";
      if (direction === 'down') this.rightPaddle2.direction = "down";
      if (direction === 'none') this.rightPaddle2.direction = "none";
    }
  }

  // Main tick

  updateGameState() {
    if (!this.isGameStarted) {
      return { gameOver: false };
    }

    this.moveBall();
    if (this.mode === 0)
      this.AIPlayer.updateDirection(); // AI updates its paddle direction; should only be called once per frame?
    this.movePaddles();
    const gameOver = this.checkScore();

    return { gameOver };
  }

  getCurrentGameState() {
    if (this.mode === 2) {
      return {
        paddles: {
          left: this.leftPaddle.y / 500,
          right: this.rightPaddle.y / 500,
          left2: this.leftPaddle2.y / 500,
          right2: this.rightPaddle2.y / 500,
        },
        ball: {
          x: this.ball.x / 800,
          y: this.ball.y / 500,
          radius: this.ball.radius / 800,
          vx: this.ball.vx,
          vy: this.ball.vy,
          speed: this.ball.speed,
        },
        score: { left: this.leftScore, right: this.rightScore },
      };
    }
    else {
      return {
        paddles: {
          left: this.leftPaddle.y / 500,
          right: this.rightPaddle.y / 500,
        },
        ball: {
          x: this.ball.x / 800,
          y: this.ball.y / 500,
          radius: this.ball.radius / 800,
          vx: this.ball.vx,
          vy: this.ball.vy,
          speed: this.ball.speed,
        },
        score: { left: this.leftScore, right: this.rightScore },
      };
    }
  }

  getDuration() {
    return Date.now() / 1000 - this.startTime;
  }
}

export function createGame() {
  return new Game();
}