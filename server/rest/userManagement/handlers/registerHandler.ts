import { UserManager } from '../userManager';
import { logger } from '../../../utils/logger';

export function registerHandler(req: any, res: any): void {
    let body = '';
    req.on('data', (chunk: any) => {
        body += chunk;
    });
    req.on('end', () => {
        try {
            const { username, password } = JSON.parse(body);
            if (!username || !password) {
                logger.warning('[REGISTER] Відхилено: не вказано username або password');
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Username and password required' }));
                return;
            }
            if (UserManager.register(username, password)) {
                logger.info(`[REGISTER] Успішно: ${username}`);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true }));
            } else {
                logger.warning(`[REGISTER] Відхилено: користувач ${username} вже існує`);
                res.writeHead(409);
                res.end(JSON.stringify({ error: 'User already exists' }));
            }
        } catch (e) {
            logger.error('[REGISTER] Некоректний JSON', e);
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
}
