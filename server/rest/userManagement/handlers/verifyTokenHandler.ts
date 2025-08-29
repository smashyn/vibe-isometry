import { UserManager } from '../userManager';

export function verifyTokenHandler(req: any, res: any): void {
    let body = '';
    req.on('data', (chunk: any) => {
        body += chunk;
    });
    req.on('end', () => {
        try {
            const { token } = JSON.parse(body);
            const username = UserManager.validateToken(token);
            if (username) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, username }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid token' }));
            }
        } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
        }
    });
}
