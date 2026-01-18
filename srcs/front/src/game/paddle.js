export default class Paddle {
    constructor(x, y, width, height, color) {
        this.x = this.spawnX = x;
        this.y = this.spawnY = y - (height / 2);
        this.width = width;
        this.height = height;
        this.color = color;
        this.score = 0;
        this.speed = 10;
        this.direction = 'none';
    }

    _draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    _reset() {
        this.y = this.spawnY;
        this.score = 0;
    }
}