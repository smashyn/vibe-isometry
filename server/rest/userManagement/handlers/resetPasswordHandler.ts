import { UserManager } from '../userManager';
import { logger } from '../../../utils/logger';
import { log } from '../../../utils/log';

async function sendRestoreEmail(email: string, restoreLink: string) {
    log(
        `[RESET-PASSWORD] Надсилання листа для відновлення пароля на ${email}. restoreLink: ${restoreLink}`,
    );
}

export function resetPasswordHandler(req: any, res: any): void {
    let body = '';
    req.on('data', (chunk: any) => {
        body += chunk;
    });
    req.on('end', () => {
        try {
            const { email } = JSON.parse(body);
            if (!email) {
                logger.warning('[RESET-PASSWORD] Відхилено: не вказано email');
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Email required' }));
                return;
            }
            // Знайти користувача за email
            const username = UserManager.findUsernameByEmail(email);
            if (!username) {
                logger.warning(`[RESET-PASSWORD] Користувача з email ${email} не знайдено`);
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'User not found' }));
                return;
            }
            // Згенерувати токен для відновлення (1 година)
            const restoreToken = UserManager.issueRestoreToken(username, 60 * 60 * 1000);
            const restoreLink = `http://localhost:5000/?restoreToken=${restoreToken}`;
            sendRestoreEmail(email, restoreLink);

            logger.info(`[RESET-PASSWORD] Інструкція надіслана на ${email}`);
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
        } catch {
            logger.error('[RESET-PASSWORD] Некоректний JSON');
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
}
