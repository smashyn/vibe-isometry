export class Button {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    onClick: () => void;
    private hovered = false;
    private canvas: HTMLCanvasElement | null = null;
    private isListenersActive = false;
    private getSceneIsActive: () => boolean;
    public focused: boolean = false;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        onClick: () => void,
        getSceneIsActive: () => boolean,
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
        this.onClick = onClick;
        this.getSceneIsActive = getSceneIsActive;

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
        if (!this.getSceneIsActive()) return;
        if (this.hovered) {
            this.onClick();
        }
    };

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = this.hovered ? '#666' : '#444';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#222';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2);
        ctx.restore();
    }
}
