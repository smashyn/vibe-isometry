import { drawText } from './drawText.js';
import { drawError } from './drawError.js';

/**
 * Рендерить масив UI елементів (Input, Button, drawText, drawError тощо) вертикально по центру екрана.
 * Елемент може бути:
 *   - UI-об'єктом з методом render(ctx, x, y) та width/height
 *   - Функцією drawText/drawError з параметрами
 *   - Об'єктом з type: 'text' або 'error' для умовного рендера
 * @param ctx CanvasRenderingContext2D
 * @param elements Масив елементів для рендера
 * @param gap Відстань між елементами (за замовчуванням 20)
 */
export function renderCenteredUI(
    ctx: CanvasRenderingContext2D,
    elements: Array<
        | {
              width: number;
              height: number;
              render: (ctx: CanvasRenderingContext2D, x: number, y: number) => void;
          }
        | {
              type: 'text';
              text: string;
              font?: string;
              color?: string;
              textAlign?: CanvasTextAlign;
              height?: number;
              condition?: boolean;
          }
        | {
              type: 'error';
              text: string;
              font?: string;
              color?: string;
              height?: number;
              condition?: boolean;
          }
    >,
    gap: number = 20,
) {
    const { width: canvasWidth, height: canvasHeight } = ctx.canvas;

    // Визначаємо висоту для кожного елемента
    const getHeight = (el: any) =>
        el.height ?? (el.type === 'text' || el.type === 'error' ? 20 : 0);

    // Фільтруємо елементи за умовою condition (або якщо немає condition)
    // const filtered = elements.filter((el: any) => el.condition === undefined || el.condition);

    const totalHeight =
        elements.reduce((sum, el) => sum + getHeight(el), 0) + gap * (elements.length - 1);

    let y = Math.round((canvasHeight - totalHeight) / 2);

    for (const el of elements) {
        if ('render' in el && typeof el.render === 'function') {
            const x = Math.round((canvasWidth - el.width) / 2);
            el.render(ctx, x, y);
            y += el.height + gap;
        } else if ('type' in el && el.type === 'text') {
            drawText(
                ctx,
                el.text,
                el.textAlign === 'right' ? canvasWidth / 2 - 120 : canvasWidth / 2,
                y,
                el.font,
                el.color,
                el.textAlign ?? 'left',
            );
            y += (el.height ?? 20) + gap;
        } else if ('type' in el && el.type === 'error') {
            drawError(ctx, el.text, canvasWidth / 2 - 120, y, el.font, el.color);
            y += (el.height ?? 20) + gap;
        }
    }
}
