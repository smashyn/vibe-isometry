import { Scene } from '../engine/index.js';
import { Button } from '../ui/Button.js';

export class SettingsScene implements Scene {
    private backButton: Button;

    constructor(onBack: () => void) {
        this.backButton = new Button(400, 300, 200, 50, 'Назад', onBack);
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
        ctx.fillText('Налаштування', ctx.canvas.width / 2, 120);
        ctx.restore();

        this.backButton.render(ctx);
    }
}
