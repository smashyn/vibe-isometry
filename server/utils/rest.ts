/**
 * Перевіряє, чи співпадають метод і шлях запиту.
 * @param req - HTTP-запит
 * @param method - HTTP-метод (наприклад, 'POST')
 * @param url - шлях (наприклад, '/api/register')
 */
export function isRoute(req: any, method: string, url: string): boolean {
    return req.method === method && req.url === url;
}
