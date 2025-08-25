import { Scene } from '../engine/index.js';
import { isoToGrid } from '../utils/isometric.js';
import { PlayerAnimation, RunDirection } from '../sprites/PlayerAnimation.js';
import { PlayerIdleAnimation, IdleDirection } from '../sprites/PlayerIdleAnimation.js';
import { PlayerAttackAnimation, AttackDirection } from '../sprites/PlayerAttackAnimation.js';
import {
    PlayerRunAttackAnimation,
    RunAttackDirection,
} from '../sprites/PlayerRunAttackAnimation.js';

type Direction =
    | 'up'
    | 'down'
    | 'left'
    | 'right'
    | 'up-right'
    | 'up-left'
    | 'down-right'
    | 'down-left'
    | 'none';

export class Player implements Scene {
    /** Поточна координата X гравця на сітці */
    public x = 5;
    /** Поточна координата Y гравця на сітці */
    public y = 5;
    /** Цільова координата X для руху */
    private targetX = 5;
    /** Цільова координата Y для руху */
    private targetY = 5;
    /** Швидкість руху гравця (тайлів за секунду) */
    public speed = 5;
    /** Ширина одного тайла (пікселів) */
    private tileWidth = 64;
    /** Висота одного тайла (пікселів) */
    private tileHeight = 32;

    /** Чи натиснута мишка (для керування рухом) */
    private mouseDown = false;
    /** Поточний напрямок руху гравця */
    public direction: Direction = 'down';

    /** Функція для отримання типу тайла за координатами */
    private getTileTypeAt: (gx: number, gy: number) => string;

    /** Поточна позиція миші відносно canvas */
    private mousePos: { x: number; y: number } = { x: 0, y: 0 };

    // --- Анімації персонажа ---
    /** Анімація бігу */
    public runAnimation = new PlayerAnimation();
    /** Анімація спокою */
    public idleAnimation = new PlayerIdleAnimation();
    /** Анімація атаки */
    public attackAnimation = new PlayerAttackAnimation();
    /** Анімація атаки під час бігу */
    public runAttackAnimation = new PlayerRunAttackAnimation();

    /** Чи зараз виконується атака */
    public isAttacking = false;
    /** Чи зараз виконується атака під час бігу */
    public isRunAttacking = false;

