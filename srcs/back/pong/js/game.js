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

export class Game {
  constructor() {
    this.mode = 0; // 0 = vs AI, 1 = 2 paddles, 2 = 4 paddles
    this.isGameStarted = false;

    this.leftScore = 0;
    this.rightScore = 0;
    this.AIPlayer = null;

    // --- PADDLES ---
    this.leftPaddle = {
      height: PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
      y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
      x: 10,
      direction: "none",
      moveUp() { if (this.y > 0) this.y -= BASE_PADDLE_SPEED; },
      moveDown() { if (this.y + this.height < HEIGHT) this.y += BASE_PADDLE_SPEED; },
    };

    this.rightPaddle = {
      height: PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
      y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
      x: WIDTH - (10 + PADDLE_WIDTH),
      direction: "none",
      moveUp() { if (this.y > 0) this.y -= BASE_PADDLE_SPEED; },
      moveDown() { if (this.y + this.height < HEIGHT) this.y += BASE_PADDLE_SPEED; },
    };

    // Extra paddles for mode === 2
    this.leftPaddle2 = {
      height: PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
      y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
      x: WIDTH / 4 - PADDLE_WIDTH,
      direction: "none",
      moveUp() { if (this.y > 0) this.y -= BASE_PADDLE_SPEED; },
      moveDown() { if (this.y + this.height < HEIGHT) this.y += BASE_PADDLE_SPEED; },
    };

    this.rightPaddle2 = {
      height: PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
      y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
      x: WIDTH * 3 / 4,
      direction: "none",
      moveUp() { if (this.y > 0) this.y -= BASE_PADDLE_SPEED; },
      moveDown() { if (this.y + this.height < HEIGHT) this.y += BASE_PADDLE_SPEED; },
    };

    this.ball = {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      radius: BALL_RADIUS,

      // vx/vy store direction * speed (always normalized to `speed`)
      vx: Math.random() > 0.5 ? 1 : -1,
      vy: (Math.random() * 2 - 1), // [-1, 1]

      speed: BASE_BALL_SPEED,
      lastSidePossession: null,
    };

    console.log("Paddles server positions:", this.leftPaddle.x, this.leftPaddle2.x, this.rightPaddle.x, this.rightPaddle2.x);

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

  setBallSpeed(newSpeed) {
    this.ball.speed = newSpeed;
    this.normalizeBallVelocity();
  }

  // Game lifecycle

  resetBall() {
    this.ball.x = WIDTH / 2;
    this.ball.y = HEIGHT / 2;

    this.ball.speed = BASE_BALL_SPEED;

    this.ball.vx = this.ball.vx !== 0 ? (this.ball.vx < 0 ? -1 : 1) : (Math.random() > 0.5 ? 1 : -1);
    this.ball.vy = 0;//(Math.random() * 2 - 1);

    this.normalizeBallVelocity();
    this.ball.lastSidePossession = null;
  }

  incrementBallSpeed(side) {
    console.log('Ball speed: ', this.ball.speed);
    if (side !== this.ball.lastSidePossession) {
      if (this.ball.speed < MAX_BALL_SPEED) {
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

    // Top/bottom boundary collision
    if (vy > 0) {
      // bouncing bottom
      const collision_y = HEIGHT - 5 - this.ball.radius;
      if (y0 <= collision_y && y1 >= collision_y) {
        const timeOfImpact = (collision_y - y0) / vy;
        this.ball.x = x0 + vx * timeOfImpact;
        this.ball.y = collision_y;

        this.ball.vy = -vy;
        this.normalizeBallVelocity();

        const remaining_t = 1 - timeOfImpact;
        this.ball.x += this.ball.vx * remaining_t;
        this.ball.y += this.ball.vy * remaining_t;
      }
    } else if (vy < 0) {
      // bouncing top
      const collision_y = 5 + this.ball.radius;
      if (y0 >= collision_y && y1 <= collision_y) {
        const timeOfImpact = (collision_y - y0) / vy;
        this.ball.x = x0 + vx * timeOfImpact;
        this.ball.y = collision_y;

        this.ball.vy = -vy;
        this.normalizeBallVelocity();

        const remaining_t = 1 - timeOfImpact;
        this.ball.x += this.ball.vx * remaining_t;
        this.ball.y += this.ball.vy * remaining_t;
      }
    }

    // Paddle collisions

    // Ball moving to the right -> check right paddles sides of rightPaddle, rightPaddle2, leftPaddle2 (bounce-back) 
    if (vx > 0) {
    //   if (this.handlePaddleCollisions(this.rightPaddle, 'right', x0, y0, x1, y1, vx, vy)) return; // RIGHT PADDLE (main)
    //   if (this.handleHorizontalPaddleCollision(this.rightPaddle, x0, y0, x1, y1, vx, vy)) return; // RIGHT PADDLE horizontal face
      if (this.handlePaddleCollisionPrecise(this.rightPaddle, 'right', x0, y0, vx, vy)) return; // RIGHT PADDLE (main)

      if (this.mode === 2) { // 4-paddle mode
        // if (this.handlePaddleCollisions(this.rightPaddle2, 'right', x0, y0, x1, y1, vx, vy)) return;  // RIGHT PADDLE 2
        // if (this.handleHorizontalPaddleCollision(this.rightPaddle2, x0, y0, x1, y1, vx, vy)) return;  // RIGHT PADDLE 2 horizontal face
          if (this.handlePaddleCollisionPrecise(this.rightPaddle2, 'right', x0, y0, vx, vy)) return;  // RIGHT PADDLE 2
        // if (this.handlePaddleCollisions(this.leftPaddle2, 'left', x0, y0, x1, y1, vx, vy)) return;  // LEFT PADDLE 2 (bounce-back)
        // if (this.handleHorizontalPaddleCollision(this.leftPaddle2, x0, y0, x1, y1, vx, vy)) return;  // LEFT PADDLE 2 horizontal face
          if (this.handlePaddleCollisionPrecise(this.leftPaddle2, 'left', x0, y0, vx, vy)) return;  // LEFT PADDLE 2
      }
    }

    // Ball moving to the left -> check left paddles sides of leftPaddle, leftPaddle2, rightPaddle2 (bounce-back)
    if (vx < 0) {
      // if (this.handlePaddleCollisions(this.leftPaddle, 'left', x0, y0, x1, y1, vx, vy)) return; // LEFT PADDLE (main)
      // if (this.handleHorizontalPaddleCollision(this.leftPaddle, x0, y0, x1, y1, vx, vy)) return; // LEFT PADDLE horizontal face
      if (this.handlePaddleCollisionPrecise(this.leftPaddle, 'left', x0, y0, vx, vy)) return; // LEFT PADDLE (main)

      if (this.mode === 2) { // 4-paddle mode
        // if (this.handlePaddleCollisions(this.leftPaddle2, 'left', x0, y0, x1, y1, vx, vy)) return;  // LEFT PADDLE 2
        // if (this.handleHorizontalPaddleCollision(this.leftPaddle2, x0, y0, x1, y1, vx, vy)) return;  // LEFT PADDLE 2 horizontal face
        // if (this.handlePaddleCollisions(this.rightPaddle2, 'right', x0, y0, x1, y1, vx, vy)) return;  // RIGHT PADDLE 2 (bounce-back)
        // if (this.handleHorizontalPaddleCollision(this.rightPaddle2, x0, y0, x1, y1, vx, vy)) return;  // RIGHT PADDLE 2 horizontal face
        if (this.handlePaddleCollisionPrecise(this.leftPaddle2, 'left', x0, y0, vx, vy)) return;  // LEFT PADDLE 2
        if (this.handlePaddleCollisionPrecise(this.rightPaddle2, 'right', x0, y0, vx, vy)) return;  // RIGHT PADDLE 2
      }
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

  handlePaddleCollisionPrecise(paddle, side, x0, y0, vx, vy) {
    const r = this.ball.radius;
  
    const minX = paddle.x - r;
    const minY = paddle.y - r;
    const maxX = paddle.x + paddle.width + r;
    const maxY = paddle.y + paddle.height + r;
  
    const hit = this.sweepSphereAABB(x0, y0, vx, vy, minX, minY, maxX, maxY);
    if (!hit) return false;
  
    // Move to impact point
    const impactX = x0 + vx * hit.t;
    const impactY = y0 + vy * hit.t;
    this.ball.x = impactX;
    this.ball.y = impactY;
  
    // Reflect across normal
    const dot = vx * hit.nx + vy * hit.ny; // dot product
    this.ball.vx = vx - 2 * dot * hit.nx;
    this.ball.vy = vy - 2 * dot * hit.ny;
  
    // after reflection, before normalize
    if (Math.abs(hit.nx) > 0.5) {
      // hit left/right face -> control vy from hit position
      const halfH = paddle.height / 2;
      let u = (impactY - (paddle.y + halfH)) / halfH; // [-1, 1]
      u = Math.max(-1, Math.min(1, u)); // clamp
    
      const p = 2; // exponent for curve control; higher = more curve near edges
      const curved = Math.sign(u) * Math.pow(Math.abs(u), p); // curved value in [-1, 1]
      this.ball.vy = curved * 4; // scale factor for vertical speed; higher = more vertical
    } else if (Math.abs(hit.ny) > 0.5) {
      // hit top/bottom face -> optionally control vx instead
      const halfW = paddle.width / 2;
      let u = (impactX - (paddle.x + halfW)) / halfW;
      u = Math.max(-1, Math.min(1, u));
    
      const p = 2.5;
      const curved = Math.sign(u) * Math.pow(Math.abs(u), p);
      this.ball.vx = curved * 3;
    }
  
    this.normalizeBallVelocity();
  
    // Continue remaining time
    const remaining = 1 - hit.t;
    this.ball.x += this.ball.vx * remaining;
    this.ball.y += this.ball.vy * remaining;

    // Clamp to bounds
    if (this.ball.x < 0) this.ball.x = BALL_RADIUS;
    if (this.ball.x > WIDTH) this.ball.x = WIDTH - BALL_RADIUS;
    if (this.ball.y < 0) this.ball.y = BALL_RADIUS;
    if (this.ball.y > HEIGHT) this.ball.y = HEIGHT - BALL_RADIUS;
  
    if (Math.abs(hit.nx) > 0.5) // only increment speed on left/right face hits
      this.incrementBallSpeed(side);
    return true;
  }

  movePaddles() {
    // Left paddle
    if (this.leftPaddle.direction === "up")
      this.leftPaddle.moveUp();
    else if (this.leftPaddle.direction === "down")
      this.leftPaddle.moveDown();
    
    // Right paddle
    if (this.mode !== 0) {
      if (this.rightPaddle.direction === "up")
        this.rightPaddle.moveUp();
      else if (this.rightPaddle.direction === "down")
        this.rightPaddle.moveDown();
    }
    else {
      if (this.AIPlayer.predictedY - (this.rightPaddle.y) > BASE_PADDLE_SPEED)
        this.rightPaddle.moveDown();
      else if ((this.rightPaddle.y) - this.AIPlayer.predictedY > BASE_PADDLE_SPEED)
        this.rightPaddle.moveUp();
    }
    
    if (this.mode !== 2) return;
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
    console.log('Game started', this.mode !== 2 ? '2 Paddles' : '4 Paddles');
    if (this.mode === 0) {
      if (data) {
        this.leftPaddle.name = data.player1 || "Left Player";
        this.rightPaddle.name = data.player2 || "AI Opponent";
      }
      this.AIPlayer = new AIPlayer(this.rightPaddle, this.leftPaddle, this);
      console.log('Player name:', this.leftPaddle.name, this.rightPaddle.name);
    } else if (this.mode === 1) {
      if (data) {
        this.leftPaddle.name = data.player1 || "Left Player";
        this.rightPaddle.name = data.player2 || "Right Player";
      }
      console.log('Player names:', this.leftPaddle.name, this.rightPaddle.name);
    } else {
      if (data) {
        this.leftPaddle.name = data.player1 || "Left Player 1";
        this.rightPaddle.name = data.player2 || "Right Player 1";
        this.leftPaddle2.name = data.player3 || "Left Player 2";
        this.rightPaddle2.name = data.player4 || "Right Player 2";
      }
      console.log('Player names:', this.leftPaddle.name, this.rightPaddle.name, this.leftPaddle2.name, this.rightPaddle2.name);
    }
  }

  stop() {
    this.isGameStarted = false;
    this.reset();
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

  updatePaddle(side, direction) {
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

  update() {
    if (!this.isGameStarted) {
      return { gameOver: false };
    }

    this.moveBall();
    this.movePaddles();
    const gameOver = this.checkScore();

    return { gameOver };
  }

  getState() {
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
}

export function createGame() {
  return new Game();
}
