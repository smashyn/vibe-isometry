import { MapManager } from '../../gameLogic/mapManager';
import type { WSServerMessage, WSClientMessage } from '../WSMessageHandler';

export function handleLoadMap(
    send: (msg: WSServerMessage) => void,
    data: Extract<WSClientMessage, { type: 'load_map' }>,
) {
    if (typeof data.name === 'string') {
        const loaded = MapManager.loadMap(data.name);
        if (loaded) {
            send({
                type: 'map',
                width: loaded.width,
                height: loaded.height,
                map: loaded.map,
                rooms: loaded.rooms,
                seed: loaded.seed,
            });
        } else {
            send({ type: 'error', message: 'Map not found' });
        }
    }
}
