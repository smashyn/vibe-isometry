import { Scene } from '../engine/index.js';
import { Button } from '../ui/Button.js';

export class MenuScene implements Scene {
    private buttons: Button[];

    constructor(onStart: () => void, onSettings: () => void) {
        this.buttons = [
            new Button(400, 200, 200, 50, 'Почати грати', onStart),
            new Button(400, 270, 200, 50, 'Налаштування', onSettings),
        ];
    }

    update(_: number) {}

    render(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.fillStyle = '#181a1b';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.font = 'bold 32px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Головне меню', ctx.canvas.width / 2, 120);
        ctx.restore();

        this.buttons.forEach((btn) => btn.render(ctx));
    }
}
