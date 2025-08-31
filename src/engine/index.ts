import { Scene } from '../scenes/Scene';
import { CanvasContext } from './CanvasContext';

export class Engine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime = 0;
    private scene?: Scene;

    constructor(canvasId: string) {
        const canvasCtx = CanvasContext.getInstance(canvasId);
        this.canvas = canvasCtx.canvas;
        this.ctx = canvasCtx.ctx;
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    setScene(scene: Scene) {
        // Деактивуємо попередню сцену
        if (this.scene) {
            this.scene.onDeactivate();
        }
        this.scene = scene;
        // Активуємо нову сцену
        this.scene.onActivate();
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
