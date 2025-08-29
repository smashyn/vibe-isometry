import { RoomManager } from '../roomManager';
export function handleCreateRoom(send: any, data: any, username: string) {
    const room = RoomManager.createRoom(data.name, username);
    send({ type: 'room_created', room });
}
