import { MapManager } from '../../gameLogic/mapManager';
import type { WSServerMessage, WSClientMessage } from '../WSMessageHandler';

export function handleGenerateMap(
    send: (msg: WSServerMessage) => void,
    data: Extract<WSClientMessage, { type: 'generate_map' }>,
) {
    MapManager.generateAndSaveMap(
        data.name,
        data.width,
        data.height,
        data.roomCount,
        data.minRoomSize,
        data.maxRoomSize,
        data.seed,
    );
    send({ type: 'map_generated', name: data.name });
}
