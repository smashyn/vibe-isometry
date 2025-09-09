class PlayerRenderer {
    render(ctx: CanvasRenderingContext2D, player: any, others?: any[]): void {
        ctx.save();
        ctx.font = '32px Arial';
        ctx.fillStyle = 'blue';
        ctx.fillText('PlayerRenderer', 50, 100);
        ctx.restore();
    }
}
export { PlayerRenderer };
