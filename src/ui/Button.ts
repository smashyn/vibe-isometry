export class Button {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    onClick: () => void;
    private hovered = false;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        onClick: () => void,
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
        this.onClick = onClick;

        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.addEventListener('mousemove', this.handleMouseMove);
            canvas.addEventListener('click', this.handleClick);
        }
    }

    private handleMouseMove = (e: MouseEvent) => {
        const canvas = e.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        this.hovered =
            mx >= this.x && mx <= this.x + this.width && my >= this.y && my <= this.y + this.height;
    };

    private handleClick = (e: MouseEvent) => {
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
