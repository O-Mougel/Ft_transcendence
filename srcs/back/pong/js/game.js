import {
  WIDTH,
  HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  BASE_SPEED,
  WIN_SCORE,
} from './config.js';

export class Game {
  constructor() {
    this.mode = 1;
    this.isGameStarted = false;
    this.speedMultiplier = 1.0;

    this.leftScore = 0;
    this.rightScore = 0;

    this.leftPaddle = {
      height: PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
      y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
      moveUp() {
        if (this.y > 0) this.y -= 10;
      },
      moveDown() {
        if (this.y + this.height < HEIGHT) this.y += 10;
      },
    };

    this.rightPaddle = {
      height: PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
      y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
      moveUp() {
        if (this.y > 0) this.y -= 10;
      },
      moveDown() {
        if (this.y + this.height < HEIGHT) this.y += 10;
      },
    };

    this.leftPaddle2 = {
      height: PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
      y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
      moveUp() {
        if (this.y > 0) this.y -= 10;
      },
      moveDown() {
        if (this.y + this.height < HEIGHT) this.y += 10;
      },
    };

    this.rightPaddle2 = {
      height: PADDLE_HEIGHT,
      width: PADDLE_WIDTH,
      y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
      moveUp() {
        if (this.y > 0) this.y -= 10;
      },
      moveDown() {
        if (this.y + this.height < HEIGHT) this.y += 10;
      },
    };

    this.ball = {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      vx: Math.random() > 0.5 ? BASE_SPEED : -BASE_SPEED,
      vy: Math.random() > 0.5 ? BASE_SPEED : -BASE_SPEED,
      radius: BALL_RADIUS,
    };
  }

  resetBall() {
    this.ball.x = WIDTH / 2;
    this.ball.y = HEIGHT / 2;
    this.ball.speed = BASE_SPEED;

    if (this.isGameStarted) {
      this.ball.vx =
        this.ball.vx < 0 ? -BASE_SPEED * this.speedMultiplier : BASE_SPEED * this.speedMultiplier;
      this.ball.vy =
        Math.random() > 0.5 ? BASE_SPEED * this.speedMultiplier : -BASE_SPEED * this.speedMultiplier;
    } else {
      this.ball.vx = Math.random() > 0.5 ? BASE_SPEED : -BASE_SPEED;
      this.ball.vy = Math.random() > 0.5 ? BASE_SPEED : -BASE_SPEED;
    }
  }

  moveBall() {
    
    const angle = Math.atan2(this.ball.vy, this.ball.vx); // atan2 gives the angle in radians
    const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy); // Calculate the current speed
    
    // Adjust the ball's velocity using the new speed and the angle
    this.ball.vx = speed * Math.cos(angle); // Set vx based on the angle and speed
    this.ball.vy = speed * Math.sin(angle); // Set vy based on the angle and speed

    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Top/bottom collision
    if (this.ball.y + this.ball.radius > HEIGHT || this.ball.y - this.ball.radius < 0) {
      this.ball.vy = -this.ball.vy;
    }

    if (this.ball.y + this.ball.radius <= HEIGHT || this.ball.y - this.ball.radius <= 0) {
      this.ball.y = Math.max(this.ball.radius, Math.min(this.ball.y, HEIGHT - this.ball.radius));
    }

    // Left paddle collision
    if (this.ball.x - this.ball.radius < this.leftPaddle.width + 10) {
      if (
        this.ball.y > this.leftPaddle.y &&
        this.ball.y < this.leftPaddle.y + this.leftPaddle.height
      ) {
        this.ball.vx = -this.ball.vx;
        this.ball.vx += 0.8;
        this.ball.vy += 0.8;
        // this.ball.speed += 1;

        const hitPos = this.ball.y - (this.leftPaddle.y + this.leftPaddle.height / 2);
        this.ball.vy = hitPos * 0.1;
      }
    }

