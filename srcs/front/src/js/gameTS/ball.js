export default class Ball {
    x;
    y;
    radius;
    color;
    speedX;
    speedY;
    spawnX;
    spawnY;
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
    reset() {
        this.x = this.spawnX;
        this.y = this.spawnY;
    }
}
