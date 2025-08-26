import { spriteConfig } from '../config/spriteConfig.js';

export type IdleDirection = 'down' | 'left' | 'right' | 'up';

export class PlayerIdleAnimation {
    private sprite: HTMLImageElement;
    private frameWidth = 64;
    private frameHeight = 64;
    // Кількість кадрів у кожному рядку
    private framesPerRow: Record<IdleDirection, number> = {
        down: 12,
        left: 12,
        right: 12,
        up: 4,
    };
    private directions: Record<IdleDirection, number> = {
        down: 0,
        left: 1,
        right: 2,
        up: 3,
    };
    private currentFrames: Record<IdleDirection, number> = {
        down: 0,
        left: 0,
        right: 0,
        up: 0,
    };
    private frameTimes: Record<IdleDirection, number> = {
        down: 0,
        left: 0,
        right: 0,
        up: 0,
    };
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
        (['down', 'left', 'right', 'up'] as IdleDirection[]).forEach((dir) => {
            this.frameTimes[dir] += deltaMs;
            if (this.frameTimes[dir] >= this.frameDuration) {
                this.currentFrames[dir] = (this.currentFrames[dir] + 1) % this.framesPerRow[dir];
                this.frameTimes[dir] = 0;
            }
        });
    }

    draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        direction: IdleDirection,
        scale: number = 1,
    ) {
        const row = this.directions[direction];
        const frame = this.currentFrames[direction];
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(
            this.sprite,
            frame * this.frameWidth,
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
        (['down', 'left', 'right', 'up'] as IdleDirection[]).forEach((dir) => {
            this.currentFrames[dir] = 0;
            this.frameTimes[dir] = 0;
        });
    }
}
