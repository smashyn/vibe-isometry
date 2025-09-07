import { randomUUID } from 'crypto';
import { Room, TileType } from './types';
import { generateRoomTiles } from './generateRoomTiles';

// Генерує кімнати для секції: головний шлях + лабіринт з тупиками
export function generateRoomsLinearWithDeadends(
    mainCount: number,
    deadendCount: number,
    texture: TileType,
    minRoomSize: number = 40,
    maxRoomSize: number = 80,
): Room[] {
    const rooms: Room[] = [];
    // Основний лінійний шлях
    let prevId: string | null = null;
    let x = 0,
        y = 0;
    for (let i = 0; i < mainCount; i++) {
        const w = randInt(minRoomSize, maxRoomSize);
        const h = randInt(minRoomSize, maxRoomSize);
        const id = randomUUID();
        const room: Room = {
            id,
            x,
            y,
            w,
            h,
            type: 'main',
            connections: prevId ? [prevId] : [],
            texture,
            tiles: generateRoomTiles(w, h, texture),
            objects: [],
            structures: [],
            monsters: [],
        };
        if (prevId) {
            // Зворотній зв'язок
            const prevRoom = rooms.find((r) => r.id === prevId);
            if (prevRoom) prevRoom.connections.push(id);
        }
        rooms.push(room);
        // Зсуваємо координати для наступної кімнати (горизонтально)
        x += w + randInt(2, 4);
        y += randInt(-2, 2);
        prevId = id;
    }

    // Генеруємо тупики (deadend)
    for (let i = 0; i < deadendCount; i++) {
        const w = randInt(minRoomSize, maxRoomSize);
        const h = randInt(minRoomSize, maxRoomSize);
        const id = randomUUID();
        // Вибираємо випадкову основну кімнату для підключення тупика
        const mainRoom = rooms[randInt(0, rooms.length - 1)];
        // Відносно основної кімнати
        const dx = randInt(-w - 4, w + 4);
        const dy = randInt(-h - 4, h + 4);
        const room: Room = {
            id,
            x: mainRoom.x + dx,
            y: mainRoom.y + dy,
            w,
            h,
            type: 'deadend',
            connections: [mainRoom.id],
            texture,
            tiles: generateRoomTiles(w, h, texture),
            objects: [],
            structures: [],
            monsters: [],
        };
        mainRoom.connections.push(id);
        rooms.push(room);
    }

    return rooms;
}

function randInt(a: number, b: number) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}
