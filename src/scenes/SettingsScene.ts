import { Scene } from './Scene.js';
import { Button } from '../ui/Button.js';
import { drawText } from '../utils/drawText.js'; // Додаємо імпорт

export class SettingsScene implements Scene {
    private backButton: Button;
    private canvas: HTMLCanvasElement | null = null;
    private onMouseDown = this.handleMouseDown.bind(this);
    public isActive = false;

    constructor(onBack: () => void) {
        this.backButton = new Button('Назад', onBack, () => this.isActive);
    }

    onActivate() {
        this.isActive = true;
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', this.onMouseDown);
        }
    }

    onDeactivate() {
        this.isActive = false;
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.onMouseDown);
        }
    }

    private handleMouseDown(e: MouseEvent) {
        if (!this.isActive || !this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (this.backButton.contains(x, y)) {
            this.backButton.onClick();
        }
    }

    update(_: number) {}

    render(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.fillStyle = '#181a1b';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Використовуємо drawText замість fillText
        drawText(ctx, 'Налаштування', ctx.canvas.width / 2, 120, 'bold 32px sans-serif', '#fff');
        ctx.restore();

        this.backButton.render(ctx, ctx.canvas.width / 2 - 100, ctx.canvas.height / 2 + 60);
    }
}
