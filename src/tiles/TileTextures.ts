export class TileTextures {
    public dirt: HTMLImageElement;
    public grass: HTMLImageElement;
    public stone: HTMLImageElement;

    public dirtFixed!: HTMLCanvasElement;
    public grassFixed!: HTMLCanvasElement;
    public stoneFixed!: HTMLCanvasElement;

    public loaded: Promise<void>;

    constructor() {
        this.dirt = new Image();
        this.grass = new Image();
        this.stone = new Image();

        const size = 128; // Фіксований розмір текстури

        const dirtPromise = new Promise<void>(resolve => {
            this.dirt.onload = () => {
                this.dirtFixed = TileTextures.createFixedTexture(this.dirt, size);
                resolve();
            };
            this.dirt.src = '/assets/dirt-01.jpg';
        });
        const grassPromise = new Promise<void>(resolve => {
            this.grass.onload = () => {
                this.grassFixed = TileTextures.createFixedTexture(this.grass, size);
                resolve();
            };
            this.grass.src = '/assets/grass-01.jpg';
        });
        const stonePromise = new Promise<void>(resolve => {
            this.stone.onload = () => {
                this.stoneFixed = TileTextures.createFixedTexture(this.stone, size);
                resolve();
            };
            this.stone.src = '/assets/stone-01.jpg';
        });

        this.loaded = Promise.all([dirtPromise, grassPromise, stonePromise]).then(() => {});
    }

    private static createFixedTexture(img: HTMLImageElement, size: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, size, size);
        return canvas;
    }
}