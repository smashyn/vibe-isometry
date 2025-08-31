export function drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    font: string = 'bold 22px Arial',
    color: string = '#fff',
    textAlign: CanvasTextAlign = 'left',
) {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
    ctx.restore();
}
