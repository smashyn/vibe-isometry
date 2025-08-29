import { CharacterManager } from '../characterManager';
import { logger } from '../../../utils/logger';

export function updateCharacterHandler(req: any, res: any): void {
    // req.username вже встановлено middleware, req.bodyData — розпарсене тіло
    const { characterName, newCharacterData } = req.bodyData || {};
    const username = req.username;
    if (!characterName || !newCharacterData) {
        logger.warning(
            '[UPDATE-CHARACTER] Відхилено: не вказано characterName або newCharacterData',
        );
        res.writeHead(400);
        res.end(
            JSON.stringify({
                error: 'characterName і newCharacterData обовʼязкові',
            }),
        );
        return;
    }
    if (!username) {
        logger.warning('[UPDATE-CHARACTER] Відхилено: не вказано username');
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'username обовʼязковий' }));
        return;
    }
    // Тільки перевірка обов'язкових полів, токен не перевіряється тут
    const result = CharacterManager.updateCharacterByUsername(
        username,
        characterName,
        newCharacterData,
    );
    if (result.success) {
        logger.info(
            `[UPDATE-CHARACTER] Оновлено персонажа "${characterName}" для користувача "${username}"`,
        );
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, character: result.character }));
    } else {
        logger.warning(`[UPDATE-CHARACTER] Відхилено: ${result.error}`);
        res.writeHead(404);
        res.end(JSON.stringify({ error: result.error }));
    }
}
