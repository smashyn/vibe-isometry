import { TileType, MapObject } from './types';

// Генератор тайлів для кімнати з коридором 3-4 клітини шириною та 5-7 довжиною
export function generateRoomTiles(
    w: number,
    h: number,
    baseTexture: TileType,
    structures: MapObject[] = [],
    objects: MapObject[] = [],
    corridorTexture: TileType = 'stone',
): TileType[][] {
    // Створюємо базову кімнату з baseTexture
    const tiles: TileType[][] = Array.from({ length: h }, () =>
        Array.from({ length: w }, () => baseTexture),
    );

    // Додаємо коридор по центру кімнати
    const corridorWidth = Math.floor(Math.random() * 2) + 3; // 3-4 клітини
    const corridorLength = Math.floor(Math.random() * 3) + 5; // 5-7 клітин
    const startX = Math.floor((w - corridorWidth) / 2);
    const startY = Math.floor((h - corridorLength) / 2);

    for (let y = startY; y < startY + corridorLength && y < h; y++) {
        for (let x = startX; x < startX + corridorWidth && x < w; x++) {
            tiles[y][x] = corridorTexture;
        }
    }

    // Вставляємо складні структури (наприклад, будинки, печери)
    for (const structure of structures) {
        if (!structure.tiles) continue;
        for (let sy = 0; sy < structure.tiles.length; sy++) {
            for (let sx = 0; sx < structure.tiles[sy].length; sx++) {
                const tx = structure.x + sx;
                const ty = structure.y + sy;
                if (tx >= 0 && tx < w && ty >= 0 && ty < h && structure.tiles[sy][sx] !== null) {
                    tiles[ty][tx] = structure.tiles[sy][sx];
                }
            }
        }
    }

    // Вставляємо прості об'єкти (наприклад, скрині, декор)
    for (const obj of objects) {
        if (typeof obj.texture === 'string' && obj.x >= 0 && obj.x < w && obj.y >= 0 && obj.y < h) {
            tiles[obj.y][obj.x] = obj.texture;
        }
    }

    return tiles;
}