    /**
     * Конструктор. Приймає функцію для отримання типу тайла за координатами.
     */
    constructor(getTileTypeAt: (gx: number, gy: number) => string) {
        this.getTileTypeAt = getTileTypeAt;
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.addEventListener('mousedown', this.onMouseDown);
            canvas.addEventListener('mouseup', this.onMouseUp);
            canvas.addEventListener('mouseleave', this.onMouseUp);
            canvas.addEventListener('mousemove', this.onMouseMove);
        }
    }

    /**
     * Обробник натискання кнопки миші. Вмикає режим руху та оновлює ціль.
     */
    private onMouseDown = (e: MouseEvent) => {
        this.mouseDown = true;
        this.updateMousePos(e);
        this.updateTarget();
    };

    /**
     * Обробник відпускання кнопки миші. Вимикає режим руху.
     */
    private onMouseUp = (_: MouseEvent) => {
        this.mouseDown = false;
    };

    /**
     * Обробник руху миші. Якщо мишка натиснута — оновлює ціль.
     */
    private onMouseMove = (e: MouseEvent) => {
        this.updateMousePos(e);
        if (this.mouseDown) {
            this.updateTarget();
        }
    };

    /**
     * Оновлює координати миші відносно canvas.
     */
    private updateMousePos(e: MouseEvent) {
        const canvas = e.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
    }

    /**
     * Оновлює цільові координати для руху гравця на основі позиції миші.
     */
    private updateTarget() {
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const w = canvas.width;
        const h = canvas.height;
        const gameFieldWidth = w * 0.65;
        if (this.mousePos.x < gameFieldWidth) {
            const centerX = gameFieldWidth / 2;
            const centerY = h / 2;
            const { gx, gy } = isoToGrid(
                this.mousePos.x - centerX,
                this.mousePos.y - centerY,
                0,
                0,
                this.tileWidth,
                this.tileHeight,
            );
            const newTargetX = Math.round(this.x + gx);
            const newTargetY = Math.round(this.y + gy);

            // Не дозволяємо ставити ціль на камінь
            if (this.getTileTypeAt(newTargetX, newTargetY) === 'stone') {
                return;
            }

            this.updateDirection(newTargetX - this.x, newTargetY - this.y);
            this.targetX = newTargetX;
            this.targetY = newTargetY;
        }
    }

    /**
     * Оновлює напрямок руху гравця на основі зміщення dx, dy.
     */
    private updateDirection(dx: number, dy: number) {
        if (dx === 0 && dy === 0) return;
        const angle = Math.atan2(dy, dx);
        if (angle >= -Math.PI / 8 && angle < Math.PI / 8) {
            this.direction = 'right';
        } else if (angle >= Math.PI / 8 && angle < (3 * Math.PI) / 8) {
            this.direction = 'down-right';
        } else if (angle >= (3 * Math.PI) / 8 && angle < (5 * Math.PI) / 8) {
            this.direction = 'down';
        } else if (angle >= (5 * Math.PI) / 8 && angle < (7 * Math.PI) / 8) {
            this.direction = 'left';
        } else if (angle >= (7 * Math.PI) / 8 || angle < (-7 * Math.PI) / 8) {
            this.direction = 'left';
        } else if (angle >= (-7 * Math.PI) / 8 && angle < (-5 * Math.PI) / 8) {
            this.direction = 'up-left';
        } else if (angle >= (-5 * Math.PI) / 8 && angle < (-3 * Math.PI) / 8) {
            this.direction = 'up';
        } else if (angle >= (-3 * Math.PI) / 8 && angle < -Math.PI / 8) {
            this.direction = 'right';
        }
    }

    /**
     * Оновлює позицію гравця згідно з цільовими координатами, враховуючи колізії.
     * @param delta Час з моменту останнього оновлення (секунди)
     */
    update(delta: number): void {
        // Якщо мишка не натиснута — не рухаємо персонажа, координати фіксуємо до цілих
        if (!this.mouseDown) {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            this.targetX = this.x;
            this.targetY = this.y;
            return;
        }

        const speed = this.speed * delta;
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);

        // Якщо персонаж майже на цілі — фіксуємо координати до цілих
        if (dist < 0.01) {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            this.targetX = this.x;
            this.targetY = this.y;
            return;
        }

        let stepX = 0,
            stepY = 0;
        if (Math.abs(dx) > 0.01) stepX = Math.sign(dx);
        if (Math.abs(dy) > 0.01) stepY = Math.sign(dy);

        // Перевіряємо діагональний рух
        if (stepX !== 0 && stepY !== 0) {
            const nextDiagX = Math.round(this.x + stepX);
            const nextDiagY = Math.round(this.y + stepY);
            const nextX = Math.round(this.x + stepX);
            const nextY = Math.round(this.y + stepY);

            const nextDiagType = this.getTileTypeAt(nextDiagX, nextDiagY);
            const nextXType = this.getTileTypeAt(nextX, Math.round(this.y));
            const nextYType = this.getTileTypeAt(Math.round(this.x), nextY);

            if (nextDiagType !== 'stone' && nextXType !== 'stone' && nextYType !== 'stone') {
                // Діагональний рух дозволено лише якщо всі три тайли не камінь
                this.x += (dx / dist) * Math.min(speed, dist);
                this.y += (dy / dist) * Math.min(speed, dist);
            } else if (nextXType !== 'stone' && nextYType === 'stone') {
                // Можна рухатись лише по X, але не залазимо на перешкоду по Y
                this.x += (dx / Math.abs(dx)) * Math.min(speed, Math.abs(dx));
                this.y = Math.round(this.y);
            } else if (nextYType !== 'stone' && nextXType === 'stone') {
                // Можна рухатись лише по Y, але не залазимо на перешкоду по X
                this.y += (dy / Math.abs(dy)) * Math.min(speed, Math.abs(dy));
                this.x = Math.round(this.x);
            } else {
                // Перешкода — координати не змінюються, але дозволяємо анімацію
                this.x = Math.round(this.x);
                this.y = Math.round(this.y);
            }
        } else if (stepX !== 0) {
            // Рух тільки по X
            const nextX = Math.round(this.x + stepX);
            const nextXType = this.getTileTypeAt(nextX, Math.round(this.y));
            if (nextXType !== 'stone') {
                this.x += (dx / Math.abs(dx)) * Math.min(speed, Math.abs(dx));
            } else {
                this.x = Math.round(this.x);
            }
        } else if (stepY !== 0) {
            // Рух тільки по Y
            const nextY = Math.round(this.y + stepY);
            const nextYType = this.getTileTypeAt(Math.round(this.x), nextY);
            if (nextYType !== 'stone') {
                this.y += (dy / Math.abs(dy)) * Math.min(speed, Math.abs(dy));
            } else {
                this.y = Math.round(this.y);
            }
        }
    }

    /**
     * Оновлює всі анімації персонажа.
     * @param deltaMs Час з моменту останнього оновлення (мілісекунди)
     */
    public updateAnimations(deltaMs: number) {
        this.runAnimation.update(deltaMs);
        this.idleAnimation.update(deltaMs);
        this.attackAnimation.update(deltaMs);
        this.runAttackAnimation.update(deltaMs);

        if (this.attackAnimation.finished) {
            this.attackAnimation.reset();
            this.isAttacking = false;
        }
        if (this.runAttackAnimation.finished) {
            this.runAttackAnimation.reset();
            this.isRunAttacking = false;
        }
    }

    /**
     * Чекає завантаження всіх анімацій персонажа.
     */
    public async animationsLoaded() {
        await Promise.all([
            this.runAnimation.loaded,
            this.idleAnimation.loaded,
            this.attackAnimation.loaded,
            this.runAttackAnimation.loaded,
        ]);
    }

    /**
     * Малює персонажа з відповідною анімацією.
     */
    public async draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        direction: RunDirection | IdleDirection | AttackDirection | RunAttackDirection,
        isMoving: boolean,
    ) {
        if (this.runAttackAnimation.playing) {
            this.runAttackAnimation.draw(ctx, x, y, direction as RunAttackDirection, 1);
        } else if (this.attackAnimation.playing) {
            this.attackAnimation.draw(ctx, x, y, direction as AttackDirection, 1);
        } else if (isMoving) {
            this.runAnimation.draw(ctx, x, y, direction as RunDirection, 1);
        } else {
            this.idleAnimation.draw(ctx, x, y, direction as IdleDirection, 1);
        }
    }

    /**
     * Порожній метод рендеру (для сумісності з Scene).
     */
    render(_: CanvasRenderingContext2D): void {}
}
