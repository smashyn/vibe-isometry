import { RoomManager } from '../roomManager';
export function handleJoinRoom(send: any, data: any, username: string) {
    const ok = RoomManager.joinRoom(data.id, username);
    send({
        type: ok ? 'room_joined' : 'error',
        ...(ok ? { id: data.id } : { message: 'Join failed' }),
    });
}
