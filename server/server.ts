import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { Room } from './generateDungeon.ts';
import { PlayerManager } from './playerManager.ts';
import { log, isLogEnabled } from './utils/log.ts';
import { WSMessageHandler } from './WSMessageHandler.ts';
import { startPlayerUpdater } from './playerUpdater.ts';

// === Типи для WebSocket-повідомлень ===

export type WSClientMessage =
    | { type: 'list_maps' }
    | {
          type: 'generate_map';
          name: string;
          width: number;
          height: number;
          roomCount: number;
          minRoomSize: number;
          maxRoomSize: number;
          seed: number;
      }
    | { type: 'load_map'; name: string }
    | {
          type: 'move';
          x: number;
          y: number;
          direction: string;
          isMoving?: boolean;
          isAttacking?: boolean;
          isRunAttacking?: boolean;
          isDead?: boolean;
          isHurt?: boolean;
          deathDirection?: string;
      }
    | { type: 'attack'; targetX: number; targetY: number };

export type WSServerMessage =
    | { type: 'id'; id: string }
    | { type: 'maps_list'; maps: string[] }
    | { type: 'map_generated'; name: string }
    | { type: 'map'; width: number; height: number; map: any; rooms: any; seed?: number }
    | { type: 'players'; players: any[] }
    | { type: 'error'; message: string };

// === WebSocket сервер ===

interface MyWebSocket extends WebSocket {
    id?: string;
}

let dungeonRooms: Room[] = [];

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
    const player = PlayerManager.createPlayer(dungeonRooms);
    const playerId = player.id;
    const wsTyped = ws as MyWebSocket;
    wsTyped.id = playerId;

    const handler = new WSMessageHandler(ws, playerId);

    handler.send({ type: 'id', id: playerId });

    ws.on('message', function incoming(message: string | Buffer) {
        // --- Безпека: обмеження розміру повідомлення ---
        const MAX_MSG_SIZE = 32 * 1024; // 32 KB
        let data: WSClientMessage;
        try {
            // Перевірка розміру
            if (
                (typeof message === 'string' && message.length > MAX_MSG_SIZE) ||
                (Buffer.isBuffer(message) && message.length > MAX_MSG_SIZE)
            ) {
                log('[SECURITY] Повідомлення перевищує ліміт розміру');
                handler.send({ type: 'error', message: 'Message too large' });
                ws.close(1009, 'Message too large'); // 1009 = Close frame: Message too big
                return;
            }

            const msgStr = typeof message === 'string' ? message : message.toString();
            data = JSON.parse(msgStr);
        } catch (err) {
            log('[ERROR] Некоректний JSON від клієнта:', err);
            handler.send({ type: 'error', message: 'Invalid JSON format' });
            return;
        }

        try {
            handler.handle(data);
        } catch (err) {
            log('[ERROR] Внутрішня помилка при обробці повідомлення:', err);
            handler.send({ type: 'error', message: 'Internal server error' });
        }
    });

    ws.on('close', () => {
        PlayerManager.removePlayer(playerId);
        log(`[DISCONNECT] ${playerId} вийшов з гри`);
    });
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
    console.log('Логування дій:', isLogEnabled() ? 'УВІМКНЕНО' : 'ВИМКНЕНО');
    console.log('Щоб вимкнути/увімкнути логування, використовуйте setLogEnabled у utils/log.ts');
});

startPlayerUpdater(wss);

// === Graceful shutdown ===
function shutdown() {
    console.log('\n[SERVER] Завершення роботи...');
    wss.close(() => {
        console.log('[SERVER] WebSocket сервер закрито');
        server.close(() => {
            console.log('[SERVER] HTTP сервер закрито');
            process.exit(0);
        });
    });
    // Якщо через 5 секунд не завершилось — форсовано
    setTimeout(() => {
        console.log('[SERVER] Форсоване завершення');
        process.exit(1);
    }, 5000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
