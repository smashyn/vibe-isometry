export class Input {
    x: number = 0;
    y: number = 0;
    w: number;
    h: number;
    label: string;
    value: string;
    focused: boolean;
    type: 'text' | 'password';

    // Style config
    font: string;
    textAlign: CanvasTextAlign;
    colorText: string;
    colorPlaceholder: string;
    colorBorder: string;
    colorBorderFocused: string;
    colorClearBg: string;
    colorClearCross: string;
    width: number;
    height: number;
    placeholder: string;

    showClearButton: boolean;

    // Error handling
    error: string | null = null;

    constructor(
        label: string,
        value: string,
        type: 'text' | 'password' = 'text',
        style?: Partial<{
            width: number;
            height: number;
            font: string;
            textAlign: CanvasTextAlign;
            colorText: string;
            colorPlaceholder: string;
            colorBorder: string;
            colorBorderFocused: string;
            colorClearBg: string;
            colorClearCross: string;
            placeholder: string;
        }>,
        showClearButton: boolean = true,
    ) {
        this.label = label;
        this.width = style?.width ?? 240;
        this.height = style?.height ?? 32;
        this.w = this.width;
        this.h = this.height;
        this.value = value;
        this.placeholder = style?.placeholder ?? '';
        this.focused = false;
        this.type = type;

        // Default styles
        this.font = style?.font ?? '20px Arial';
        this.textAlign = style?.textAlign ?? 'left';
        this.colorText = style?.colorText ?? '#c3c3c3';
        this.colorPlaceholder = style?.colorPlaceholder ?? '#757575';
        this.colorBorder = style?.colorBorder ?? '#aaa';
        this.colorBorderFocused = style?.colorBorderFocused ?? '#1976d2';
        this.colorClearBg = style?.colorClearBg ?? '#e57373';
        this.colorClearCross = style?.colorClearCross ?? '#fff';

        this.showClearButton = showClearButton;
    }

    private renderClearButton(ctx: CanvasRenderingContext2D) {
        if (!this.showClearButton || this.value.length === 0) return;
        const btnSize = 20;
        const btnX = this.x + this.width - btnSize - 4;
        const btnY = this.y + (this.height - btnSize) / 2;

        // Circle
        ctx.beginPath();
        ctx.arc(btnX + btnSize / 2, btnY + btnSize / 2, btnSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.colorClearBg;
        ctx.fill();
        ctx.closePath();

        // Cross
        ctx.strokeStyle = this.colorClearCross;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(btnX + 5, btnY + 5);
        ctx.lineTo(btnX + btnSize - 5, btnY + btnSize - 5);
        ctx.moveTo(btnX + btnSize - 5, btnY + 5);
        ctx.lineTo(btnX + 5, btnY + btnSize - 5);
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Тепер координати задаються під час рендера
     */
    render(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.x = x;
        this.y = y;
        this.w = this.width;
        this.h = this.height;

        ctx.save();

        // Вивід label ліворуч від інпута, якщо задано
        if (this.label) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.label, this.x - 10, this.y + this.h / 2);
        }

        ctx.font = this.font;
        ctx.textAlign = this.textAlign;

        // Якщо є помилка — підсвічуємо червоним
        if (this.error) {
            ctx.strokeStyle = '#d32f2f';
        } else {
            ctx.strokeStyle = this.focused ? this.colorBorderFocused : this.colorBorder;
        }
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        const displayValue = this.type === 'password' ? this.value.replace(/./g, '*') : this.value;
        const displayedText = displayValue || this.placeholder;
        ctx.fillStyle = displayValue ? this.colorText : this.colorPlaceholder;
        ctx.fillText(displayedText, this.x + 5, this.y + this.h / 2);

        this.renderClearButton(ctx);

        // Відображення тексту помилки під інпутом
        if (this.error) {
            ctx.font = '14px Arial';
            ctx.fillStyle = '#d32f2f';
            ctx.textAlign = 'left';
            ctx.fillText(this.error, this.x, this.y + this.h + 18);
        }

        ctx.restore();
    }

    contains(mx: number, my: number) {
        return (
            mx >= this.x && mx <= this.x + this.width && my >= this.y && my <= this.y + this.height
        );
    }

    clearButtonContains(mx: number, my: number): boolean {
        if (!this.showClearButton || this.value.length === 0) return false;
        const btnSize = 20;
        const btnX = this.x + this.width - btnSize - 4;
        const btnY = this.y + (this.height - btnSize) / 2;
        return mx >= btnX && mx <= btnX + btnSize && my >= btnY && my <= btnY + btnSize;
    }

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
