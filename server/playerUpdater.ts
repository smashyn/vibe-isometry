import { PlayerManager } from './playerManager';
import { log } from './utils/log';
import { WebSocket } from 'ws';
import { WSServerMessage } from './server';

/**
 * Запускає періодичне оновлення стану гравців і розсилку їхнього стану всім клієнтам.
 * @param wss WebSocketServer
 */
export function startPlayerUpdater(wss: { clients: Set<WebSocket> }) {
    setInterval(() => {
        const now = Date.now();
        for (const player of PlayerManager.getAllPlayers()) {
            if (player.isHurt && player.hurtUntil && now >= player.hurtUntil) {
                player.isHurt = false;
                player.hurtUntil = undefined;
                log(`[HURT END] ${player.id} більше не hurt на (${player.x}, ${player.y})`);
            }
        }
        const allPlayers = PlayerManager.getAllPlayers();
        wss.clients.forEach((client: any) => {
            if (client.readyState === WebSocket.OPEN && client.id) {
                // Відправляємо всіх гравців, крім самого себе
                const otherPlayers = allPlayers.filter((p) => p.id !== client.id);
                const msg: WSServerMessage = { type: 'players', players: otherPlayers };
                client.send(JSON.stringify(msg));
            }
        });
    }, 50);
}
