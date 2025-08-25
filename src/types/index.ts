export interface Vector2 {
    x: number;
    y: number;
}

export interface GameObject {
    position: Vector2;
    update(): void;
    draw(context: CanvasRenderingContext2D): void;
}