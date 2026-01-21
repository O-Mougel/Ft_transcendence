import {
  HEIGHT,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  BASE_PADDLE_SPEED,
} from './config.js';

export class AIPlayer {
  constructor(paddle, opponent, game) {
	this.paddle = paddle;
	this.opponent = opponent;
	this.game = game;
	this.speed = BASE_PADDLE_SPEED;
	this.predictedY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
	this.aimError = 0;
	this.lastApproaching = false;
  }

  _updatePrediction() {
	const ball = this.game.ball;

	const approaching = ball.vx > 0;

	// When the ball just started approaching, pick a new error (one roll per rally)
  	if (approaching && !this.lastApproaching) {
  	  	const speed = Math.hypot(ball.vx, ball.vy);
  		const s = (speed - 3) / 12;
  		const maxErr = 3 + 25 * (s * s); // 3px..28px
  		this.aimError = (Math.random() * 2 - 1) * maxErr;         // can be +/- ; bigger at high speed
  	}

	this.lastApproaching = approaching;
	if (!approaching) {
		let opponentCenterY = this.opponent.y + PADDLE_HEIGHT / 2; 
		// if (opponentCenterY < HEIGHT / 2) // Ball going away, position paddle based on opponent
		// 	this.predictedY = HEIGHT * 3 / 8 - PADDLE_HEIGHT / 2; 
		// else if (opponentCenterY > HEIGHT / 2)
			this.predictedY = (opponentCenterY - 250) * 0.4 + (HEIGHT - PADDLE_HEIGHT) / 2;
		return;
	}

	const targetX = this.paddle.x - BALL_RADIUS;
	let predictedY = this.ballTrajectoryPrevision(ball, targetX);
	let opposedAdjustment = (this.opponent.y + PADDLE_HEIGHT / 2 > HEIGHT / 2) ? -25 : (this.opponent.y + PADDLE_HEIGHT / 2 < HEIGHT / 2) ? 25 : 0;
	
	predictedY -= PADDLE_HEIGHT / 2 + opposedAdjustment + this.aimError;

	this.predictedY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, predictedY)); // clamp within screen
  }

  updateDirection() {
	const paddle = this.paddle.y;
	const target = this.predictedY;

	const deadZone = 6; // pixels tolerance to avoid jitter
	if (paddle < target - deadZone) this.paddle.direction = "down";
	else if (paddle > target + deadZone) this.paddle.direction = "up";
	else this.paddle.direction = "none";
  }

  ballTrajectoryPrevision(ball, targetX) {
    if (Math.abs(ball.vx) < 1e-12) return ball.y;
    const timeToTarget = (targetX - ball.x) / ball.vx;
    if (timeToTarget <= 0) return ball.y;

    // compute straight-line arrival Y
    let predictedY = ball.y + ball.vy * timeToTarget;

    // Use the same bounce limits as the game physics
    const topLimit = 5 + BALL_RADIUS;
    const bottomLimit = HEIGHT - 5 - BALL_RADIUS;

    // reflect predictedY around the actual boundaries until it's inside the playable range
    // (predictedY can cross multiple times if timeToTarget is large)
    while (predictedY < topLimit || predictedY > bottomLimit) {
      if (predictedY < topLimit)
        predictedY = 2 * topLimit - predictedY;
      else
        predictedY = 2 * bottomLimit - predictedY;
    }

	predictedY = Math.round(predictedY); // Round to nearest integer for consistency
    return predictedY;
  }
}