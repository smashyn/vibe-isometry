import { spriteConfig } from '../config/spriteConfig.js';

export type IdleDirection = 'down' | 'left' | 'right' | 'up';

export class PlayerIdleAnimation {
    private sprite: HTMLImageElement;
    private frameWidth = 64;
    private frameHeight = 64;
    private framesPerRow = 4;
    private directions: Record<IdleDirection, number> = {
        down: 0,
        left: 1,
        right: 2,
        up: 3,
    };
    private currentFrame = 0;
    private frameTime = 0;
    private frameDuration = 200; // ms на кадр (5 fps)
    public loaded: Promise<void>;

    constructor() {
        this.sprite = new Image();
        this.loaded = new Promise<void>((resolve) => {
            this.sprite.onload = () => resolve();
            this.sprite.src = spriteConfig.playerIdle; // використання конфігу
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
        direction: IdleDirection,
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
