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

        ctx.fillStyle = '#000';
        let displayValue = this.type === 'password' ? this.value.replace(/./g, '*') : this.value;
        ctx.fillText(displayValue || this.placeholder, this.x + 5, this.y + this.h / 2 + 7);

        ctx.restore();
    }

    contains(mx: number, my: number) {
        return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h;
    }

    setActiveByMouse(mx: number, my: number) {
        this.focused = this.contains(mx, my);
        return this.focused;
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
