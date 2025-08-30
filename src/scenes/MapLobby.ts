import { Scene } from './Scene.js';
import { Button } from '../ui/Button.js';
import { GameSocket } from '../net/GameSocket.js';
import { drawText } from '../utils/drawText.js';

export class MapLobby implements Scene {
    private socket: GameSocket;
    private maps: string[] = [];
    private mapButtons: Button[] = [];
    private onConnect: (mapName: string) => void;
    private onBack: () => void;
    public isActive = false;
    private generateButton: Button;
    private backButton: Button;
    private loadingMapName: string | null = null;

    constructor(onConnect: (mapName: string) => void, gameSocket: GameSocket, onBack: () => void) {
        this.onConnect = onConnect;
        this.onBack = onBack;
        this.socket = gameSocket;
        this.socket.onMessage((data) => {
            if (data.type === 'maps_list' && Array.isArray(data.maps)) {
                this.maps = data.maps;
                this.createButtons();
            }
            if (data.type === 'map_generated') {
                this.socket.send({ type: 'list_maps' });
            }
            if (data.type === 'map' && this.loadingMapName) {
                const mapName = this.loadingMapName;
                this.loadingMapName = null;
                this.onConnect(mapName); // Тут має створюватися MainScene і встановлюватися нова сцена
            }
        });
        this.socket.send({ type: 'list_maps' });

        // Кнопка генерації карти
        this.generateButton = new Button(
            400,
            130,
            300,
            40,
            'Згенерувати нову карту',
            () => this.handleGenerateMap(),
            () => this.isActive,
        );

        // Кнопка "Повернутись назад"
        this.backButton = new Button(
            400,
            600,
            300,
            40,
            'Повернутись назад',
            () => this.onBack(),
            () => this.isActive,
        );
    }

    private handleGenerateMap() {
        // Можна зробити більш гнучко, наприклад, через форму, тут — простий приклад
        const name = `map_${Date.now()}`;
        this.socket.send({
            type: 'generate_map',
            name,
            width: 32,
            height: 32,
            roomCount: 12,
            minRoomSize: 4,
            maxRoomSize: 8,
            seed: Math.floor(Math.random() * 1000000),
        });
    }

    private createButtons() {
        this.mapButtons = this.maps.map(
            (name, i) =>
                new Button(
                    400,
                    180 + i * 70,
                    300,
                    50,
                    name,
                    () => this.handleMapClick(name),
                    () => this.isActive && !this.loadingMapName,
                ),
        );
    }

    private handleMapClick(name: string) {
        this.loadingMapName = name;
        this.socket.send({ type: 'load_map', name });
    }

    onActivate() {
        this.isActive = true;
        this.createButtons();
    }

    onDeactivate() {
        this.isActive = false;
    }

    update(_: number) {}

    render(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.fillStyle = '#181a1b';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        drawText(
            ctx,
            this.loadingMapName ? 'Завантаження карти...' : 'Оберіть карту для підключення',
            ctx.canvas.width / 2,
            120,
            'bold 28px sans-serif',
            '#fff',
        );
        ctx.restore();

        this.generateButton.render(ctx);
        this.mapButtons.forEach((btn) => btn.render(ctx));
        this.backButton.render(ctx);
    }
}
