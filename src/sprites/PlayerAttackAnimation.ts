import { RunAttackDirection } from './PlayerRunAttackAnimation';

export type AttackDirection = 'down' | 'left' | 'right' | 'up';

export class PlayerAttackAnimation {
    private sprite: HTMLImageElement;
    private frameWidth = 64;
    private frameHeight = 64;
    private framesPerRow = 8;
    private directions: Record<AttackDirection, number> = {
        down: 0,
        left: 1,
        right: 2,
        up: 3,
    };
    private currentFrame = 0;
    private frameTime = 0;
    private frameDuration = 80; // ms на кадр (12.5 fps)
    public loaded: Promise<void>;
    public playing = false;
    public finished = false;
    private lastDirection: AttackDirection = 'down';
    public duration: number; // тривалість анімації в мілісекундах

    constructor() {
        this.sprite = new Image();
        this.loaded = new Promise<void>((resolve) => {
            this.sprite.onload = () => resolve();
            this.sprite.src = '/assets/Swordsman_lvl1_attack_without_shadow.png';
        });
        this.duration = this.frameDuration * this.framesPerRow; // наприклад
    }

    start(direction: AttackDirection) {
        this.playing = true;
        this.finished = false;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.lastDirection = direction;
    }

    update(deltaMs: number) {
        if (!this.playing) return;
        this.frameTime += deltaMs;
        if (this.frameTime >= this.frameDuration) {
            this.currentFrame++;
            this.frameTime = 0;
            if (this.currentFrame >= this.framesPerRow) {
                this.currentFrame = this.framesPerRow - 1;
                this.playing = false;
                this.finished = true;
            }
        }
    }

    draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        direction: AttackDirection = this.lastDirection,
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
        direction: AttackDirection | RunAttackDirection,
        scale: number,
        timeMs: number,
    ) {
        const row = this.directions[direction];
        const frameIndex = Math.floor(timeMs / this.frameDuration) % this.framesPerRow;
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

    reset() {
        this.currentFrame = 0;
        this.frameTime = 0;
        this.playing = false;
        this.finished = false;
    }
}
