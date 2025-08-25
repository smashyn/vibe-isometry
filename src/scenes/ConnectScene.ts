import { Scene } from '../engine/index.js';
import { Button } from '../ui/Button.js';

export class ConnectScene implements Scene {
    private serverAddress: string = 'ws://localhost:3000';
    private inputActive = false;
    private onConnect: (address: string) => void;
    private connectButton: Button;
    private inputRect = { x: 400, y: 200, w: 300, h: 40 };

    constructor(onConnect: (address: string) => void) {
        this.onConnect = onConnect;
        this.connectButton = new Button(400, 260, 200, 50, 'Підключитись', () => {
            this.onConnect(this.serverAddress);
        });

        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.addEventListener('mousedown', this.handleMouseDown);
            window.addEventListener('keydown', this.handleKeyDown);
        }
    }

    private handleMouseDown = (e: MouseEvent) => {
        const canvas = e.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        this.inputActive =
            mx >= this.inputRect.x &&
            mx <= this.inputRect.x + this.inputRect.w &&
            my >= this.inputRect.y &&
            my <= this.inputRect.y + this.inputRect.h;
    };

    private handleKeyDown = (e: KeyboardEvent) => {
        if (!this.inputActive) return;
        if (e.key === 'Backspace') {
            this.serverAddress = this.serverAddress.slice(0, -1);
        } else if (e.key.length === 1) {
            this.serverAddress += e.key;
        }
        e.preventDefault();
    };

    update(_: number) {}

    render(ctx: CanvasRenderingContext2D) {
        // Темний фон
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.fillStyle = '#181a1b';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Текст заголовка
        ctx.font = 'bold 28px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Підключення до сервера', ctx.canvas.width / 2, 120);
        ctx.restore();

        // Поле вводу адреси
        ctx.save();
        ctx.strokeStyle = this.inputActive ? '#0f0' : '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.inputRect.x, this.inputRect.y, this.inputRect.w, this.inputRect.h);
        ctx.font = '20px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText(this.serverAddress, this.inputRect.x + 10, this.inputRect.y + 28);
        ctx.restore();

        this.connectButton.render(ctx);
    }
}
