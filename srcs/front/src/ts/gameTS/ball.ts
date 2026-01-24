import type { IBall } from '../types/game.types';

export default class Ball implements IBall {
    x: number;
    y: number;
    radius: number;
    color: string;
    speedX: number;
    speedY: number;
    spawnX: number;
    spawnY: number;

    constructor(x: number, y: number, radius: number, color: string) {
        this.x = this.spawnX = x;
        this.y = this.spawnY = y;
        this.radius = radius;
        this.color = color;
        this.speedX = 2;
        this.speedY = 2;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    reset(): void {
        this.x = this.spawnX;
        this.y = this.spawnY;
    }
}
