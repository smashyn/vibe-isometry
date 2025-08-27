import { PlayerManager } from './playerManager';
import { MapManager } from './mapManager';
import { log } from './utils/log';
import type { WSClientMessage, WSServerMessage } from './server';

export class WSMessageHandler {
    private ws: any;
    private playerId: string;

    constructor(ws: any, playerId: string) {
        this.ws = ws;
        this.playerId = playerId;
    }

    send(msg: WSServerMessage) {
        this.ws.send(JSON.stringify(msg));
    }

    private updatePlayerState(player: any, data: any) {
        const prevX = player.x;
        const prevY = player.y;
        const prevDir = player.direction;
        const prevIsMoving = player.isMoving;

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
            prevX !== player.x ||
            prevY !== player.y ||
            prevDir !== player.direction ||
            prevIsMoving !== player.isMoving
        ) {
            log(`[MOVE] ${player.id} -> (${player.x}, ${player.y}) dir:${player.direction}`);
        }
    }

    handle(data: WSClientMessage) {
        switch (data.type) {
            case 'list_maps':
                this.send({ type: 'maps_list', maps: MapManager.listMaps() });
                return;
            case 'generate_map':
                // ...валідація...
                MapManager.generateAndSaveMap(
                    data.name,
                    data.width,
                    data.height,
                    data.roomCount,
                    data.minRoomSize,
                    data.maxRoomSize,
                    data.seed,
                );
                this.send({ type: 'map_generated', name: data.name });
                return;
            case 'load_map':
                if (typeof data.name === 'string') {
                    console.log('[SERVER] load_map запит:', data.name);
                    const loaded = MapManager.loadMap(data.name);
                    if (loaded) {
                        this.send({
                            type: 'map',
                            width: loaded.width,
                            height: loaded.height,
                            map: loaded.map,
                            rooms: loaded.rooms,
                            seed: loaded.seed,
                        });
                    } else {
                        this.send({ type: 'error', message: 'Map not found' });
                    }
                }
                return;
            case 'move':
                const player = PlayerManager.getPlayer(this.playerId);
                if (player) {
                    this.updatePlayerState(player, data);
                }
                return;
            case 'attack':
                const attacker = PlayerManager.getPlayer(this.playerId);
                if (!attacker) return;

                const dist = Math.max(
                    Math.abs(attacker.x - data.targetX),
                    Math.abs(attacker.y - data.targetY),
                );
                log(
                    `[ATTACK] ${attacker.id} атакує (${data.targetX}, ${data.targetY}) з (${attacker.x}, ${attacker.y}), dist=${dist}`,
                );
                if (dist !== 1 && dist !== 0) return;

                for (const player of PlayerManager.getAllPlayers()) {
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
                return;
            default:
                this.send({ type: 'error', message: 'Unknown message type' });
                log('[ERROR] Unknown message type:', data);
        }
    }
}
