import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto'; // Додайте цей імпорт

type PlayerData = {
    id: string;
    x: number;
    y: number;
    direction: string;
    isMoving?: boolean;
    isAttacking?: boolean;
    isRunAttacking?: boolean;
};

const players = new Map<string, PlayerData>();

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
    // Генеруємо id для нового клієнта
    const playerId = randomUUID();
    let player: PlayerData | null = null;

    // Відправляємо id клієнту
    ws.send(JSON.stringify({ type: 'id', id: playerId }));

    ws.on('message', (message: string) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === 'join') {
                player = {
                    id: playerId,
                    x: data.x,
                    y: data.y,
                    direction: data.direction,
                };
                players.set(playerId, player);
            } else if (data.type === 'move' && player) {
                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction;
                player.isMoving = data.isMoving;
                player.isAttacking = data.isAttacking;
                player.isRunAttacking = data.isRunAttacking;
            }
        } catch (e) {
            // ignore invalid messages
        }
    });

    ws.on('close', () => {
        if (playerId) {
            players.delete(playerId);
        }
    });
});

// Передаємо координати всіх гравців кожні 50мс
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
});
