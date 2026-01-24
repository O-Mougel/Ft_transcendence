import type { IPaddle, PaddleDirection } from '../types/game.types';

export default class Paddle implements IPaddle {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    score: number;
    speed: number;
    direction: PaddleDirection;
    spawnX: number;
    spawnY: number;

    constructor(x: number, y: number, width: number, height: number, color: string) {
        this.x = this.spawnX = x;
        this.y = this.spawnY = y - (height / 2);
        this.width = width;
        this.height = height;
        this.color = color;
        this.score = 0;
        this.speed = 10;
        this.direction = 'none';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    reset(): void {
        this.y = this.spawnY;
        this.score = 0;
    }
}
