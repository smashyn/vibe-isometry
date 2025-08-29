import { log } from './log.ts';

export function validateWSMessageSize(
    message: string | Buffer,
    maxSize: number,
    onError: (reason: string) => void,
): boolean {
    if (
        (typeof message === 'string' && message.length > maxSize) ||
        (Buffer.isBuffer(message) && message.length > maxSize)
    ) {
        log('[SECURITY] Повідомлення перевищує ліміт розміру');
        onError('Message too large');
        return false;
    }
    return true;
}