    // Right paddle collision
    if (this.ball.x - this.ball.radius > WIDTH - 2 * this.rightPaddle.width - 20) {
      if (
        // this.ball.y > this.rightPaddle.y &&
        // this.ball.y < this.rightPaddle.y + this.rightPaddle.height
        1
      ) {
        this.ball.vx = -this.ball.vx;
        this.ball.vx -= 0.8;
        this.ball.vy -= 0.8;
        // this.ball.speed += 1;

        // const hitPos = this.ball.y - (this.rightPaddle.y + this.rightPaddle.height / 2);
        // this.ball.vy = hitPos * 0.1;
      }
    }

    // Additional paddles for mode 2
    if (this.mode === 2) {
      // Left2 paddle collision
      if (this.ball.x - this.ball.radius < WIDTH / 4 + this.leftPaddle2.width && this.ball.x - this.ball.radius > WIDTH / 4) {
        if (
          this.ball.y > this.leftPaddle2.y &&
          this.ball.y < this.leftPaddle2.y + this.leftPaddle2.height
        ) {
          this.ball.vx = -this.ball.vx;
          this.ball.vx += 0.8;
          this.ball.vy += 0.8;
  
          const hitPos = this.ball.y - (this.leftPaddle2.y + this.leftPaddle2.height / 2);
          this.ball.vy = hitPos * 0.1;
        }
      }
  
      // Right2 paddle collision
      if (this.ball.x - this.ball.radius > WIDTH * 3 / 4 - 2 * this.rightPaddle.width && this.ball.x - this.ball.radius < WIDTH * 3 / 4) {
        if (
          this.ball.y > this.rightPaddle2.y &&
          this.ball.y < this.rightPaddle2.y + this.rightPaddle2.height
        ) {
          this.ball.vx = -this.ball.vx;
          this.ball.vx -= 0.8;
          this.ball.vy -= 0.8;
  
          const hitPos = this.ball.y - (this.rightPaddle2.y + this.rightPaddle2.height / 2);
          this.ball.vy = hitPos * 0.1;
        }
      }
    }
  }

  checkScore() {
    let gameOver = false;

    if (this.ball.x - this.ball.radius < 0) {
      this.rightScore += 1;
      this.resetBall();
    } else if (this.ball.x + this.ball.radius > WIDTH) {
      this.leftScore += 1;
      this.resetBall();
    }

    if (this.leftScore >= WIN_SCORE || this.rightScore >= WIN_SCORE) {
      gameOver = true;
    }

    return gameOver;
  }

  // === public API ===

  start(speed) {
    this.isGameStarted = true;
    if (speed) {
      this.speedMultiplier = parseFloat(speed);
      this.ball.vx *= this.speedMultiplier;
      this.ball.vy *= this.speedMultiplier;
    }
  }

  stop() {
    this.isGameStarted = false;
    this.reset();
  }

  reset() {
    this.isGameStarted = false;
    this.speedMultiplier = 1.0;
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

  movePaddle(side, direction) {
    if (side === 'left') {
      if (direction === 'up') this.leftPaddle.moveUp();
      if (direction === 'down') this.leftPaddle.moveDown();
    }
    if (side === 'right') {
      if (direction === 'up') this.rightPaddle.moveUp();
      if (direction === 'down') this.rightPaddle.moveDown();
    }
    if (this.mode === 2) {
      if (side === 'left2') {
        if (direction === 'up') this.leftPaddle2.moveUp();
        if (direction === 'down') this.leftPaddle2.moveDown();
      }
      if (side === 'right2') {
        if (direction === 'up') this.rightPaddle2.moveUp();
        if (direction === 'down') this.rightPaddle2.moveDown();
      }
    }
  }

  // This is your "main" tick function
  update() {
    if (!this.isGameStarted) {
      return { gameOver: false };
    }

    this.moveBall();
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
        },
        score: { left: this.leftScore, right: this.rightScore },
      };
    }
    return {
      paddles: { left: this.leftPaddle.y / 500, right: this.rightPaddle.y / 500},
      ball: {
        x: this.ball.x / 800, y: this.ball.y / 500,
        radius: this.ball.radius / 800,
        vx: this.ball.vx, vy: this.ball.vy,
      },
      score: { left: this.leftScore, right: this.rightScore },
    };
  }
}

// Optional convenience factory if you prefer:
export function createGame() {
  return new Game();
}
