export abstract class BaseTile {
    abstract render(
        ctx: CanvasRenderingContext2D,
        isoX: number,
        isoY: number,
        tileWidth: number,
        tileHeight: number
    ): void;
}