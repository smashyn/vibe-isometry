import { PlayerManager } from './playerManager';
import { log } from '../utils/log';
import { WebSocket } from 'ws';
import { WSServerMessage } from '../ws/WSMessageHandler';
import { RoomManager } from '../ws/roomManager';

/**
 * Запускає періодичне оновлення стану гравців і розсилку їхнього стану всім клієнтам.
 * @param wss WebSocketServer
 */
export function startPlayerUpdater(wss: { clients: Set<WebSocket> }) {
    setInterval(() => {
        const now = Date.now();

        // Оновлюємо статус hurt для всіх гравців у всіх кімнатах через RoomManager
        for (const room of RoomManager.listRooms()) {
            const pm = room.playerManager;
            for (const user of pm.getAllUsers()) {
                const char = pm.getActiveCharacter(user.username);
                if (char && char.isHurt && char.hurtUntil && now >= char.hurtUntil) {
                    char.isHurt = false;
                    char.hurtUntil = undefined;
                    log(`[HURT END] ${char.id} більше не hurt на (${char.x}, ${char.y})`);
                }
            }
        }

        wss.clients.forEach((client: any) => {
            if (client.readyState === WebSocket.OPEN && client.username) {
                // Знаходимо активну кімнату цього клієнта
                const userRoom = RoomManager.listRooms().find((room) =>
                    room.playerManager.users.has(client.username),
                );
                if (!userRoom) return;
                const pm = userRoom.playerManager;
                const player = pm.users.get(client.username);
                if (!player) return;
                // Відправляємо тільки гравців цієї кімнати, крім самого себе
                const allPlayers = pm
                    .getAllCharacters()
                    .filter((p) => p.id !== player.activeCharacterId);
                const msg: WSServerMessage = { type: 'players', players: allPlayers };
                client.send(JSON.stringify(msg));
            }
        });
    }, 50);
}
