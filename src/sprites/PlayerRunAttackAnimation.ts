import { AttackDirection } from './PlayerAttackAnimation';

export type RunAttackDirection = 'down' | 'left' | 'right' | 'up';

export class PlayerRunAttackAnimation {
    private sprite: HTMLImageElement;
    private frameWidth = 64;
    private frameHeight = 64;
    private framesPerRow = 8;
    private directions: Record<RunAttackDirection, number> = {
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
    private lastDirection: RunAttackDirection = 'down';
    public duration: number;

    constructor() {
        this.sprite = new Image();
        this.loaded = new Promise<void>((resolve) => {
            this.sprite.onload = () => resolve();
            this.sprite.src = '/assets/Swordsman_lvl1_Run_Attack_without_shadow.png';
        });
        this.duration = this.frameDuration * this.framesPerRow;
    }

    start(direction: RunAttackDirection) {
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
        direction: RunAttackDirection = this.lastDirection,
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
        const row = this.directions[direction as RunAttackDirection];
        // Обчислюємо індекс кадру по часу
        let frameIndex = Math.floor(timeMs / this.frameDuration);
        if (frameIndex >= this.framesPerRow) frameIndex = this.framesPerRow - 1;

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
