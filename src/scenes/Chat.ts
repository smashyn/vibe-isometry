import { drawLabel } from '../utils/drawLabel.js';

export class Chat {
    private messages: string[] = [];
    private scrollOffset: number = 0;

    public addMessage(msg: string) {
        this.messages.push(msg);
        if (this.messages.length > 1000) {
            this.messages.shift();
        }
        // Автоматично прокручуємо вниз при новому повідомленні
        this.scrollOffset = 0;
    }

    // Викликайте цей метод у MainScene для обробки скролу мишкою
    public handleWheel(e: WheelEvent) {
        const linesPerScroll = 3;
        if (e.deltaY > 0) {
            // вниз
            this.scrollOffset = Math.min(
                this.scrollOffset + linesPerScroll,
                Math.max(0, this.messages.length - 1),
            );
        } else if (e.deltaY < 0) {
            // вгору
            this.scrollOffset = Math.max(0, this.scrollOffset - linesPerScroll);
        }
    }

    render(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const gameFieldWidth = w * 0.65;
        const sidePanelWidth = w - gameFieldWidth;
        const infoHeight = h * 0.3;
        const chatHeight = h - infoHeight;

        ctx.fillStyle = '#333';
        ctx.fillRect(gameFieldWidth, 0, sidePanelWidth, chatHeight);
        drawLabel(ctx, 'Чат', gameFieldWidth + 20, 20);

        ctx.save();
        ctx.font = '16px monospace';
        ctx.fillStyle = '#fff';
        let y = 50;
        const maxMessages = Math.floor((chatHeight - 50) / 20);

        // Визначаємо, які повідомлення показувати з урахуванням scrollOffset
        const total = this.messages.length;
        const start = Math.max(0, total - maxMessages - this.scrollOffset);
        const end = Math.max(0, total - this.scrollOffset);

        for (let i = start; i < end; i++) {
            ctx.fillText(this.messages[i], gameFieldWidth + 20, y);
            y += 20;
        }
        ctx.restore();
    }
}
