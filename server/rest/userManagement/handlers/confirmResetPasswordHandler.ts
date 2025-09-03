import { UserManager } from '../userManager';
import { logger } from '../../../utils/logger';

export function confirmResetPasswordHandler(req: any, res: any): void {
    console.log('Received password reset confirmation request');
    let body = '';
    req.on('data', (chunk: any) => {
        body += chunk;
    });
    req.on('end', () => {
        try {
            const { token, newPassword } = JSON.parse(body);
            if (!token || !newPassword) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Token and newPassword required' }));
                return;
            }
            const username = UserManager.validateRestoreToken(token);
            if (!username) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid or expired token' }));
                return;
            }
            UserManager.resetPassword(username, newPassword);
            UserManager.clearRestoreToken(username);
            logger.info(`[RESET-PASSWORD] Пароль змінено для ${username}`);
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
        } catch {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
}
