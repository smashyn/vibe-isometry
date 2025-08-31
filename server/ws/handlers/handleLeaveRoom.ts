import { RoomManager } from '../../gameLogic/roomManager';
export function handleLeaveRoom(send: any, data: any, username: string) {
    const ok = RoomManager.leaveRoom(data.id, username);
    send({
        type: ok ? 'room_left' : 'error',
        ...(ok ? { id: data.id } : { message: 'Leave failed' }),
    });
}
