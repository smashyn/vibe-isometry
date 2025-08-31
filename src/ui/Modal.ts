import { Button } from './Button.js';
import { drawText } from '../utils/drawText.js';

export class Modal {
    public isOpen = false;
    public title: string;
    public message: string;
    public onClose: () => void;
    private contentRenderFn?: (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
    ) => void;
    private closeButton: Button;

    constructor(
        title: string,
        message: string,
        onClose: () => void,
        contentRenderFn?: (
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            w: number,
            h: number,
        ) => void,
    ) {
        this.title = title;
        this.message = message;
        this.onClose = onClose;
        this.contentRenderFn = contentRenderFn;

        // Кнопка "Закрити"
        this.closeButton = new Button(
            'Закрити',
            () => this.close(),
            () => this.isOpen,
        );
    }

    setContentRenderer(
        fn: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void,
    ) {
        this.contentRenderFn = fn;
    }

    open(message?: string) {
        if (message !== undefined) this.message = message;
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
        if (this.onClose) this.onClose();
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number) {
        if (!this.isOpen) return;
        ctx.save();
        // Півпрозорий фон
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;

        // Вікно
        const mw = 480,
            mh = 200;
        const mx = (width - mw) / 2,
            my = (height - mh) / 2;
        ctx.fillStyle = '#23272e';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.fillRect(mx, my, mw, mh);
        ctx.strokeRect(mx, my, mw, mh);

        // Заголовок
        drawText(ctx, this.title, width / 2, my + 10, 'bold 24px Arial', '#fff', 'center');

        // Повідомлення (якщо немає кастомного контенту)
        if (!this.contentRenderFn) {
            drawText(ctx, this.message, width / 2, my + 100, '18px Arial', '#eee', 'center');
        }

        // Кастомний контент
        if (this.contentRenderFn) {
            this.contentRenderFn(ctx, mx, my, mw, mh);
        }

        // Кнопка "Закрити" через компонент Button
        this.closeButton.render(ctx, mx + mw / 2 - 120, my + mh - 50);

        ctx.restore();
    }

    handleClick(x: number, y: number, width: number, height: number) {
        if (!this.isOpen) return false;
        const mw = 400,
            mh = 200;
        const mx = (width - mw) / 2,
            my = (height - mh) / 2;
        // Використовуємо contains для кнопки
        const btnX = mx + mw / 2 - 60;
        const btnY = my + mh - 50;
        if (
            x >= btnX &&
            x <= btnX + this.closeButton.width &&
            y >= btnY &&
            y <= btnY + this.closeButton.height
        ) {
            this.closeButton.onClick();
            return true;
        }
        return false;
    }
}
