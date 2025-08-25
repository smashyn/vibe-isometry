export function gridToIso(
    gx: number,
    gy: number,
    centerX: number,
    centerY: number,
    tileWidth: number,
    tileHeight: number
) {
    return {
        x: centerX + (gx - gy) * tileWidth / 2,
        y: centerY + (gx + gy) * tileHeight / 2
    };
}

export function isoToGrid(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    tileWidth: number,
    tileHeight: number
) {
    const dx = x - centerX;
    const dy = y - centerY;
    const gx = Math.round((dx / (tileWidth / 2) + dy / (tileHeight / 2)) / 2);
    const gy = Math.round((dy / (tileHeight / 2) - dx / (tileWidth / 2)) / 2);
    return { gx, gy };
}