import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { log, isLogEnabled } from './utils/log';
import { WSClientMessage, WSMessageHandler } from './ws/WSMessageHandler.ts';
import { startPlayerUpdater } from './gameLogic/playerUpdater.ts';
import { handleUserRoutes } from './rest/userManagement/userRoters.ts';
import { validateWSMessageSize } from './utils/wsSecurity.ts';
import url from 'url';
import { UserManager } from './rest/userManagement/userManager';
import { RoomManager } from './ws/roomManager'; // Додайте цей імпорт

const server = createServer((req, res) => {
    log(`[HTTP] ${req.method} ${req.url}`);

    // --- CORS headers для всіх REST-запитів ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // --- Відповідь на preflight (OPTIONS) ---
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (handleUserRoutes(req, res)) return;

    // Якщо не REST і не WS — повертаємо 404
    if (
        req.headers.upgrade !== 'websocket' // не WS апгрейд
    ) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
    }

    // --- Перевірка токена при апгрейді ---
    const parsed = url.parse(req.url || '', true);
    const token = parsed.query.token as string;

    // Дозволяємо апгрейд тільки якщо токен валідний
    const username = UserManager.validateToken(token);
    if (!token || !username) {
        log(`[WS-UPGRADE] Відхилено підключення без валідного токена (${token})`);
        res.writeHead(401);
        res.end('Unauthorized');
        return;
    }

    log(`[WS-UPGRADE] Підключення користувача "${username}" з токеном ${token}`);

    wss.handleUpgrade(req, req.socket as any, Buffer.alloc(0), (ws) => {
        (ws as any).username = username;
        wss.emit('connection', ws, req);
    });
});

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', function connection(ws) {
    const username = (ws as any).username;
    if (!username) {
        ws.close();
        return;
    }
    log(`[WS] Користувач "${username}" підключився`);

    // --- Відправляємо список кімнат одразу після підключення ---
    const handler = new WSMessageHandler(ws, username);

    handler.send({ type: 'rooms_list', rooms: RoomManager.listRooms() });

    ws.on('message', function incoming(message: string | Buffer) {
        const MAX_MSG_SIZE = 32 * 1024; // 32 KB
        let data: WSClientMessage;

        // --- Безпека: обмеження розміру повідомлення через утиліту ---
        if (
            !validateWSMessageSize(message, MAX_MSG_SIZE, (reason) => {
                log(`[WS] ${username}: повідомлення перевищує ліміт: ${reason}`);
                handler.send({ type: 'error', message: reason });
                ws.close(1009, reason); // 1009 = Close frame: Message too big
            })
        ) {
            return;
        }

        try {
            const msgStr = typeof message === 'string' ? message : message.toString();
            data = JSON.parse(msgStr);
            log(`[WS] ${username}: отримано повідомлення`, data);
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
        const username = (ws as any).username;
        if (username) {
            const userRoom = RoomManager.listRooms().find((room) =>
                room.playerManager.users.has(username),
            );
            if (userRoom) {
                userRoom.playerManager.removeUser(username);
                userRoom.players = userRoom.players.filter((u) => u !== username);
                log(`[DISCONNECT] ${username} вийшов з кімнати ${userRoom.id}`);
            }
        }
        log(`[WS] Користувач "${username}" відключився`);
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
