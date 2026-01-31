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

  updatePrediction() {
	const ball = this.game.ball;

	const approaching = ball.vx > 0;

	// When the ball just started approaching, pick a new error
  	if (approaching && !this.lastApproaching) {
  	  	const speed = Math.hypot(ball.vx, ball.vy);
  		const s = (speed - 3) / 12;
  		const maxErr = 3 + 25 * (s * s); // max error increases with speed and between 3 and ~28 pixels
  		this.aimError = (Math.random() * 2 - 1) * maxErr;
  	}

	this.lastApproaching = approaching;
	// ball is moving away, go to ~center
	if (!approaching) {
		let opponentCenterY = this.opponent.y + PADDLE_HEIGHT / 2; 
		this.predictedY = (opponentCenterY - 250) * 0.4 + (HEIGHT - PADDLE_HEIGHT) / 2;
		return;
	}

	const targetX = this.paddle.x - BALL_RADIUS;
	let predictedY = this.ballTrajectoryPrevision(ball, targetX);
	let opposedAdjustment = (this.opponent.y + PADDLE_HEIGHT / 2 > HEIGHT / 2) ? -25 : (this.opponent.y + PADDLE_HEIGHT / 2 < HEIGHT / 2) ? 25 : 0; // adjust aim away from opponent center
	
	predictedY -= PADDLE_HEIGHT / 2 + opposedAdjustment + this.aimError;

	this.predictedY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, predictedY)); // limit within screen, if predicted to high limit to paddle max y, if too low limit to 0
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

    let predictedY = ball.y + ball.vy * timeToTarget;

    const topLimit = 5 + BALL_RADIUS;
    const bottomLimit = HEIGHT - 5 - BALL_RADIUS;

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