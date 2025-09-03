export type TileType = 'earth' | 'grass' | 'stone';

import { MapStorage } from '../mapStorage';

export interface Room {
    x: number; // left
    y: number; // top
    w: number; // width
    h: number; // height
}

export function generateAndSaveMap(
    name: string,
    width: number,
    height: number,
    roomCount: number,
    minRoomSize: number,
    maxRoomSize: number,
    seed: number,
) {
    const { map, rooms } = generateDungeonWithSeed(
        width,
        height,
        roomCount,
        minRoomSize,
        maxRoomSize,
        seed,
    );
    MapStorage.saveMapToFile(name, { map, rooms, width, height, seed });
}

// Додаємо підтримку сідованого Math.random
function seededRandom(seed: number) {
    let x = Math.sin(seed) * 10000;
    return function () {
        x = Math.sin(x) * 10000;
        return x - Math.floor(x);
    };
}

// Патчимо Math.random для стабільної генерації
export function generateDungeonWithSeed(
    width: number,
    height: number,
    roomCount: number,
    minRoomSize: number,
    maxRoomSize: number,
    seed: number,
) {
    const oldRandom = Math.random;
    Math.random = seededRandom(seed);
    const result = generateDungeon(width, height, roomCount, minRoomSize, maxRoomSize);
    Math.random = oldRandom;
    return result;
}

// Тепер повертає і карту, і масив кімнат
export function generateDungeon(
    width: number,
    height: number,
    roomCount: number = 6,
    minRoomSize: number = 4,
    maxRoomSize: number = 8,
): { map: TileType[][]; rooms: Room[] } {
    const map: TileType[][] = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => 'stone' as TileType),
    );

    const rooms: Room[] = [];

    for (let i = 0; i < roomCount; i++) {
        const w = randInt(minRoomSize, maxRoomSize);
        const h = randInt(minRoomSize, maxRoomSize);
        const x = randInt(1, width - w - 1);
        const y = randInt(1, height - h - 1);

        const newRoom: Room = { x, y, w, h };

        let overlaps = false;
        for (const room of rooms) {
            if (
                x < room.x + room.w + 1 &&
                x + w + 1 > room.x &&
                y < room.y + room.h + 1 &&
                y + h + 1 > room.y
            ) {
                overlaps = true;
                break;
            }
        }
        if (!overlaps) {
            rooms.push(newRoom);
            for (let rx = x; rx < x + w; rx++) {
                for (let ry = y; ry < y + h; ry++) {
                    map[ry][rx] = 'earth';
                }
            }
        }
    }

    for (let i = 1; i < rooms.length; i++) {
        const prev = rooms[i - 1];
        const curr = rooms[i];
        const prevCenter = {
            x: Math.floor(prev.x + prev.w / 2),
            y: Math.floor(prev.y + prev.h / 2),
        };
        const currCenter = {
            x: Math.floor(curr.x + curr.w / 2),
            y: Math.floor(curr.y + curr.h / 2),
        };

        let x = prevCenter.x;
        let y = prevCenter.y;
        while (x !== currCenter.x) {
            map[y][x] = 'earth';
            x += x < currCenter.x ? 1 : -1;
        }
        while (y !== currCenter.y) {
            map[y][x] = 'earth';
            y += y < currCenter.y ? 1 : -1;
        }
        map[y][x] = 'earth';
    }

    for (const room of rooms) {
        for (let i = 0; i < Math.floor((room.w * room.h) / 4); i++) {
            const rx = randInt(room.x, room.x + room.w - 1);
            const ry = randInt(room.y, room.y + room.h - 1);
            if (map[ry][rx] === 'earth') {
                map[ry][rx] = 'grass';
            }
        }
    }

    return { map, rooms };
}

function randInt(a: number, b: number) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}
