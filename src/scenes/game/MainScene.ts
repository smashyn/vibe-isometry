import { Scene } from '../Scene.js';
import { Player } from '../../entities/Player.js';
import { MapRenderer } from './MapRenderer.js';
import { PlayerRenderer } from './PlayerRenderer.js';
import { sceneManager } from '../../SceneManager.js';

export class MainScene implements Scene {
    private player: Player | null = null;
    private section: any = null;

    private mapRenderer: MapRenderer;
    private playerRenderer: PlayerRenderer;

    public isActive: boolean = false;

    private username: string;
    private roomId: string;

    private initialized: boolean = false;

    constructor(username: string, roomId: string) {
        this.username = username;
        this.roomId = roomId;

        this.mapRenderer = new MapRenderer();
        this.playerRenderer = new PlayerRenderer();

        this.init();
    }

    private init() {
        if (this.initialized) return;
        this.initialized = true;

        sceneManager.gameSocket.onType('section', (data) => {
            this.section = data.section;
        });

        sceneManager.gameSocket.send({ type: 'request_section', roomId: this.roomId });
    }

    onActivate() {
        this.isActive = true;
    }

    onDeactivate() {
        this.isActive = false;
    }

    update(delta: number): void {
        if (this.player) this.player.update(delta);
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        // Очищаємо канвас і заповнюємо темним кольором
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // скидаємо трансформації
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#222'; // темний фон
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        this.mapRenderer.render(ctx, this.section);
        this.playerRenderer.render(ctx, this.player);

        ctx.restore();
    }
}
