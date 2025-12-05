export default class Ball {
    constructor(x, y, radius, color) {
        this.x = this.spawnX = x;
        this.y = this.spawnY = y;
        this.radius = radius;
        this.color = color;
        this.speedX = 2;
        this.speedY = 2;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    setSpeed(newSpeedX, newSpeedY) {
        this.speedX = newSpeedX;
        this.speedY = newSpeedY;
    }

    reset() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.speedX = 3.0;
        this.speedY = 3.0;
    }
}