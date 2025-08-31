import { RoomManager } from '../../gameLogic/roomManager';
export function handleDeleteRoom(send: any, data: any, username: string) {
    const ok = RoomManager.deleteRoom(data.id, username);
    send({
        type: ok ? 'room_deleted' : 'error',
        ...(ok ? { id: data.id } : { message: 'Not allowed' }),
    });
}
