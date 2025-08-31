import { v4 as uuidv4 } from 'uuid';
import { PlayerManager as PlayerManagerClass } from './playerManager';

export type RoomStatus = 'ACTIVE' | 'GAME' | 'INACTIVE';

export type Room = {
    id: string;
    name: string;
    admin: string;
    players: string[];
    status: RoomStatus;
    playerManager: InstanceType<typeof PlayerManagerClass>;
};

const rooms: Record<string, Room> = {};

export const RoomManager = {
    listRooms(): Room[] {
        return Object.values(rooms);
    },
    createRoom(name: string, admin: string): Room {
        const id = uuidv4();
        const playerManager = new PlayerManagerClass();
        const room: Room = {
            id,
            name,
            admin,
            players: [admin],
            status: 'ACTIVE',
            playerManager,
        };
        rooms[id] = room;
        // Додаємо адміна до менеджера гравців цієї кімнати
        room.playerManager.addUser(admin);
        room.playerManager.setActiveRoom(admin, id);
        return room;
    },
    getRoom(id: string): Room | undefined {
        return rooms[id];
    },
    editRoom(id: string, user: string, newName: string, newStatus?: RoomStatus): boolean {
        const room = rooms[id];
        if (!room || room.admin !== user) return false;
        room.name = newName;
        if (newStatus) room.status = newStatus;
        return true;
    },
    setRoomStatus(id: string, user: string, newStatus: RoomStatus): boolean {
        const room = rooms[id];
        if (!room || room.admin !== user) return false;
        room.status = newStatus;
        if (newStatus === 'GAME') {
            for (const username of room.players) {
                room.playerManager.setActiveRoom(username, id);
            }
        }
        return true;
    },
    deleteRoom(id: string, user: string): boolean {
        const room = rooms[id];
        if (!room || room.admin !== user) return false;
        // Очищаємо activeRoom у всіх гравців цієї кімнати
        for (const username of room.players) {
            room.playerManager.setActiveRoom(username, undefined as any);
            room.playerManager.removeUser(username);
        }
        delete rooms[id];
        return true;
    },
    joinRoom(id: string, user: string): boolean {
        const room = rooms[id];
        if (!room || room.players.includes(user)) return false;
        room.players.push(user);
        room.playerManager.addUser(user);
        room.playerManager.setActiveRoom(user, id);
        return true;
    },
    leaveRoom(id: string, user: string): boolean {
        const room = rooms[id];
        if (!room) return false;
        room.players = room.players.filter((u) => u !== user);
        room.playerManager.setActiveRoom(user, undefined as any);
        room.playerManager.removeUser(user);
        return true;
    },
};
