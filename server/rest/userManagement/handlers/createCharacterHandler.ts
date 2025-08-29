import { CharacterManager } from '../characterManager';
import { logger } from '../../../utils/logger';

export function createCharacterHandler(req: any, res: any): void {
    // req.username вже встановлено middleware, req.bodyData — розпарсене тіло
    const { characterName, characterClass } = req.bodyData || {};
    if (!characterName || !characterClass) {
        logger.warning('[CREATE-CHARACTER] Відхилено: не вказано characterName або characterClass');
        res.writeHead(400);
        res.end(
            JSON.stringify({
                error: 'characterName і characterClass обовʼязкові',
            }),
        );
        return;
    }
    const result = CharacterManager.createCharacter(
        req.bodyData.token,
        characterName,
        characterClass,
    );
    if (result.success) {
        logger.info(
            `[CREATE-CHARACTER] Створено персонажа "${characterName}" класу "${characterClass}"`,
        );
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, character: result.character }));
    } else {
        logger.warning(`[CREATE-CHARACTER] Відхилено: ${result.error}`);
        res.writeHead(409);
        res.end(JSON.stringify({ error: result.error }));
    }
}
