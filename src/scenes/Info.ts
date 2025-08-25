import { drawLabel } from '../utils/drawLabel.js';
import { Player } from '../entities/Player.js';

export class Info {
    constructor(private player: Player) {}

    render(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const gameFieldWidth = w * 0.65;
        const sidePanelWidth = w - gameFieldWidth;
        const infoHeight = h * 0.3;
        const chatHeight = h - infoHeight;

        ctx.fillStyle = '#444';
        ctx.fillRect(gameFieldWidth, chatHeight, sidePanelWidth, infoHeight);
        drawLabel(ctx, 'Інфо про персонажа', gameFieldWidth + 20, chatHeight + 20);
        drawLabel(
            ctx,
            `Швидкість: ${this.player.speed.toFixed(2)} тайлів/сек`,
            gameFieldWidth + 20,
            chatHeight + 60,
            '18px Arial',
        );
        drawLabel(
            ctx,
            `Координати: (${this.player.x}, ${this.player.y})`,
            gameFieldWidth + 20,
            chatHeight + 90,
            '18px Arial',
        );
        drawLabel(
            ctx,
            `Напрям: ${this.player.direction}`,
            gameFieldWidth + 20,
            chatHeight + 120,
            '18px Arial',
        );
    }
}
