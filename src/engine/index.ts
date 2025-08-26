export interface Scene {
    update(delta: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}

export class Engine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime = 0;
    private scene?: Scene;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) throw new Error('Canvas not found');
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get context');
        this.ctx = ctx;
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    setScene(scene: Scene) {
        // Деактивуємо попередню сцену, якщо є метод onDeactivate
        if (this.scene && typeof (this.scene as any).onDeactivate === 'function') {
            (this.scene as any).onDeactivate();
        }
        this.scene = scene;
        // Активуємо нову сцену, якщо є метод onActivate
        if (this.scene && typeof (this.scene as any).onActivate === 'function') {
            (this.scene as any).onActivate();
        }
    }

    private loop(time: number) {
        const delta = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (this.scene) {
            this.scene.update(delta);
            this.scene.render(this.ctx);
        }
        requestAnimationFrame(this.loop);
    }
}
