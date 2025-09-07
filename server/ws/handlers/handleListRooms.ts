import { RoomManager } from '../../gameLogic/roomManager';
import { allClients } from '../WSMessageHandler';

export function handleListRooms(send: any) {
    const rooms = RoomManager.listRooms();
    // Підрахунок кількості підключених юзерів у кожній кімнаті
    const roomUserCounts: Record<string, number> = {};
    for (const ws of allClients) {
        const roomId = ws.currentRoomId;
        if (roomId) {
            roomUserCounts[roomId] = (roomUserCounts[roomId] || 0) + 1;
        }
    }
    const roomsWithUserCount = rooms.map((room) => ({
        ...room,
        playerManager: undefined,
        map: undefined,
        userCount: roomUserCounts[room.id] || 0,
    }));
    send({ type: 'rooms_list', rooms: roomsWithUserCount });
}
