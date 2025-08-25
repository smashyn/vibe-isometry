import { PlayerNetData } from '../net/PlayerNetworkClient.js';
import { PlayerAnimation, RunDirection } from '../sprites/PlayerAnimation.js';
import { PlayerIdleAnimation, IdleDirection } from '../sprites/PlayerIdleAnimation.js';
import { PlayerAttackAnimation, AttackDirection } from '../sprites/PlayerAttackAnimation.js';
import {
    PlayerRunAttackAnimation,
    RunAttackDirection,
} from '../sprites/PlayerRunAttackAnimation.js';

type AnimationState = {
    attackFrame: number;
    attackTime: number;
    runAttackFrame: number;
    runAttackTime: number;
};

export class OtherPlayersRenderer {
    private runAnimation: PlayerAnimation;
    private idleAnimation: PlayerIdleAnimation;
    private attackAnimation: PlayerAttackAnimation;
    private runAttackAnimation: PlayerRunAttackAnimation;

    private runLoaded: Promise<void>;
    private idleLoaded: Promise<void>;
    private attackLoaded: Promise<void>;
    private runAttackLoaded: Promise<void>;

    private animationStates = new Map<string, AnimationState>();

    constructor(
        private tileWidth: number,
        private tileHeight: number,
    ) {
        this.runAnimation = new PlayerAnimation();
        this.idleAnimation = new PlayerIdleAnimation();
        this.attackAnimation = new PlayerAttackAnimation();
        this.runAttackAnimation = new PlayerRunAttackAnimation();

        this.runLoaded = this.runAnimation.loaded;
        this.idleLoaded = this.idleAnimation.loaded;
        this.attackLoaded = this.attackAnimation.loaded;
        this.runAttackLoaded = this.runAttackAnimation.loaded;
    }

    /**
     * Малює інших гравців на карті з анімацією та підтримкою різних станів.
     */
    async render(
        ctx: CanvasRenderingContext2D,
        myX: number,
        myY: number,
        centerX: number,
        centerY: number,
        others: PlayerNetData[],
        deltaMs: number = 16,
    ) {
        await Promise.all([
            this.runLoaded,
            this.idleLoaded,
            this.attackLoaded,
            this.runAttackLoaded,
        ]);

        this.runAnimation.update(deltaMs);
        this.idleAnimation.update(deltaMs);

        for (const other of others) {
            // --- СТАН АТАКИ ДЛЯ КОЖНОГО ГРАВЦЯ ---
            let state = this.animationStates.get(other.id);
            if (!state) {
                state = {
                    attackFrame: 0,
                    attackTime: 0,
                    runAttackFrame: 0,
                    runAttackTime: 0,
                };
                this.animationStates.set(other.id, state);
            }

            // --- Визначаємо координати ---
            const dx = other.x - myX;
            const dy = other.y - myY;
            const isoX = centerX + (dx - dy) * (this.tileWidth / 2);
            const isoY = centerY + (dx + dy) * (this.tileHeight / 2);

            const color = this.getColorForId(other.id);
            const dir = this.getDirection(other.direction);

            const isMoving = !!other.isMoving;
            const isAttacking = !!other.isAttacking;
            const isRunAttacking = !!other.isRunAttacking;

            ctx.save();
            ctx.filter = `drop-shadow(0 0 0 ${color})`;

            // --- АТАКА ---
            if (isRunAttacking) {
                state.runAttackTime += deltaMs;
                // draw з ручним кадром
                this.runAttackAnimation.drawFrame(
                    ctx,
                    isoX,
                    isoY,
                    dir as RunAttackDirection,
                    1,
                    state.runAttackTime,
                );
                // Якщо атака закінчилась (наприклад, 600мс), скидаємо
                if (state.runAttackTime > this.runAttackAnimation.duration) {
                    state.runAttackTime = 0;
                }
            } else if (isAttacking) {
                state.attackTime += deltaMs;
                this.attackAnimation.drawFrame(
                    ctx,
                    isoX,
                    isoY,
                    dir as AttackDirection,
                    1,
                    state.attackTime,
                );
                if (state.attackTime > this.attackAnimation.duration) {
                    state.attackTime = 0;
                }
            } else if (isMoving) {
                this.runAnimation.draw(ctx, isoX, isoY, dir as RunDirection, 1);
                // Скидаємо атаку, якщо не атакує
                state.attackTime = 0;
                state.runAttackTime = 0;
            } else {
                this.idleAnimation.draw(ctx, isoX, isoY, dir as IdleDirection, 1);
                state.attackTime = 0;
                state.runAttackTime = 0;
            }
            ctx.restore();

            // id над спрайтом
            ctx.save();
            ctx.font = '12px monospace';
            ctx.fillStyle = '#222';
            ctx.textAlign = 'center';
            ctx.fillText(other.id.slice(0, 6), isoX, isoY - 40);
            ctx.restore();
        }
    }

    private getDirection(
        dir: string,
    ): RunDirection | IdleDirection | AttackDirection | RunAttackDirection {
        switch (dir) {
            case 'up':
            case 'up-left':
            case 'up-right':
                return 'up';
            case 'down':
            case 'down-left':
            case 'down-right':
                return 'down';
            case 'left':
                return 'left';
            case 'right':
                return 'right';
            default:
                return 'down';
        }
    }

    /**
     * Генерує колір для гравця на основі його id.
     */
    private getColorForId(id: string): string {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
}
