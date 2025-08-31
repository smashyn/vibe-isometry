import { log } from '../utils/log';
import { handleListMaps } from './handlers/handleListMaps';
import { handleGenerateMap } from './handlers/handleGenerateMap';
import { handleLoadMap } from './handlers/handleLoadMap';
import { handleMove } from './handlers/handleMove';
import { handleAttack } from './handlers/handleAttack';
import { handleListRooms } from './handlers/handleListRooms';
import { handleCreateRoom } from './handlers/handleCreateRoom';
import { handleEditRoom } from './handlers/handleEditRoom';
import { handleDeleteRoom } from './handlers/handleDeleteRoom';
import { handleJoinRoom } from './handlers/handleJoinRoom';
import { handleLeaveRoom } from './handlers/handleLeaveRoom';
import { handleAddChatMessage } from './handlers/handleAddChatMessage';
import { RoomManager } from '../gameLogic/roomManager';

// Зберігаємо всі підключення
export const allClients = new Set<any>();

export function broadcastRoomsList() {
    const rooms = RoomManager.listRooms();
    for (const ws of allClients) {
        try {
            ws.send(JSON.stringify({ type: 'rooms_list', rooms }));
        } catch {}
    }
}

export type WSClientMessage =
    | { type: 'list_maps' }
    | {
          type: 'generate_map';
          name: string;
          width: number;
          height: number;
          roomCount: number;
          minRoomSize: number;
          maxRoomSize: number;
          seed: number;
      }
    | { type: 'load_map'; name: string }
    | {
          type: 'move';
          x: number;
          y: number;
          direction: string;
          isMoving?: boolean;
          isAttacking?: boolean;
          isRunAttacking?: boolean;
          isDead?: boolean;
          isHurt?: boolean;
          deathDirection?: string;
      }
    | { type: 'attack'; targetX: number; targetY: number }
    | { type: 'list_rooms' }
    | { type: 'create_room'; name: string }
    | { type: 'edit_room'; id: string; name?: string }
    | { type: 'delete_room'; id: string }
    | { type: 'join_room'; id: string }
    | { type: 'leave_room'; id: string }
    | { type: 'add_chat_message'; roomId: string; text: string }; // Додаємо тип

export type WSServerMessage =
    | { type: 'id'; id: string }
    | { type: 'maps_list'; maps: string[] }
    | { type: 'map_generated'; name: string }
    | { type: 'map'; width: number; height: number; map: any; rooms: any; seed?: number }
    | { type: 'players'; players: any[] }
    | { type: 'error'; message: string }
    | { type: 'rooms_list'; rooms: any[] }
    | { type: 'room_created'; id: string; name: string }
    | { type: 'room_edited'; id: string; name: string }
    | { type: 'room_deleted'; id: string }
    | { type: 'room_joined'; id: string; name: string }
    | { type: 'room_left'; id: string }
    | { type: 'chat_message'; roomId: string; sender: string; text: string; timestamp: number }; // Додаємо тип

export type Room = {
    id: string;
    name: string;
    admin: string; // userId або username
    players: string[]; // userId або username
    // можна додати інші поля (наприклад, статус, налаштування)
};

export class WSMessageHandler {
    private ws: any;
    private playerId: string;

    constructor(ws: any, playerId: string) {
        this.ws = ws;
        this.playerId = playerId;
        allClients.add(ws);
        ws.on('close', () => allClients.delete(ws));
    }

    send = (msg: WSServerMessage) => {
        this.ws.send(JSON.stringify(msg));
    };

    handle(data: WSClientMessage) {
        switch (data.type) {
            case 'list_maps':
                handleListMaps(this.send);
                return;
            case 'generate_map':
                handleGenerateMap(this.send, data);
                return;
            case 'load_map':
                handleLoadMap(this.send, data);
                return;
            case 'move':
                handleMove(this.playerId, data);
                return;
            case 'attack':
                handleAttack(this.playerId, data);
                return;
            case 'list_rooms':
                handleListRooms(this.send);
                return;
            case 'create_room':
                handleCreateRoom(this.send, data, this.ws.username);
                broadcastRoomsList();
                return;
            case 'edit_room':
                handleEditRoom(this.send, data, this.ws.username);
                broadcastRoomsList();
                return;
            case 'delete_room':
                handleDeleteRoom(this.send, data, this.ws.username);
                broadcastRoomsList();
                return;
            case 'join_room':
                handleJoinRoom(this.send, data, this.ws.username);
                broadcastRoomsList();
                return;
            case 'leave_room':
                handleLeaveRoom(this.send, data, this.ws.username);
                broadcastRoomsList();
                return;
            case 'add_chat_message':
                // Додаємо обробку додавання повідомлення до чату
                handleAddChatMessage(this.send, data, this.ws.username);
                // Можливо, тут можна зробити broadcast для всіх у кімнаті
                return;
            default:
                this.send({ type: 'error', message: 'Unknown message type' });
                log('[ERROR] Unknown message type:', data);
        }
    }
}
