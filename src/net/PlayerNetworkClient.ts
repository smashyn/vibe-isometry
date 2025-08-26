export type PlayerNetData = {
    id: string;
    x: number;
    y: number;
    direction: string;
    isMoving?: boolean;
    isAttacking?: boolean;
    isRunAttacking?: boolean;
    isDead?: boolean;
    isHurt?: boolean;
    deathDirection?: string;
};

type PlayersUpdate = {
    type: 'players';
    players: PlayerNetData[];
};

type MapUpdate = {
    type: 'map';
    width: number;
    height: number;
    map: any;
    rooms: any;
};

export class PlayerNetworkClient {
    private ws: WebSocket;
    public players: Map<string, PlayerNetData> = new Map();
    private myId: string | null = null;
    private queuedJoin: { x: number; y: number; direction: string } | null = null;

    // Додаємо збереження карти
    public map: any = null;
    public mapWidth: number = 0;
    public mapHeight: number = 0;
    public mapRooms: any = null;
    public onMap?: (map: any, width: number, height: number, rooms: any) => void;

    /**
     * @param serverUrl адреса сервера
     * @param onId отримати id від сервера (callback, викликається один раз)
     * @param startX стартова координата X
     * @param startY стартова координата Y
     * @param direction стартовий напрямок
     * @param onMap callback для отримання карти (необов'язково)
     */
    constructor(
        serverUrl: string,
        onId: (id: string) => void,
        startX: number,
        startY: number,
        direction: string,
        onMap?: (map: any, width: number, height: number, rooms: any) => void,
    ) {
        this.ws = new WebSocket(serverUrl);
        if (onMap) this.onMap = onMap;

        this.ws.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'id') {
                    this.myId = data.id;
                    onId(data.id); // Передаємо id у callback
                    // Надсилаємо join тільки після отримання id
                    if (this.queuedJoin) {
                        this.sendJoin(
                            this.queuedJoin.x,
                            this.queuedJoin.y,
                            this.queuedJoin.direction,
                        );
                        this.queuedJoin = null;
                    }
                } else if (data.type === 'players') {
                    this.players.clear();
                    for (const p of data.players) {
                        this.players.set(p.id, p);
                    }
                } else if (data.type === 'map') {
                    // --- Отримання карти від сервера ---
                    this.map = data.map;
                    this.mapWidth = data.width;
                    this.mapHeight = data.height;
                    this.mapRooms = data.rooms;
                    if (this.onMap) {
                        this.onMap(this.map, this.mapWidth, this.mapHeight, this.mapRooms);
                    }
                }
            } catch (e) {
                // ignore invalid messages
            }
        });

        this.ws.addEventListener('open', () => {
            // Надсилаємо join тільки після отримання id
            if (this.myId) {
                this.sendJoin(startX, startY, direction);
            } else {
                this.queuedJoin = { x: startX, y: startY, direction };
            }
        });
    }

    private sendJoin(x: number, y: number, direction: string) {
        if (this.ws.readyState === WebSocket.OPEN && this.myId) {
            this.ws.send(
                JSON.stringify({
                    type: 'join',
                    x,
                    y,
                    direction,
                }),
            );
        }
    }

    // Викликайте цей метод при зміні координат або напрямку
    sendMove(
        x: number,
        y: number,
        direction: string,
        isMoving?: boolean,
        isAttacking?: boolean,
        isRunAttacking?: boolean,
        isDead?: boolean,
        isHurt?: boolean,
        deathDirection?: string,
    ) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(
                JSON.stringify({
                    type: 'move',
                    x,
                    y,
                    direction,
                    isMoving,
                    isAttacking,
                    isRunAttacking,
                    isDead,
                    isHurt,
                    deathDirection,
                }),
            );
        }
    }

    sendAttack(targetX: number, targetY: number) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(
                JSON.stringify({
                    type: 'attack',
                    targetX,
                    targetY,
                }),
            );
        }
    }

    // Отримати всіх гравців (включаючи себе)
    getAllPlayers(): PlayerNetData[] {
        return Array.from(this.players.values());
    }

    // Отримати інших гравців (без себе)
    getOtherPlayers(): PlayerNetData[] {
        if (!this.myId) return Array.from(this.players.values());
        return Array.from(this.players.values()).filter((p) => p.id !== this.myId);
    }

    getMyId(): string | null {
        return this.myId;
    }
}
