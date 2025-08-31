export class CanvasContext {
    private static _instance: CanvasContext | null = null;
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    private constructor(canvasId: string = 'game-canvas') {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) throw new Error('Canvas not found');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get 2D context');
        this.canvas = canvas;
        this.ctx = ctx;

        // Responsive resize
        window.addEventListener('resize', this.resizeToWindow);
        this.resizeToWindow();
    }

    static getInstance(canvasId: string = 'game-canvas'): CanvasContext {
        if (!CanvasContext._instance) {
            CanvasContext._instance = new CanvasContext(canvasId);
        }
        return CanvasContext._instance;
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

    resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    resizeToWindow = () => {
        this.resize(window.innerWidth, window.innerHeight);
    };
}
