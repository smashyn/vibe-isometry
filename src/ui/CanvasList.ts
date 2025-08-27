export class CanvasList {
    private items: string[] = [];
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private itemHeight: number;
    private page: number = 0;
    private itemsPerPage: number;
    private onSelect: (item: string) => void;
    private isActive: () => boolean;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        itemHeight: number,
        onSelect: (item: string) => void,
        isActive: () => boolean,
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.itemHeight = itemHeight;
        this.onSelect = onSelect;
        this.isActive = isActive;
        this.itemsPerPage = Math.floor(height / itemHeight);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    setItems(items: string[]) {
        this.items = items;
        this.page = 0;
    }

    onActivate() {
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.addEventListener('mousedown', this.handleMouseDown);
            canvas.addEventListener('wheel', this.handleWheel, { passive: false });
        }
    }

    onDeactivate() {
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.removeEventListener('mousedown', this.handleMouseDown);
            canvas.removeEventListener('wheel', this.handleWheel);
        }
    }

    private handleMouseDown(e: MouseEvent) {
        if (!this.isActive()) return;
        const canvas = e.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (
            mx >= this.x &&
            mx <= this.x + this.width &&
            my >= this.y &&
            my <= this.y + this.height
        ) {
            const idx = Math.floor((my - this.y) / this.itemHeight) + this.page * this.itemsPerPage;
            if (idx >= 0 && idx < this.items.length) {
                this.onSelect(this.items[idx]);
            }
        }
    }

    private handleWheel(e: WheelEvent) {
        if (!this.isActive()) return;
        const canvas = e.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (
            mx >= this.x &&
            mx <= this.x + this.width &&
            my >= this.y &&
            my <= this.y + this.height
        ) {
            if (e.deltaY > 0) {
                this.nextPage();
            } else if (e.deltaY < 0) {
                this.prevPage();
            }
            e.preventDefault();
        }
    }

    nextPage() {
        const maxPage = Math.max(0, Math.ceil(this.items.length / this.itemsPerPage) - 1);
        if (this.page < maxPage) this.page++;
    }

    prevPage() {
        if (this.page > 0) this.page--;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.font = '20px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const start = this.page * this.itemsPerPage;
        const end = Math.min(start + this.itemsPerPage, this.items.length);

        for (let i = start; i < end; i++) {
            const itemY = this.y + (i - start) * this.itemHeight;
            ctx.fillStyle = '#222';
            ctx.fillRect(this.x, itemY, this.width, this.itemHeight - 2);
            ctx.fillStyle = '#fff';
            ctx.fillText(this.items[i], this.x + 10, itemY + this.itemHeight / 2);
        }

        // Пагінація
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        const maxPage = Math.max(1, Math.ceil(this.items.length / this.itemsPerPage));
        ctx.textAlign = 'center';
        ctx.fillText(
            `Сторінка ${this.page + 1} / ${maxPage}`,
            this.x + this.width / 2,
            this.y + this.height + 20,
        );
        ctx.restore();
    }
}
