export default class Ball {
    constructor(x, y, radius, color) {
        this.x = this.spawnX = x;
        this.y = this.spawnY = y;
        this.radius = radius;
        this.color = color;
        this.speedX = 2;
        this.speedY = 2;
    }

    _draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    _reset() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        // this.speedX = 3.0;
        // this.speedY = 3.0;
    }
}