import { PlayerNetData } from '../net/PlayerNetworkClient.js';
import { PlayerAnimation, RunDirection } from '../sprites/PlayerAnimation.js';
import { PlayerIdleAnimation, IdleDirection } from '../sprites/PlayerIdleAnimation.js';
import { PlayerAttackAnimation, AttackDirection } from '../sprites/PlayerAttackAnimation.js';
import {
    PlayerRunAttackAnimation,
    RunAttackDirection,
} from '../sprites/PlayerRunAttackAnimation.js';
import { PlayerDeathAnimation, DeathDirection } from '../sprites/PlayerDeathAnimation.js';
import { PlayerHurtAnimation, HurtDirection } from '../sprites/PlayerHurtAnimation.js';

type AnimationState = {
    attackTime: number;
    runAttackTime: number;
    deathTime: number;
    hurtTime: number;
    lastIsAttacking: boolean;
    lastIsRunAttacking: boolean;
    lastIsDead: boolean;
    lastIsHurt: boolean;
};

export class OtherPlayersRenderer {
    private runAnimation = new PlayerAnimation();
    private idleAnimation = new PlayerIdleAnimation();
    private attackAnimation = new PlayerAttackAnimation();
    private runAttackAnimation = new PlayerRunAttackAnimation();
    private deathAnimation = new PlayerDeathAnimation();
    private hurtAnimation = new PlayerHurtAnimation();

    private runLoaded = this.runAnimation.loaded;
    private idleLoaded = this.idleAnimation.loaded;
    private attackLoaded = this.attackAnimation.loaded;
    private runAttackLoaded = this.runAttackAnimation.loaded;
    private deathLoaded = this.deathAnimation.loaded;
    private hurtLoaded = this.hurtAnimation.loaded;

    private animationStates = new Map<string, AnimationState>();

    constructor(
        private tileWidth: number,
        private tileHeight: number,
    ) {}

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
            this.deathLoaded,
            this.hurtLoaded,
        ]);

        this.runAnimation.update(deltaMs);
        this.idleAnimation.update(deltaMs);

        for (const other of others) {
            // --- СТАН АНІМАЦІЙ ДЛЯ КОЖНОГО ГРАВЦЯ ---
            let state = this.animationStates.get(other.id);
            if (!state) {
                state = {
                    attackTime: 0,
                    runAttackTime: 0,
                    deathTime: 0,
                    hurtTime: 0,
                    lastIsAttacking: false,
                    lastIsRunAttacking: false,
                    lastIsDead: false,
                    lastIsHurt: false,
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
            const isDead = !!other.isDead;
            const isHurt = !!other.isHurt;
            const deathDirection = (other.deathDirection || dir) as DeathDirection;
            const hurtDirection = dir as HurtDirection;

            ctx.save();
            ctx.filter = `drop-shadow(0 0 0 ${color})`;

            // --- Анімація смерті ---
            if (isDead) {
                // Якщо тільки почалась смерть — скидаємо deathTime
                if (!state.lastIsDead) state.deathTime = 0;
                state.deathTime += deltaMs;
                this.deathAnimation.drawFrame(ctx, isoX, isoY, deathDirection, 1, state.deathTime);
                state.lastIsDead = true;
                state.lastIsHurt = false;
                state.hurtTime = 0;
                ctx.restore();
                this.drawId(ctx, other.id, isoX, isoY);
                continue;
            }

            // --- Анімація отримання урона ---
            if (isHurt) {
                if (!state.lastIsHurt) state.hurtTime = 0;
                state.hurtTime += deltaMs;
                this.hurtAnimation.drawFrame(ctx, isoX, isoY, hurtDirection, 1, state.hurtTime);
                // Якщо анімація завершилась, не малюємо hurt далі (але це має контролювати сервер)
                state.lastIsHurt = true;
                state.lastIsDead = false;
                state.deathTime = 0;
                ctx.restore();
                this.drawId(ctx, other.id, isoX, isoY);
                continue;
            }

            // --- Атака під час бігу ---
            if (isRunAttacking) {
                if (!state.lastIsRunAttacking) state.runAttackTime = 0;
                state.runAttackTime += deltaMs;
                this.runAttackAnimation.drawFrame(
                    ctx,
                    isoX,
                    isoY,
                    dir as RunAttackDirection,
                    1,
                    state.runAttackTime,
                );
                state.lastIsRunAttacking = true;
                state.lastIsAttacking = false;
                state.attackTime = 0;
                ctx.restore();
                this.drawId(ctx, other.id, isoX, isoY);
                continue;
            }

            // --- Атака на місці ---
            if (isAttacking) {
                if (!state.lastIsAttacking) state.attackTime = 0;
                state.attackTime += deltaMs;
                this.attackAnimation.drawFrame(
                    ctx,
                    isoX,
                    isoY,
                    dir as AttackDirection,
                    1,
                    state.attackTime,
                );
                state.lastIsAttacking = true;
                state.lastIsRunAttacking = false;
                state.runAttackTime = 0;
                ctx.restore();
                this.drawId(ctx, other.id, isoX, isoY);
                continue;
            }

            // --- Біг ---
            if (isMoving) {
                this.runAnimation.draw(ctx, isoX, isoY, dir as RunDirection, 1);
                // Скидаємо інші анімації
                state.attackTime = 0;
                state.runAttackTime = 0;
                state.deathTime = 0;
                state.hurtTime = 0;
                state.lastIsAttacking = false;
                state.lastIsRunAttacking = false;
                state.lastIsDead = false;
                state.lastIsHurt = false;
            } else {
                // --- Idle ---
                this.idleAnimation.draw(ctx, isoX, isoY, dir as IdleDirection, 1);
                state.attackTime = 0;
                state.runAttackTime = 0;
                state.deathTime = 0;
                state.hurtTime = 0;
                state.lastIsAttacking = false;
                state.lastIsRunAttacking = false;
                state.lastIsDead = false;
                state.lastIsHurt = false;
            }
            ctx.restore();
            this.drawId(ctx, other.id, isoX, isoY);
        }
    }

    private drawId(ctx: CanvasRenderingContext2D, id: string, x: number, y: number) {
        ctx.save();
        ctx.font = '12px monospace';
        ctx.fillStyle = '#222';
        ctx.textAlign = 'center';
        ctx.fillText(id.slice(0, 6), x, y - 40);
        ctx.restore();
    }

    private getDirection(
        dir: string,
    ): RunDirection | IdleDirection | AttackDirection | RunAttackDirection {
        return ['up', 'down', 'left', 'right'].includes(dir) ? (dir as RunDirection) : 'down';
    }

    private getColorForId(id: string): string {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
}
