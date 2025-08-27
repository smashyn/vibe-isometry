import { GameSocket } from './GameSocket.js';

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
    private socket: GameSocket;
    public players: Map<string, PlayerNetData> = new Map();
    private myId: string | null = null;
    private queuedJoin: { x: number; y: number; direction: string } | null = null;

    public map: any = null;
    public mapWidth: number = 0;
    public mapHeight: number = 0;
    public mapRooms: any = null;
    public onMap?: (map: any, width: number, height: number, rooms: any) => void;

    /**
     * @param socket GameSocket екземпляр
     * @param onId отримати id від сервера (callback, викликається один раз)
     * @param startX стартова координата X
     * @param startY стартова координата Y
     * @param direction стартовий напрямок
     * @param onMap callback для отримання карти (необов'язково)
     */
    constructor(
        socket: GameSocket,
        onId: (id: string) => void,
        startX: number,
        startY: number,
        direction: string,
        onMap?: (map: any, width: number, height: number, rooms: any) => void,
    ) {
        this.socket = socket;
        if (onMap) this.onMap = onMap;

        this.socket.onMessage((data) => {
            if (data.type === 'id') {
                this.myId = data.id;
                onId(data.id);
                if (this.queuedJoin) {
                    this.sendJoin(this.queuedJoin.x, this.queuedJoin.y, this.queuedJoin.direction);
                    this.queuedJoin = null;
                }
            } else if (data.type === 'players') {
                console.log('players from server:', data.players);
                console.log('myId:', this.myId);
                this.players.clear();
                for (const p of data.players) {
                    this.players.set(p.id, p);
                }
            } else if (data.type === 'map') {
                this.map = data.map;
                this.mapWidth = data.width;
                this.mapHeight = data.height;
                this.mapRooms = data.rooms;
                if (this.onMap) {
                    this.onMap(this.map, this.mapWidth, this.mapHeight, this.mapRooms);
                }
            }
        });

        // Надсилаємо join тільки після отримання id
        if (this.myId) {
            this.sendJoin(startX, startY, direction);
        } else {
            this.queuedJoin = { x: startX, y: startY, direction };
        }
    }

    private sendJoin(x: number, y: number, direction: string) {
        if (this.myId) {
            this.socket.send({
                type: 'join',
                x,
                y,
                direction,
            });
        }
    }

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
        this.socket.send({
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
        });
    }

    sendAttack(targetX: number, targetY: number) {
        this.socket.send({
            type: 'attack',
            targetX,
            targetY,
        });
    }

    getAllPlayers(): PlayerNetData[] {
        return Array.from(this.players.values());
    }

    getOtherPlayers(): PlayerNetData[] {
        if (!this.myId) return Array.from(this.players.values());
        return Array.from(this.players.values()).filter((p) => p.id !== this.myId);
    }

    getMyId(): string | null {
        return this.myId;
    }
}
