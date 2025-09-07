import { v4 as uuidv4 } from 'uuid';
import { PlayerManager as PlayerManagerClass } from './playerManager';
import fs from 'fs';
import { serverConfig } from '../serverConfig';
import { createAct } from './mapGenerator/generateActWithSections';
import { Act } from './mapGenerator/types';

export type RoomStatus = 'ACTIVE' | 'GAME' | 'INACTIVE';

export type ChatMessage = {
    sender: string;
    text: string;
    timestamp: number; // ms since epoch
};

export type Room = {
    id: string;
    name: string;
    admin: string;
    players: string[];
    status: RoomStatus;
    playerManager: InstanceType<typeof PlayerManagerClass>;
    chat: ChatMessage[];
    map: MapConfig;
};

export type MapConfig = {
    acts: Act[];
};

const ROOMS_FILE = serverConfig.dbFiles.rooms;

// --- Завантаження кімнат з файлу ---
function loadRooms(): Record<string, Room> {
    if (!fs.existsSync(ROOMS_FILE)) return {};
    try {
        const raw = JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf-8'));
        for (const id in raw) {
            raw[id].playerManager = new PlayerManagerClass();
        }
        return raw;
    } catch {
        return {};
    }
}

// --- Збереження кімнат у файл ---
function saveRooms(rooms: Record<string, Room>) {
    // Не зберігаємо playerManager (бо це клас, а не plain object)
    const plainRooms: any = {};
    for (const id in rooms) {
        const { playerManager, ...rest } = rooms[id];
        plainRooms[id] = rest;
    }
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(plainRooms, null, 2), 'utf-8');
}

const rooms: Record<string, Room> = loadRooms();

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
            chat: [],
            map: {
                acts: [
                    createAct('Пошук артефакта', 'find_artifact', [
                        { name: 'Ліс', roomsCount: 40 },
                        { name: 'Болото', roomsCount: 40 },
                    ]),
                ],
            },
        };
        rooms[id] = room;
        room.playerManager.addUser(admin);
        room.playerManager.setActiveRoom(admin, id);
        saveRooms(rooms);
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
        saveRooms(rooms);
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
        saveRooms(rooms);
        return true;
    },
    deleteRoom(id: string, user: string): boolean {
        const room = rooms[id];
        if (!room || room.admin !== user) return false;
        for (const username of room.players) {
            room.playerManager.setActiveRoom(username, undefined as any);
            room.playerManager.removeUser(username);
        }
        delete rooms[id];
        saveRooms(rooms);
        return true;
    },
    joinRoom(id: string, user: string): boolean {
        const room = rooms[id];
        if (!room || room.players.includes(user)) return false;
        room.players.push(user);
        room.playerManager.addUser(user);
        room.playerManager.setActiveRoom(user, id);
        saveRooms(rooms);
        return true;
    },
    leaveRoom(id: string, user: string): boolean {
        const room = rooms[id];
        if (!room) return false;
        room.players = room.players.filter((u) => u !== user);
        room.playerManager.setActiveRoom(user, undefined as any);
        room.playerManager.removeUser(user);
        saveRooms(rooms);
        return true;
    },
    /**
     * Додає повідомлення в чат кімнати.
     * Зберігає лише 50 останніх повідомлень.
     */
    addChatMessage(roomId: string, sender: string, text: string): boolean {
        const room = rooms[roomId];
        if (!room) return false;
        const msg: ChatMessage = {
            sender,
            text,
            timestamp: Date.now(),
        };
        room.chat.push(msg);
        if (room.chat.length > 50) {
            room.chat = room.chat.slice(-50);
        }
        saveRooms(rooms);
        return true;
    },

    /**
     * Повертає чат кімнати (масив повідомлень)
     */
    getChat(roomId: string): ChatMessage[] {
        const room = rooms[roomId];
        return room ? room.chat : [];
    },
};
