import { spriteConfig } from '../config/spriteConfig.js';

export type DeathDirection = 'down' | 'left' | 'right' | 'up';

export class PlayerDeathAnimation {
    private sprite: HTMLImageElement;
    public loaded: Promise<void>;
    public frameWidth = 64; // підставте реальну ширину кадру
    public frameHeight = 64; // підставте реальну висоту кадру
    public framesPerRow = 7;
    public rows = 4;
    public frameDuration = 100; // мс на кадр
    public duration = this.frameDuration * this.framesPerRow;

    private currentFrame = 0;
    private frameTime = 0;

    private directions: Record<DeathDirection, number> = {
        down: 0,
        left: 1,
        right: 2,
        up: 3,
    };

    constructor() {
        this.sprite = new Image();
        this.loaded = new Promise<void>((resolve) => {
            this.sprite.onload = () => resolve();
            this.sprite.src = spriteConfig.playerDeath;
        });
    }

    update(deltaMs: number) {
        this.frameTime += deltaMs;
        if (this.frameTime >= this.frameDuration && this.currentFrame < this.framesPerRow - 1) {
            this.currentFrame++;
            this.frameTime = 0;
        }
    }

    reset() {
        this.currentFrame = 0;
        this.frameTime = 0;
    }

    draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        direction: DeathDirection,
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

    drawFrame(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        direction: DeathDirection,
        scale: number,
        timeMs: number,
    ) {
        const row = this.directions[direction];
        let frameIndex = Math.min(Math.floor(timeMs / this.frameDuration), this.framesPerRow - 1);
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(
            this.sprite,
            frameIndex * this.frameWidth,
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
}
