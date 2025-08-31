import { drawIsoGrid } from '../../utils/drawIsoGrid.js';
import { drawText } from '../../utils/drawText.js';
import { gridToIso } from '../../utils/isometric.js';
import { Player } from '../../entities/Player.js';
import { EarthTile } from '../../tiles/EarthTile.js';
import { GrassTile } from '../../tiles/GrassTile.js';
import { StoneTile } from '../../tiles/StoneTile.js';
import { TileTextures } from '../../tiles/TileTextures.js';

export type TileType = 'earth' | 'grass' | 'stone';

export interface Room {
    x: number;
    y: number;
    w: number;
    h: number;
}

export class GameField {
    private dungeon: TileType[][];
    private dungeonWidth: number;
    private dungeonHeight: number;
    private rooms: Room[];

    private earthTile: EarthTile;
    private grassTile: GrassTile;
    private stoneTile: StoneTile;

    constructor(
        private player: Player,
        private showGrid: () => boolean,
        private tileWidth: number,
        private tileHeight: number,
        private gridSize: number,
        private textures: TileTextures,
        // Додаємо параметри для карти з сервера:
        map: TileType[][],
        mapWidth: number,
        mapHeight: number,
        rooms: Room[],
    ) {
        this.dungeon = map;
        this.dungeonWidth = mapWidth;
        this.dungeonHeight = mapHeight;
        this.rooms = rooms;

        this.earthTile = new EarthTile(this.textures);
        this.grassTile = new GrassTile(this.textures);
        this.stoneTile = new StoneTile(this.textures);

        // Якщо є хоча б одна кімната — ставимо персонажа у центр першої кімнати
        if (this.rooms.length > 0) {
            const firstRoom = this.rooms[0];
            const startX = Math.floor(firstRoom.x + firstRoom.w / 2);
            const startY = Math.floor(firstRoom.y + firstRoom.h / 2);
            this.player.x = startX;
            this.player.y = startY;
            (this.player as any).targetX = startX;
            (this.player as any).targetY = startY;
        }
    }

    public getTileTypeAt(gx: number, gy: number): TileType {
        if (gx >= 0 && gx < this.dungeonWidth && gy >= 0 && gy < this.dungeonHeight) {
            return this.dungeon[gy][gx];
        }
        return 'stone'; // все поза картою вважаємо стіною
    }

    render(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const gameFieldWidth = w;
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, gameFieldWidth, h);
        drawText(ctx, 'Ігрове поле', 20, 20);

        // === Малюємо підземелля ===
        const centerX = gameFieldWidth / 2;
        const centerY = h / 2;

        // Визначаємо межі видимих тайлів
        const tilesX = Math.ceil(gameFieldWidth / this.tileWidth) + 8;
        const tilesY = Math.ceil(h / this.tileHeight) + 8;
        const minGX = Math.floor(this.player.x - tilesX / 2);
        const maxGX = Math.ceil(this.player.x + tilesX / 2);
        const minGY = Math.floor(this.player.y - tilesY / 2);
        const maxGY = Math.ceil(this.player.y + tilesY / 2);

        for (let gx = minGX; gx <= maxGX; gx++) {
            for (let gy = minGY; gy <= maxGY; gy++) {
                const type = this.getTileTypeAt(gx, gy);
                let tile = null;
                if (type === 'earth') tile = this.earthTile;
                else if (type === 'grass') tile = this.grassTile;
                else if (type === 'stone') tile = this.stoneTile;
                if (!tile) continue;
                // Всесвіт: координати тайлів не зміщуються з персонажем!
                const { x: isoX, y: isoY } = gridToIso(
                    gx,
                    gy,
                    centerX -
                        (this.player.x * this.tileWidth) / 2 +
                        (this.player.y * this.tileWidth) / 2,
                    centerY -
                        (this.player.x * this.tileHeight) / 2 -
                        (this.player.y * this.tileHeight) / 2,
                    this.tileWidth,
                    this.tileHeight,
                );
                tile.render(ctx, isoX, isoY, this.tileWidth, this.tileHeight);
            }
        }

        // Сітка (рухається з персонажем)
        if (this.showGrid()) {
            const centerX = gameFieldWidth / 2;
            const centerY = h / 2;
            const tilesX = Math.ceil(gameFieldWidth / this.tileWidth) + 8;
            const tilesY = Math.ceil(h / this.tileHeight) + 8;
            const minGX = Math.floor(this.player.x - tilesX / 2);
            const maxGX = Math.ceil(this.player.x + tilesX / 2);
            const minGY = Math.floor(this.player.y - tilesY / 2);
            const maxGY = Math.ceil(this.player.y + tilesY / 2);

            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;

            for (let gx = minGX; gx <= maxGX; gx++) {
                for (let gy = minGY; gy <= maxGY; gy++) {
                    const { x: isoX, y: isoY } = gridToIso(
                        gx - this.player.x,
                        gy - this.player.y,
                        centerX,
                        centerY,
                        this.tileWidth,
                        this.tileHeight,
                    );
                    if (
                        isoX + this.tileWidth / 2 >= 0 &&
                        isoX - this.tileWidth / 2 <= gameFieldWidth &&
                        isoY + this.tileHeight / 2 >= 0 &&
                        isoY - this.tileHeight / 2 <= h
                    ) {
                        ctx.beginPath();
                        ctx.moveTo(isoX, isoY - this.tileHeight / 2);
                        ctx.lineTo(isoX + this.tileWidth / 2, isoY);
                        ctx.lineTo(isoX, isoY + this.tileHeight / 2);
                        ctx.lineTo(isoX - this.tileWidth / 2, isoY);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
            }
            ctx.restore();
        }
    }
}
