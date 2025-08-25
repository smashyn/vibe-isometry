import { BaseTile } from './BaseTile.js';
import { TileTextures } from './TileTextures.js';

export class StoneTile extends BaseTile {
    constructor(private textures: TileTextures) {
        super();
    }

    render(
        ctx: CanvasRenderingContext2D,
        isoX: number,
        isoY: number,
        tileWidth: number,
        tileHeight: number
    ): void {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(isoX, isoY - tileHeight / 2);
        ctx.lineTo(isoX + tileWidth / 2, isoY);
        ctx.lineTo(isoX, isoY + tileHeight / 2);
        ctx.lineTo(isoX - tileWidth / 2, isoY);
        ctx.closePath();
        ctx.clip();

        (ctx as any).imageSmoothingEnabled = true;

        ctx.drawImage(
            this.textures.stoneFixed,
            0, 0, this.textures.stoneFixed.width, this.textures.stoneFixed.height,
            isoX - tileWidth / 2, isoY - tileHeight / 2,
            tileWidth, tileHeight
        );

        ctx.restore();
    }
}