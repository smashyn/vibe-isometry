import { generateDungeon } from './generateDungeon.js';
import * as fs from 'fs';

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
    seed: number
) {
    const oldRandom = Math.random;
    Math.random = seededRandom(seed);
    const result = generateDungeon(width, height, roomCount, minRoomSize, maxRoomSize);
    Math.random = oldRandom;
    return result;
}

// Генеруємо підземелля з 20 кімнатами та сидом 12345
const { map, rooms } = generateDungeonWithSeed(50, 30, 20, 4, 8, 12345);

// Готуємо дані для збереження
const dungeonMapString = JSON.stringify(map, null, 2);
const roomsString = JSON.stringify(rooms, null, 2);

const fileContent = `import { TileType, Room } from './generateDungeon.js';

export const STATIC_DUNGEON_WIDTH = 50;
export const STATIC_DUNGEON_HEIGHT = 30;

export const STATIC_DUNGEON_MAP: TileType[][] = ${dungeonMapString};

export const STATIC_DUNGEON_ROOMS: Room[] = ${roomsString};
`;

fs.writeFileSync('src/tiles/staticDungeon.ts', fileContent, 'utf-8');
console.log('Static dungeon generated and saved to src/tiles/staticDungeon.ts');