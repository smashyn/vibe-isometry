import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';

interface MyWebSocket extends WebSocket {
    id?: string;
}

type PlayerData = {
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

const players = new Map<string, PlayerData>();

const server = createServer();
const wss = new WebSocketServer({ server });

// --- Додаємо прапорець для логування ---
let ENABLE_LOGS = true;

// Для зручності: функція для логування
function log(...args: any[]) {
    if (ENABLE_LOGS) {
        console.log(...args);
    }
}

wss.on('connection', function connection(ws) {
    const playerId = randomUUID();
    const wsTyped = ws as MyWebSocket;
    wsTyped.id = playerId;
    players.set(playerId, {
        id: playerId,
        x: 0,
        y: 0,
        direction: 'down',
        isMoving: false,
        isAttacking: false,
        isRunAttacking: false,
        isDead: false,
        isHurt: false,
        deathDirection: 'down',
    });

    ws.send(JSON.stringify({ type: 'id', id: playerId }));

    ws.on('message', function incoming(message) {
        let data;
        try {
            const msgStr = typeof message === 'string' ? message : message.toString();
            data = JSON.parse(msgStr);
        } catch {
            return;
        }

        if (data.type === 'move') {
            const player = players.get(playerId);
            if (player) {
                const prevX = player.x;
                const prevY = player.y;
                const prevDir = player.direction;
                const prevIsMoving = player.isMoving;

                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction;
                player.isMoving = !!data.isMoving;
                player.isAttacking = !!data.isAttacking;
                player.isRunAttacking = !!data.isRunAttacking;
                player.isDead = !!data.isDead;
                player.isHurt = !!data.isHurt;
                player.deathDirection = data.deathDirection || player.deathDirection;

                // Лог руху лише якщо щось змінилось
                if (
                    prevX !== player.x ||
                    prevY !== player.y ||
                    prevDir !== player.direction ||
                    prevIsMoving !== player.isMoving
                ) {
                    log(
                        `[MOVE] ${player.id} -> (${player.x}, ${player.y}) dir:${player.direction}`,
                    );
                }
            }
        }

        if (data.type === 'attack') {
            const attacker = players.get((ws as any).id);
            if (!attacker) return;

            // Перевірка дистанції (Манхеттенська відстань)
            const dist = Math.max(
                Math.abs(attacker.x - data.targetX),
                Math.abs(attacker.y - data.targetY),
            );
            log(
                `[ATTACK] ${attacker.id} атакує (${data.targetX}, ${data.targetY}) з (${attacker.x}, ${attacker.y}), dist=${dist}`,
            );
            if (dist !== 1) return; // Атакувати можна лише на відстані 1 клітина

            // Знаходимо гравця у цільовій клітині
            for (const [id, player] of players) {
                if (
                    id !== (ws as any).id &&
                    Math.round(player.x) === data.targetX &&
                    Math.round(player.y) === data.targetY
                ) {
                    player.isHurt = true;
                    log(
                        `[HURT] ${player.id} отримав урон на (${player.x}, ${player.y}) від ${attacker.id}`,
                    );
                    // Скидаємо hurt через 400мс
                    setTimeout(() => {
                        player.isHurt = false;
                        log(`[HURT END] ${player.id} більше не hurt на (${player.x}, ${player.y})`);
                    }, 400);
                }
            }
        }
    });

    ws.on('close', () => {
        players.delete(playerId);
        log(`[DISCONNECT] ${playerId} вийшов з гри`);
    });
});

setInterval(() => {
    const allPlayers = Array.from(players.values());
    const msg = JSON.stringify({ type: 'players', players: allPlayers });
    wss.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}, 50);

server.listen(3000, () => {
    console.log('Server started on port 3000');
    console.log('Логування дій:', ENABLE_LOGS ? 'УВІМКНЕНО' : 'ВИМКНЕНО');
    console.log('Щоб вимкнути/увімкнути логування, змініть значення ENABLE_LOGS у server.ts');
});
