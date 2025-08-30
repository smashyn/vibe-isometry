export class Input {
    x: number;
    y: number;
    w: number;
    h: number;
    value: string;
    placeholder: string;
    focused: boolean;
    type: 'text' | 'password';

    constructor(
        x: number,
        y: number,
        w: number,
        h: number,
        placeholder: string,
        value: string = '',
        type: 'text' | 'password' = 'text',
    ) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.value = value;
        this.placeholder = placeholder;
        this.focused = false;
        this.type = type;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.strokeStyle = this.focused ? '#1976d2' : '#aaa';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        const displayValue = this.type === 'password' ? this.value.replace(/./g, '*') : this.value;
        const displayedText = displayValue || this.placeholder;
        ctx.fillStyle = displayValue ? '#c3c3c3' : '#757575';
        ctx.fillText(displayedText, this.x + 5, this.y + this.h / 2 + 7);

        // Малюємо кнопку очищення, якщо є текст
        if (this.value.length > 0) {
            const btnSize = 20;
            const btnX = this.x + this.w - btnSize - 4;
            const btnY = this.y + (this.h - btnSize) / 2;

            // Коло
            ctx.beginPath();
            ctx.arc(btnX + btnSize / 2, btnY + btnSize / 2, btnSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = '#e57373';
            ctx.fill();
            ctx.closePath();

            // Хрестик
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(btnX + 5, btnY + 5);
            ctx.lineTo(btnX + btnSize - 5, btnY + btnSize - 5);
            ctx.moveTo(btnX + btnSize - 5, btnY + 5);
            ctx.lineTo(btnX + 5, btnY + btnSize - 5);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.restore();
    }

    contains(mx: number, my: number) {
        return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h;
    }

    /**
     * Перевіряє чи клік був по кнопці очищення.
     */
    clearButtonContains(mx: number, my: number): boolean {
        if (this.value.length === 0) return false;
        const btnSize = 20;
        const btnX = this.x + this.w - btnSize - 4;
        const btnY = this.y + (this.h - btnSize) / 2;
        return mx >= btnX && mx <= btnX + btnSize && my >= btnY && my <= btnY + btnSize;
    }

    /**
     * Викликайте цей метод у сцені при кліку миші:
     * if (input.clearButtonContains(x, y)) input.value = '';
     */
    setActiveByMouse(mx: number, my: number) {
        this.focused = this.contains(mx, my) && !this.clearButtonContains(mx, my);
        return this.focused;
    }

    /**
     * Обробка кліку миші по інпуту та кнопці очищення.
     * Повертає true, якщо був клік по інпуту (включно з очищенням).
     */
    handleMouseClick(mx: number, my: number): boolean {
        if (this.clearButtonContains(mx, my)) {
            this.value = '';
            this.focused = true;
            return true;
        }
        if (this.contains(mx, my)) {
            this.focused = true;
            return true;
        }
        this.focused = false;
        return false;
    }

    onKey(e: KeyboardEvent) {
        if (!this.focused) return false;
        if (e.key === 'Tab' || e.key === 'Enter') {
            return false;
        } else if (e.key === 'Backspace') {
            this.value = this.value.slice(0, -1);
            return true;
        } else if (e.key.length === 1 && this.value.length < 32) {
            this.value += e.key;
            return true;
        }
        return false;
    }
}
