export interface Scene {
    update(delta: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    onActivate(): void;
    onDeactivate(): void;
    isActive: boolean;
}
