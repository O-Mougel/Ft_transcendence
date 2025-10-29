export default class Paddle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.score = 0;
        this.speed = 10;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    moveUp() {
        this.y -= this.speed;
    }

    moveDown() {
        this.y += this.speed;
    }

    increaseScore() {
        this.score += 1;
    }

    resetScore() {
        this.score = 0;
    }

    setSpeed(newSpeed) {
        this.speed = newSpeed;
    }

    printScore() {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(this.score, this.x + this.width / 2, 20);
    }
}