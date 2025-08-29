import { RoomManager } from '../roomManager';
export function handleEditRoom(send: any, data: any, username: string) {
    const ok = RoomManager.editRoom(data.id, username, data.name);
    send({
        type: ok ? 'room_edited' : 'error',
        ...(ok ? { id: data.id, name: data.name } : { message: 'Not allowed' }),
    });
}
