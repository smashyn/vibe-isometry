import { UserManager } from '../userManager';
import { logger } from '../../../utils/logger';

export function resetPasswordHandler(req: any, res: any): void {
    let body = '';
    req.on('data', (chunk: any) => {
        body += chunk;
    });
    req.on('end', () => {
        try {
            const { username, newPassword } = JSON.parse(body);
            if (!username || !newPassword) {
                logger.warning('[RESET-PASSWORD] Відхилено: не вказано username або newPassword');
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Username and newPassword required' }));
                return;
            }
            if (UserManager.resetPassword(username, newPassword)) {
                logger.info(`[RESET-PASSWORD] Пароль змінено для ${username}`);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true }));
            } else {
                logger.warning(`[RESET-PASSWORD] Користувача ${username} не знайдено`);
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'User not found' }));
            }
        } catch {
            logger.error('[RESET-PASSWORD] Некоректний JSON');
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
}
