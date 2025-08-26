import { Scene } from '../engine/index.js';
import { Player } from '../entities/Player.js';
import { GameField } from './GameField.js';
import { Chat } from './Chat.js';
import { Info } from './Info.js';
import { TileTextures } from '../tiles/TileTextures.js';
import { PlayerNetworkClient } from '../net/PlayerNetworkClient.js';
import { TabsPanel, TabId } from '../ui/TabsPanel.js';
import { OtherPlayersRenderer } from './OtherPlayersRenderer.js';
import { Button } from '../ui/Button.js';

export class MainScene implements Scene {
    private showGrid = false;
    private tileWidth = 64;
    private tileHeight = 32;
    private gridSize = 15;

    private player: Player;
    private gameField: GameField;
    private chat: Chat;
    private info: Info;
    private textures: TileTextures;

    private scale = 1;

    private net: PlayerNetworkClient;
    private knownPlayerIds = new Set<string>();

    private tabsPanel: TabsPanel;
    private otherPlayersRenderer: OtherPlayersRenderer;

    private exampleButton: Button;

    private canvas: HTMLCanvasElement | null = null;

    public isActive = false; // Додаємо прапорець активності

    constructor() {
        this.textures = new TileTextures();

        // Створюємо Player одразу, але GameField створимо після отримання карти
        this.player = new Player((gx, gy) => this.gameField?.getTileTypeAt(gx, gy));
        this.gameField = undefined as any; // GameField буде створено після отримання карти

        this.chat = new Chat();
        this.info = new Info(this.player);

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
                        'up-left': -1,
                        'up-right': 1,
                        'down-left': -1,
                        'down-right': 1,
                        none: 0,
                    }[this.player.direction] ?? 0;
                const dy =
                    {
                        up: -1,
                        down: 1,
                        left: 0,
                        right: 0,
                        'up-left': -1,
                        'up-right': -1,
                        'down-left': 1,
                        'down-right': 1,
                        none: 0,
                    }[this.player.direction] ?? 0;
                const targetX = Math.round(this.player.x + dx);
                const targetY = Math.round(this.player.y + dy);
                this.attackCell(targetX, targetY);
            }
        });

        window.addEventListener(
            'wheel',
            (e) => {
                // Визначаємо чи курсор над секцією чату
                const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const w = canvas.width;
                const h = canvas.height;
                const gameFieldWidth = w * 0.65;
                const infoHeight = h * 0.3;
                const chatHeight = h - infoHeight;
                if (x >= gameFieldWidth && y >= 0 && y <= chatHeight) {
                    this.chat.handleWheel(e);
                    e.preventDefault();
                }
            },
            { passive: false },
        );

        // Використання PlayerNetworkClient
        this.net = new PlayerNetworkClient(
            'ws://localhost:3000',
            (id) => {
                this.chat.addMessage(`Ваш серверний id: ${id}`);
            },
            this.player.x,
            this.player.y,
            this.player.direction,
            (map, width, height, rooms) => {
                // Створюємо GameField тільки після отримання карти
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

        this.tabsPanel = new TabsPanel([
            { id: 'chat', label: 'Чат', render: (ctx, w, h) => this.chat.render(ctx, w, h) },
            { id: 'info', label: 'Інфо', render: (ctx, w, h) => this.info.render(ctx, w, h) },
            // Додайте інші таби за потреби
        ]);

        this.otherPlayersRenderer = new OtherPlayersRenderer(this.tileWidth, this.tileHeight);

        this.exampleButton = new Button(
            900, // x (наприклад, праворуч)
            10, // y (зверху)
            120, // width
            40, // height
            'Натисни мене',
            () => alert('Кнопка натиснута!'),
            () => this.isActive,
        );
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

    private onWheel = (e: WheelEvent) => {
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const w = canvas.width;
        const h = canvas.height;
        const gameFieldWidth = w * 0.65;
        const infoHeight = h * 0.3;
        const chatHeight = h - infoHeight;
        if (x >= gameFieldWidth && y >= 0 && y <= chatHeight) {
            this.chat.handleWheel(e);
            e.preventDefault();
        }
    };

    private onMouseDown = (e: MouseEvent) => {
        // Ваш код для обробки кліку миші у MainScene
        // Наприклад, рух гравця:
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Далі ваша логіка для визначення цілі руху
        // this.player.setTargetByScreenCoords(x, y);
    };

    onActivate() {
        this.isActive = true;
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keydown', this.onSpaceDown);
        window.addEventListener('wheel', this.onWheel, { passive: false });

        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', this.onMouseDown);
        }
    }

    onDeactivate() {
        this.isActive = false;
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keydown', this.onSpaceDown);
        window.removeEventListener('wheel', this.onWheel);

        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.onMouseDown);
        }
    }

    private getDirection(): 'up' | 'down' | 'left' | 'right' {
        // Повертаємо direction напряму, якщо він валідний, інакше 'down'
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

        this.net.sendMove(
            this.player.x,
            this.player.y,
            this.player.direction,
            isMoving,
            this.player.isAttacking,
            this.player.isRunAttacking,
            this.player.isDead,
            this.player.isHurt,
            this.player.isDead ? this.player['deathDirection'] : undefined,
        );
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        // Дочекайтесь завантаження текстур і анімацій перед першим рендером
        await Promise.all([this.textures.loaded, this.player.animationsLoaded()]);

        ctx.save();
        // Масштабуємо відносно центру ігрового поля
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const gameFieldWidth = w * 0.65;
        const centerX = gameFieldWidth / 2;
        const centerY = h / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-centerX, -centerY);

        this.gameField.render(ctx, w, h);

        // Визначаємо напрямок і стан руху
        let dir = this.getDirection();
        const isMoving =
            Math.abs(this.player.x - (this.player as any).targetX) > 0.01 ||
            Math.abs(this.player.y - (this.player as any).targetY) > 0.01;

        // Малюємо анімацію персонажа через метод draw класу Player
        await this.player.draw(ctx, centerX, centerY, dir, isMoving);

        ctx.restore();

        // Малюємо UI з табами
        this.tabsPanel.render(ctx, ctx.canvas.width, ctx.canvas.height);

        // --- Відстеження підключень/відключень інших гравців ---
        const currentIds = new Set<string>();
        for (const other of this.net.getOtherPlayers()) {
            currentIds.add(other.id);
        }

        // Нові підключення
        for (const id of currentIds) {
            if (!this.knownPlayerIds.has(id)) {
                this.chat.addMessage(`Гравець з id ${id} приєднався до сервера`);
            }
        }
        // Відключення
        for (const id of this.knownPlayerIds) {
            if (!currentIds.has(id)) {
                this.chat.addMessage(`Гравець з id ${id} від'єднався від сервера`);
            }
        }
        this.knownPlayerIds = currentIds;

        // Малюємо інших гравців через окремий клас
        this.otherPlayersRenderer.render(
            ctx,
            this.player.x,
            this.player.y,
            centerX,
            centerY,
            this.net.getOtherPlayers(),
        );

        this.exampleButton.render(ctx);
    }

    attackCell(targetX: number, targetY: number) {
        this.net.sendAttack(targetX, targetY);
    }
}
