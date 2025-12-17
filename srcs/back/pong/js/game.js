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

export class Game {
  constructor() {
    this.mode = 1; // 1 = 2 paddles, 2 = 4 paddles
    this.isGameStarted = false;

    this.leftScore = 0;
    this.rightScore = 0;

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
      vy: 0, //(Math.random() * 2 - 1), // [-1, 1]

      speed: BASE_BALL_SPEED,
      lastSidePossession: null,
    };

    console.log("Paddles server positions:", this.leftPaddle.x, this.leftPaddle2.x, this.rightPaddle.x, this.rightPaddle2.x);

    this.normalizeBallVelocity();
  }

  // ======================
  // Single-speed utilities
  // ======================
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

  // ==============
  // Game lifecycle
  // ==============
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
        this.ball.speed = Math.min(MAX_BALL_SPEED, this.ball.speed + STEP);
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

  // =================
  // Core physics tick
  // =================
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
      const collision_y = 10 + this.ball.radius;
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
      if (this.handlePaddleCollisions(this.rightPaddle, 'right', x0, y0, x1, y1, vx, vy)) return; // RIGHT PADDLE (main)

      if (this.mode === 2) { // 4-paddle mode
        if (this.handlePaddleCollisions(this.rightPaddle2, 'right', x0, y0, x1, y1, vx, vy)) return;  // RIGHT PADDLE 2
        if (this.handlePaddleCollisions(this.leftPaddle2, 'left', x0, y0, x1, y1, vx, vy)) return;  // LEFT PADDLE 2 (bounce-back)
      }
    }

    // Ball moving to the left -> check left paddles sides of leftPaddle, leftPaddle2, rightPaddle2 (bounce-back)
    if (vx < 0) {
      if (this.handlePaddleCollisions(this.leftPaddle, 'left', x0, y0, x1, y1, vx, vy)) return; // LEFT PADDLE (main)

      if (this.mode === 2) { // 4-paddle mode
        if (this.handlePaddleCollisions(this.leftPaddle2, 'left', x0, y0, x1, y1, vx, vy)) return;  // LEFT PADDLE 2
        if (this.handlePaddleCollisions(this.rightPaddle2, 'right', x0, y0, x1, y1, vx, vy)) return;  // RIGHT PADDLE 2 (bounce-back)
      }
    }    
  }

  handlePaddleCollisions(paddle, side, x0, y0, x1, y1, vx, vy) {
  	const collision_x = (vx > 0) ? (paddle.x - this.ball.radius) : (paddle.x + this.ball.radius + paddle.width);
    // check if ball crosses paddle x face this frame
    if (!((vx > 0) ? (x0 <= collision_x && x1 >= collision_x) : (x0 >= collision_x && x1 <= collision_x))) return false;
    
    const timeOfImpact = (collision_x - x0) / vx;
    const collision_y = y0 + vy * timeOfImpact;
  
    // check if within paddle vertical bounds
  	if (collision_y < paddle.y || collision_y > paddle.y + paddle.height) return false
  
    // collision happens at time t
  	this.ball.x = collision_x;
  	this.ball.y = collision_y;
  
    // reflect horizontally
  	this.ball.vx = -vx;
  
    // adjust vertical velocity based on where the ball hit the paddle
  	const hitPos = collision_y - (paddle.y + paddle.height / 2);
  	this.ball.vy = hitPos * 0.1;
  
  	this.normalizeBallVelocity();
  
    // move remaining time after collision
  	const remaining_t = 1 - timeOfImpact;
  	this.ball.x += this.ball.vx * remaining_t;
  	this.ball.y += this.ball.vy * remaining_t;
  
  	this.incrementBallSpeed(side);
    return true;
  }

  movePaddles() {
    // Left paddle
    if (this.leftPaddle.direction === "up") {
      this.leftPaddle.moveUp();
    } else if (this.leftPaddle.direction === "down") {
      this.leftPaddle.moveDown();
    }
    
    // Right paddle
    if (this.rightPaddle.direction === "up") {
      this.rightPaddle.moveUp();
    } else if (this.rightPaddle.direction === "down") {
      this.rightPaddle.moveDown();
    }
    
    if (this.mode !== 2) return;
    // Left paddle 2
    if (this.leftPaddle2.direction === "up") {
      this.leftPaddle2.moveUp();
    } else if (this.leftPaddle2.direction === "down") {
      this.leftPaddle2.moveDown();
    }
    
    // Right paddle 2
    if (this.rightPaddle2.direction === "up") {
      this.rightPaddle2.moveUp();
    } else if (this.rightPaddle2.direction === "down") {
      this.rightPaddle2.moveDown();
    }
  }

  start(data) {
    this.isGameStarted = true;
    console.log('Game started', this.mode === 1 ? '2 Paddles' : '4 Paddles');
    if (this.mode === 1) {
      if (data) {
        this.leftPaddle.name = data.player1 || "Left Player";
        this.rightPaddle.name = data.player2 || "Right Player";
      }
      console.log('Player names:', this.leftPaddle.name, this.rightPaddle.name);
    } else if (this.mode === 2) {
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

    if (this.mode === 2) {
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
