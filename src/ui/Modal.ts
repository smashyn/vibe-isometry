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
        const mw = 400,
            mh = 200;
        const mx = (width - mw) / 2,
            my = (height - mh) / 2;
        ctx.fillStyle = '#23272e';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.fillRect(mx, my, mw, mh);
        ctx.strokeRect(mx, my, mw, mh);

        // Заголовок
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(this.title, width / 2, my + 40);

        // Повідомлення (якщо немає кастомного контенту)
        if (!this.contentRenderFn) {
            ctx.font = '18px Arial';
            ctx.fillStyle = '#eee';
            ctx.textAlign = 'center';
            ctx.fillText(this.message, width / 2, my + 100);
        }

        // Кастомний контент
        if (this.contentRenderFn) {
            this.contentRenderFn(ctx, mx, my, mw, mh);
        }

        // Кнопка "Закрити"
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#1976d2';
        ctx.fillRect(mx + mw / 2 - 60, my + mh - 50, 120, 36);
        ctx.fillStyle = '#fff';
        ctx.fillText('Закрити', width / 2, my + mh - 25);

        ctx.restore();
    }

    handleClick(x: number, y: number, width: number, height: number) {
        if (!this.isOpen) return false;
        const mw = 400,
            mh = 200;
        const mx = (width - mw) / 2,
            my = (height - mh) / 2;
        // Якщо клік по кнопці "Закрити"
        if (
            x >= mx + mw / 2 - 60 &&
            x <= mx + mw / 2 + 60 &&
            y >= my + mh - 50 &&
            y <= my + mh - 14
        ) {
            this.close();
            return true;
        }
        return false;
    }
}
