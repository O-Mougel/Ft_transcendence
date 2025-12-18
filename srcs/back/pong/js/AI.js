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
  }

  update() {
	// console.log('AI update called');
	// const ball = this.game.ball;
	// if (ball.vx > 0) {
	//   const targetX = this.paddle.x - BALL_RADIUS;
	//   this.predictedY = this.ballTrajectoryPrevision(ball, targetX);
	//   console.log('Predicted Y final position of ball:', this.predictedY);

	//   this.predictedY -= PADDLE_HEIGHT / 2;
	//   console.log('AI target paddle Y position:', this.predictedY);

	// if (this.opponent.y + PADDLE_HEIGHT / 2 > HEIGHT / 2)
	// 	this.predictedY += 20; // Move down if opponent is too high
	// else if (this.opponent.y + PADDLE_HEIGHT / 2 < HEIGHT / 2)
	// 	this.predictedY -= 20; // Move up if opponent is too low

	// // Add some randomness to make AI less perfect
	//   const randomOffset = (Math.random() - 0.5) * BASE_PADDLE_SPEED / 2; // ±7 pixels
	//   this.predictedY += randomOffset;
	  
	//   // Clamp paddle position within game bounds
	//   if (this.predictedY < 0)
	// 	this.predictedY = 0;
	//   else if (this.predictedY + PADDLE_HEIGHT > HEIGHT)
	// 	this.predictedY = HEIGHT - PADDLE_HEIGHT;
	// }

	console.log('AI update called');
	const ball = this.game.ball;

	const approaching = ball.vx > 0;

	// When the ball just started approaching, pick a new error (one roll per rally)
  	if (approaching && !this.lastApproaching) {
  	  	const speed = Math.hypot(ball.vx, ball.vy);
  		const s = (speed - 3) / 12;
  		const maxErr = 3 + 25 * (s * s); // 3px..28px
  		this.aimError = (Math.random() * 2 - 1) * maxErr;         // can be +/- ; bigger at high speed
	  	console.log('AI aim error set to:', this.aimError);
  	}

	this.lastApproaching = approaching;
	if (!approaching) {
		let opponentCenterY = this.opponent.y + PADDLE_HEIGHT / 2; 
		if (opponentCenterY < HEIGHT / 2) // Ball going away, position paddle based on opponent
			this.predictedY = HEIGHT / 3 - PADDLE_HEIGHT / 2; 
		else if (opponentCenterY > HEIGHT / 2)
			this.predictedY = HEIGHT / 3 * 2 - PADDLE_HEIGHT / 2;
		return;
	}

	const targetX = this.paddle.x - BALL_RADIUS;
	let predictedY = this.ballTrajectoryPrevision(ball, targetX);
	console.log('Predicted Y final position of ball:', predictedY);

	let opposedAdjustment = (this.opponent.y + PADDLE_HEIGHT / 2 > HEIGHT / 2) ? -20 : (this.opponent.y + PADDLE_HEIGHT / 2 < HEIGHT / 2) ? 20 : 0;
	
	predictedY -= PADDLE_HEIGHT / 2 + opposedAdjustment + this.aimError;
	console.log('AI target paddle Y position:', predictedY);

	this.predictedY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, predictedY));
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