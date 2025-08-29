import { RoomManager } from '../roomManager';
import { log } from '../../utils/log';
import type { WSClientMessage } from '../WSMessageHandler';

/**
 * Тепер атака працює тільки в межах кімнати, де знаходиться гравець.
 * playerId — це id активного персонажа (CharacterData.id)
 */
export function handleAttack(playerId: string, data: Extract<WSClientMessage, { type: 'attack' }>) {
    // Знаходимо кімнату, де знаходиться цей гравець
    const room = RoomManager.listRooms().find((room) =>
        room.playerManager.getAllCharacters().some((c) => c.id === playerId),
    );
    if (!room) return;

    const pm = room.playerManager;
    const attacker = pm.getAllCharacters().find((c) => c.id === playerId);
    if (!attacker) return;

    const dist = Math.max(Math.abs(attacker.x - data.targetX), Math.abs(attacker.y - data.targetY));
    log(
        `[ATTACK] ${attacker.id} атакує (${data.targetX}, ${data.targetY}) з (${attacker.x}, ${attacker.y}), dist=${dist}`,
    );
    if (dist !== 1 && dist !== 0) return;

    for (const player of pm.getAllCharacters()) {
        if (
            player.id !== attacker.id &&
            Math.round(player.x) === data.targetX &&
            Math.round(player.y) === data.targetY
        ) {
            player.isHurt = true;
            player.hurtUntil = Date.now() + 400;
            log(
                `[HURT] ${player.id} отримав урон на (${player.x}, ${player.y}) від ${attacker.id}`,
            );
        }
    }
}
