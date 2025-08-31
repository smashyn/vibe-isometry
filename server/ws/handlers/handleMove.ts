import { RoomManager } from '../../gameLogic/roomManager';
import { log } from '../../utils/log';
import type { WSClientMessage } from '../WSMessageHandler';

export function handleMove(playerId: string, data: Extract<WSClientMessage, { type: 'move' }>) {
    // Знаходимо кімнату, де знаходиться цей гравець
    const room = RoomManager.listRooms().find((room) =>
        room.playerManager.getAllCharacters().some((c) => c.id === playerId),
    );
    if (!room) return;

    const pm = room.playerManager;
    const player = pm.getAllCharacters().find((c) => c.id === playerId);
    if (!player) return;

    const prev = { x: player.x, y: player.y, dir: player.direction, moving: player.isMoving };

    player.x = data.x;
    player.y = data.y;
    player.direction = data.direction;
    player.isMoving = !!data.isMoving;
    player.isAttacking = !!data.isAttacking;
    player.isRunAttacking = !!data.isRunAttacking;
    player.isDead = !!data.isDead;
    player.isHurt = !!data.isHurt;
    player.deathDirection = data.deathDirection || player.deathDirection;

    if (
        prev.x !== player.x ||
        prev.y !== player.y ||
        prev.dir !== player.direction ||
        prev.moving !== player.isMoving
    ) {
        log(`[MOVE] ${player.id} -> (${player.x}, ${player.y}) dir:${player.direction}`);
    }
}
