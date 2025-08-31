import { drawText } from './drawText.js';

export function drawError(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    font: string = '16px Arial',
    color: string = '#d32f2f',
    textAlign: CanvasTextAlign = 'left',
) {
    drawText(ctx, text, x, y, font, color, textAlign);
}
