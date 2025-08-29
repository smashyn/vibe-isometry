import { MapManager } from '../../gameLogic/mapManager';
import type { WSServerMessage } from '../WSMessageHandler';

export function handleListMaps(send: (msg: WSServerMessage) => void) {
    send({ type: 'maps_list', maps: MapManager.listMaps() });
}
