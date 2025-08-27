import { randomUUID } from 'crypto';
import { Room } from './generateDungeon';

export type PlayerData = {
    id: string;
    x: number;
    y: number;
    direction: string;
    isMoving?: boolean;
    isAttacking?: boolean;
    isRunAttacking?: boolean;
    isDead?: boolean;
    isHurt?: boolean;
    hurtUntil?: number;
    deathDirection?: string;
};

export const PlayerManager = {
    players: new Map<string, PlayerData>(),

    createPlayer(rooms: Room[]): PlayerData {
        let x = 0,
            y = 0;
        if (rooms.length > 0) {
            const room = rooms[Math.floor(Math.random() * rooms.length)];
            x = Math.floor(room.x + room.w / 2);
            y = Math.floor(room.y + room.h / 2);
        }
        const player: PlayerData = {
            id: randomUUID(),
            x,
            y,
            direction: 'down',
            isMoving: false,
            isAttacking: false,
            isRunAttacking: false,
            isDead: false,
            isHurt: false,
            deathDirection: 'down',
        };
        PlayerManager.players.set(player.id, player);
        return player;
    },

    removePlayer(id: string) {
        PlayerManager.players.delete(id);
    },

    getPlayer(id: string): PlayerData | undefined {
        return PlayerManager.players.get(id);
    },

    getAllPlayers(): PlayerData[] {
        return Array.from(PlayerManager.players.values());
    },

    updatePlayer(id: string, data: Partial<PlayerData>) {
        const player = PlayerManager.players.get(id);
        if (player) {
            Object.assign(player, data);
        }
    },
};
