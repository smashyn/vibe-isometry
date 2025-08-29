import { CharacterManager } from '../characterManager';
import { logger } from '../../../utils/logger';

export function deleteCharacterHandler(req: any, res: any): void {
    // req.username вже встановлено middleware, req.bodyData — розпарсене тіло
    const { characterName } = req.bodyData || {};
    if (!characterName) {
        logger.warning('[DELETE-CHARACTER] Відхилено: не вказано characterName');
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'characterName обовʼязковий' }));
        return;
    }
    const result = CharacterManager.deleteCharacter(req.bodyData.token, characterName);
    if (result.success) {
        logger.info(`[DELETE-CHARACTER] Видалено персонажа "${characterName}"`);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
    } else {
        logger.warning(`[DELETE-CHARACTER] Відхилено: ${result.error}`);
        res.writeHead(404);
        res.end(JSON.stringify({ error: result.error }));
    }
}
