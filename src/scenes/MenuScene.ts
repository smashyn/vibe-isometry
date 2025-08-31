import { Scene } from './Scene.js';
import { Button } from '../ui/Button.js';

export class MenuScene implements Scene {
    private buttons: Button[];
    private canvas: HTMLCanvasElement | null = null;
    private onMouseDown = this.handleMouseDown.bind(this);
    public isActive = false;

    constructor(onStart: () => void, onSettings: () => void) {
        this.buttons = [
            new Button('Почати грати', onStart, () => this.isActive),
            new Button('Налаштування', onSettings, () => this.isActive),
        ];
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
        for (const btn of this.buttons) {
            if (btn.contains(x, y)) {
                btn.onClick();
                break;
            }
        }
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

        this.buttons.forEach((btn) =>
            btn.render(ctx, ctx.canvas.width / 2 - 100, 200 + this.buttons.indexOf(btn) * 70),
        );
    }
}
