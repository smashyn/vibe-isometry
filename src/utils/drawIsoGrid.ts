import { gridToIso } from './isometric.js';

export function drawIsoGrid(
    ctx: CanvasRenderingContext2D,
    gridSize: number,
    centerX: number,
    centerY: number,
    tileWidth: number,
    tileHeight: number
) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;

    for (let gx = -gridSize; gx <= gridSize; gx++) {
        for (let gy = -gridSize; gy <= gridSize; gy++) {
            const { x: isoX, y: isoY } = gridToIso(gx, gy, centerX, centerY, tileWidth, tileHeight);

            ctx.beginPath();
            ctx.moveTo(isoX, isoY - tileHeight / 2);
            ctx.lineTo(isoX + tileWidth / 2, isoY);
            ctx.lineTo(isoX, isoY + tileHeight / 2);
            ctx.lineTo(isoX - tileWidth / 2, isoY);
            ctx.closePath();
            ctx.stroke();
        }
    }
    ctx.restore();
}