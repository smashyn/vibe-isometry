import { spriteConfig } from '../config/spriteConfig.js';

export type RunDirection = 'down' | 'left' | 'right' | 'up';

export class PlayerAnimation {
    private sprite: HTMLImageElement;
    private frameWidth = 64;
    private frameHeight = 64;
    private framesPerRow = 8;
    private directions: Record<RunDirection, number> = {
        down: 0,
        left: 1,
        right: 2,
        up: 3,
    };
    private currentFrame = 0;
    private frameTime = 0;
    private frameDuration = 100; // ms на кадр (10 fps)
    public loaded: Promise<void>;

    constructor() {
        this.sprite = new Image();
        this.loaded = new Promise<void>((resolve) => {
            this.sprite.onload = () => resolve();
            this.sprite.src = spriteConfig.playerRun; // використання конфігу
        });
    }

    update(deltaMs: number) {
        this.frameTime += deltaMs;
        if (this.frameTime >= this.frameDuration) {
            this.currentFrame = (this.currentFrame + 1) % this.framesPerRow;
            this.frameTime = 0;
        }
    }

    draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        direction: RunDirection,
        scale: number = 1,
    ) {
        const row = this.directions[direction];
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(
            this.sprite,
            this.currentFrame * this.frameWidth,
            row * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            x - (this.frameWidth * scale) / 2,
            y - (this.frameHeight * scale) / 2,
            this.frameWidth * scale,
            this.frameHeight * scale,
        );
        ctx.restore();
    }

    reset() {
        this.currentFrame = 0;
        this.frameTime = 0;
    }
}
