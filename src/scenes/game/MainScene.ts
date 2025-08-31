import { Scene } from '../Scene.js';
import { Player } from '../../entities/Player.js';
import { GameField } from './GameField.js';
import { TileTextures } from '../../tiles/TileTextures.js';
import { PlayerNetworkClient } from '../../net/PlayerNetworkClient.js';
import { OtherPlayersRenderer } from './OtherPlayersRenderer.js';
import { CanvasContext } from '../../engine/CanvasContext.js';
import { sceneManager } from '../../SceneManager.js';

export class MainScene implements Scene {
    private showGrid = false;
    private tileWidth = 64;
    private tileHeight = 32;
    private gridSize = 15;

    private player: Player;
    private gameField: GameField;
    private textures: TileTextures;

    private scale = 1;

    private net: PlayerNetworkClient;
    private knownPlayerIds = new Set<string>();

    private otherPlayersRenderer: OtherPlayersRenderer;

    private canvas: HTMLCanvasElement | null = null;

    public isActive = false;

    private lastSentState: any = null;

    // Додайте поле для збереження колбеку повернення
    private onBackToLobby: (() => void) | undefined;

    constructor(mapName: string, onBackToLobby?: () => void) {
        this.textures = new TileTextures();
        this.onBackToLobby = onBackToLobby;

        // Очищення канваса при створенні MainScene
        const canvas = CanvasContext.getInstance();
        if (canvas) {
            const ctx = canvas.canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        // Створюємо Player одразу, але GameField створимо після отримання карти
        this.player = new Player((gx, gy) => this.gameField?.getTileTypeAt(gx, gy));
        this.gameField = undefined as any; // GameField буде створено після отримання карти

        // Атака по пробілу (run-attack якщо персонаж рухається)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                const isMoving =
                    Math.abs(this.player.x - (this.player as any).targetX) > 0.01 ||
                    Math.abs(this.player.y - (this.player as any).targetY) > 0.01;
                const dir = this.getDirection();
                if (isMoving && !this.player.runAttackAnimation.playing) {
                    this.player.runAttackAnimation.start(dir);
                    this.player.isRunAttacking = true;
                } else if (!isMoving && !this.player.attackAnimation.playing) {
                    this.player.attackAnimation.start(dir);
                    this.player.isAttacking = true;
                }
                // Визначаємо координати цільової клітини (наприклад, перед гравцем)
                const dx =
                    {
                        up: 0,
                        down: 0,
                        left: -1,
                        right: 1,
                        none: 0,
                    }[this.player.direction] ?? 0;
                const dy =
                    {
                        up: -1,
                        down: 1,
                        left: 0,
                        right: 0,
                        none: 0,
                    }[this.player.direction] ?? 0;
                const targetX = Math.round(this.player.x + dx);
                const targetY = Math.round(this.player.y + dy);
                this.attackCell(targetX, targetY);
            }
        });

        // --- Використання PlayerNetworkClient з GameSocket ---
        this.net = new PlayerNetworkClient(
            sceneManager.gameSocket,
            () => {},
            this.player.x,
            this.player.y,
            this.player.direction,
            (map, width, height, rooms) => {
                // Створюємо gameField тільки після отримання карти
                this.gameField = new GameField(
                    this.player,
                    () => this.showGrid,
                    this.tileWidth,
                    this.tileHeight,
                    this.gridSize,
                    this.textures,
                    map,
                    width,
                    height,
                    rooms,
                );
            },
        );

        this.otherPlayersRenderer = new OtherPlayersRenderer(this.tileWidth, this.tileHeight);

        sceneManager.gameSocket.send({ type: 'load_map', name: mapName });
    }

    private onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'p' || e.key === 'P') {
            this.showGrid = !this.showGrid;
        }
    };

    private onSpaceDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            const isMoving =
                Math.abs(this.player.x - (this.player as any).targetX) > 0.01 ||
                Math.abs(this.player.y - (this.player as any).targetY) > 0.01;
            const dir = this.getDirection();
            if (isMoving && !this.player.runAttackAnimation.playing) {
                this.player.runAttackAnimation.start(dir);
                this.player.isRunAttacking = true;
            } else if (!isMoving && !this.player.attackAnimation.playing) {
                this.player.attackAnimation.start(dir);
                this.player.isAttacking = true;
            }
            const dx = { up: 0, down: 0, left: -1, right: 1, none: 0 }[this.player.direction] ?? 0;
            const dy = { up: -1, down: 1, left: 0, right: 0, none: 0 }[this.player.direction] ?? 0;
            const targetX = Math.round(this.player.x + dx);
            const targetY = Math.round(this.player.y + dy);
            this.attackCell(targetX, targetY);
        }
    };

    private onMouseDown = (e: MouseEvent) => {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    };

    // Додайте обробник Escape
    private onEscDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.onBackToLobby) {
            this.onBackToLobby();
        }
    };

    onActivate() {
        this.isActive = true;
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keydown', this.onSpaceDown);
        window.addEventListener('keydown', this.onEscDown); // Додаємо обробник Escape

        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', this.onMouseDown);
        }
    }

    onDeactivate() {
        this.isActive = false;
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keydown', this.onSpaceDown);
        window.removeEventListener('keydown', this.onEscDown); // Видаляємо обробник Escape

        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.onMouseDown);
        }
    }

    private getDirection(): 'up' | 'down' | 'left' | 'right' {
        return ['up', 'down', 'left', 'right'].includes(this.player.direction)
            ? (this.player.direction as 'up' | 'down' | 'left' | 'right')
            : 'down';
    }

    update(delta: number): void {
        this.player.update(delta);
        this.player.updateAnimations(delta * 1000);

        const isMoving =
            Math.abs(this.player.x - (this.player as any).targetX) > 0.01 ||
            Math.abs(this.player.y - (this.player as any).targetY) > 0.01;

        const state = {
            x: this.player.x,
            y: this.player.y,
            direction: this.player.direction,
            isMoving,
            isAttacking: this.player.isAttacking,
            isRunAttacking: this.player.isRunAttacking,
            isDead: this.player.isDead,
            isHurt: this.player.isHurt,
            deathDirection: this.player.isDead ? this.player['deathDirection'] : undefined,
        };

        // Відправляємо move тільки якщо стан змінився
        if (!this.lastSentState || JSON.stringify(state) !== JSON.stringify(this.lastSentState)) {
            this.net.sendMove(
                state.x,
                state.y,
                state.direction,
                state.isMoving,
                state.isAttacking,
                state.isRunAttacking,
                state.isDead,
                state.isHurt,
                state.deathDirection,
            );
            this.lastSentState = { ...state };
        }
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        await Promise.all([this.textures.loaded, this.player.animationsLoaded()]);

        ctx.save();
        // Масштабуємо відносно центру ігрового поля
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-centerX, -centerY);

        // Малюємо карту
        if (this.gameField) {
            this.gameField.render(ctx, w, h);
        }

        // Малюємо свого гравця (локально)
        const dir = this.getDirection();
        const isMoving =
            Math.abs(this.player.x - (this.player as any).targetX) > 0.01 ||
            Math.abs(this.player.y - (this.player as any).targetY) > 0.01;

        await this.player.draw(ctx, centerX, centerY, dir, isMoving);

        // Малюємо інших гравців (тільки тих, що прийшли з сервера)
        this.otherPlayersRenderer.render(
            ctx,
            this.player.x,
            this.player.y,
            centerX,
            centerY,
            this.net.getOtherPlayers(), // тут будуть тільки інші гравці
        );

        ctx.restore();
    }

    attackCell(targetX: number, targetY: number) {
        this.net.sendAttack(targetX, targetY);
    }
}
