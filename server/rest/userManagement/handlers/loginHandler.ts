import { UserManager } from '../userManager';
import { logger } from '../../../utils/logger';

export function loginHandler(req: any, res: any): void {
    let body = '';
    req.on('data', (chunk: any) => {
        body += chunk;
    });
    req.on('end', () => {
        try {
            const { username, password } = JSON.parse(body);
            if (!username || !password) {
                logger.warning('[LOGIN] Відхилено: не вказано username або password');
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Username and password required' }));
                return;
            }
            // Перевіряємо чи існує користувач
            if (!UserManager.exists(username)) {
                logger.warning(`[LOGIN] Відхилено: користувач "${username}" не існує`);
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'User does not exist' }));
                return;
            }
            if (UserManager.authenticate(username, password).success) {
                // Генеруємо токен для користувача
                const token = UserManager.issueToken(username);
                logger.info(`[LOGIN] Успішно: ${username}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, token }));
            } else {
                logger.warning(`[LOGIN] Відхилено: невірні дані для ${username}`);
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Invalid credentials' }));
            }
        } catch {
            logger.error('[LOGIN] Некоректний JSON');
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
}
