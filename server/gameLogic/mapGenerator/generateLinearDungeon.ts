import { Room, TileType } from './generateDungeon';

export interface NamedRoom extends Room {
    name: string;
}

export function generateLinearDungeon(
    width: number,
    height: number,
    roomCount: number = 6,
    minRoomSize: number = 4,
    maxRoomSize: number = 8,
): { map: TileType[][]; rooms: NamedRoom[] } {
    const map: TileType[][] = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => 'stone' as TileType),
    );

    const rooms: NamedRoom[] = [];
    let prevCenter: { x: number; y: number } | null = null;

    for (let i = 0; i < roomCount; i++) {
        const w = randInt(minRoomSize, maxRoomSize);
        const h = randInt(minRoomSize, maxRoomSize);

        // Розташовуємо кімнати послідовно по горизонталі (можна змінити на вертикаль)
        const x = i === 0 ? randInt(1, width - w - 1) : rooms[i - 1].x + rooms[i - 1].w + 2;
        const y = randInt(1, height - h - 1);

        const name = `Room ${i + 1}`;
        const newRoom: NamedRoom = { x, y, w, h, name };

        rooms.push(newRoom);

        // Малюємо кімнату
        for (let rx = x; rx < x + w; rx++) {
            for (let ry = y; ry < y + h; ry++) {
                map[ry][rx] = 'earth';
            }
        }

        // З'єднуємо з попередньою кімнатою коридором
        if (prevCenter) {
            let cx = prevCenter.x;
            let cy = prevCenter.y;
            const currCenter = {
                x: Math.floor(x + w / 2),
                y: Math.floor(y + h / 2),
            };
            while (cx !== currCenter.x) {
                map[cy][cx] = 'earth';
                cx += cx < currCenter.x ? 1 : -1;
            }
            while (cy !== currCenter.y) {
                map[cy][cx] = 'earth';
                cy += cy < currCenter.y ? 1 : -1;
            }
            map[cy][cx] = 'earth';
        }
        prevCenter = {
            x: Math.floor(x + w / 2),
            y: Math.floor(y + h / 2),
        };
    }

    // Додаємо трохи трави для краси
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

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
