export class Button {
    x: number = 0;
    y: number = 0;
    width: number;
    height: number;
    label: string;
    onClick: () => void;
    private hovered = false;
    private canvas: HTMLCanvasElement | null = null;
    private isListenersActive = false;
    private getSceneIsActive: () => boolean;
    public focused: boolean = false;
    public disabled: boolean = false; // додано

    // Style config
    fillColor: string;
    fillColorHovered: string;
    borderColor: string;
    textColor: string;
    font: string;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    colorFocusedBorder: string;
    colorFocusedBg: string;
    fillColorDisabled: string;
    borderColorDisabled: string;
    textColorDisabled: string;

    constructor(
        label: string,
        onClick: () => void,
        getSceneIsActive: () => boolean,
        style?: Partial<{
            width: number;
            height: number;
            fillColor: string;
            fillColorHovered: string;
            borderColor: string;
            textColor: string;
            font: string;
            textAlign: CanvasTextAlign;
            textBaseline: CanvasTextBaseline;
            colorFocusedBorder: string;
            colorFocusedBg: string;
            fillColorDisabled: string;
            borderColorDisabled: string;
            textColorDisabled: string;
        }>,
        disabled: boolean = false, // додано
    ) {
        this.width = style?.width ?? 240;
        this.height = style?.height ?? 40;
        this.label = label;
        this.onClick = onClick;
        this.getSceneIsActive = getSceneIsActive;
        this.disabled = disabled;

        // Default styles
        this.fillColor = style?.fillColor ?? '#444';
        this.fillColorHovered = style?.fillColorHovered ?? '#666';
        this.borderColor = style?.borderColor ?? '#222';
        this.textColor = style?.textColor ?? '#fff';
        this.font = style?.font ?? 'bold 16px sans-serif';
        this.textAlign = style?.textAlign ?? 'center';
        this.textBaseline = style?.textBaseline ?? 'middle';
        this.colorFocusedBorder = style?.colorFocusedBorder ?? '#1976d2';
        this.colorFocusedBg = style?.colorFocusedBg ?? '#2a3fa4';
        this.fillColorDisabled = style?.fillColorDisabled ?? '#bbb';
        this.borderColorDisabled = style?.borderColorDisabled ?? '#888';
        this.textColorDisabled = style?.textColorDisabled ?? '#eee';

        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (this.canvas) {
            this.addListeners();
        }
    }

    private addListeners() {
        if (this.canvas && !this.isListenersActive) {
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('mousedown', this.handleClick);
            this.isListenersActive = true;
        }
    }

    private removeListeners() {
        if (this.canvas && this.isListenersActive) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mousedown', this.handleClick);
            this.isListenersActive = false;
        }
    }

    public onActivate() {
        this.addListeners();
    }
    public onDeactivate() {
        this.removeListeners();
    }

    contains(px: number, py: number): boolean {
        return (
            px >= this.x && px <= this.x + this.width && py >= this.y && py <= this.y + this.height
        );
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (this.disabled) {
            this.hovered = false;
            return;
        }
        if (!this.getSceneIsActive()) {
            this.hovered = false;
            return;
        }
        const canvas = e.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        this.hovered =
            mx >= this.x && mx <= this.x + this.width && my >= this.y && my <= this.y + this.height;
    };

    private handleClick = (e: MouseEvent) => {
        if (this.disabled) return;
        if (!this.getSceneIsActive()) return;
        if (this.hovered) {
            this.onClick();
        }
    };

    render(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.x = x;
        this.y = y;
        ctx.save();

        if (this.disabled) {
            ctx.fillStyle = this.fillColorDisabled;
            ctx.strokeStyle = this.borderColorDisabled;
        } else if (this.focused) {
            ctx.fillStyle = this.colorFocusedBg;
            ctx.strokeStyle = this.colorFocusedBorder;
        } else {
            ctx.fillStyle = this.hovered ? this.fillColorHovered : this.fillColor;
            ctx.strokeStyle = this.borderColor;
        }

        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = this.disabled ? this.textColorDisabled : this.textColor;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2);
        ctx.restore();
    }
}
