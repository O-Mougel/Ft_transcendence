export default class Paddle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.score = 0;
        this.speed = 10;
        this.direction = 'none';
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    reset() {
        this.y = 250 - this.height / 2;
        this.score = 0;
    }
}