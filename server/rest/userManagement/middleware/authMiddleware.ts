import { UserManager } from '../userManager';

/**
 * Middleware для перевірки токена.
 * Якщо токен валідний — додає req.username і викликає next().
 * Якщо ні — повертає 401.
 */
export function authMiddleware(req: any, res: any, next: () => void) {
    let body = '';
    req.on('data', (chunk: any) => {
        body += chunk;
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const token = data.token;
            if (!token) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Token required' }));
                return;
            }
            const username = UserManager.validateToken(token);
            if (!username) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Invalid or expired token' }));
                return;
            }
            req.username = username;
            req.bodyData = data;
            next();
        } catch {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
}
