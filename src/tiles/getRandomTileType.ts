export type TileType = 'earth' | 'grass' | 'stone';

// Генеруємо тип тайлу випадково (але детерміновано для одних і тих самих координат)
export function getRandomTileType(gx: number, gy: number): TileType {
    // Простий детермінований "рандом" для однакових координат
    const n = Math.abs((gx * 73856093) ^ (gy * 19349663)) % 100;
    if (n < 33) return 'earth';
    if (n < 66) return 'grass';
    return 'stone';
}