import { randomUUID } from 'crypto';

export type TileType = 'earth' | 'grass' | 'stone';

export interface Section {
    id: string;
    name: string;
    x: number;
    y: number;
    w: number;
    h: number;
    texture?: TileType;
    prev?: string;
    next?: string;
}

function randInt(a: number, b: number) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

// Додаємо підтримку сідованого Math.random
function seededRandom(seed: number) {
    let x = Math.sin(seed) * 10000;
    return function () {
        x = Math.sin(x) * 10000;
        return x - Math.floor(x);
    };
}

// Патчимо Math.random для стабільної генерації
export function generateDungeonWithSeed(
    width: number,
    height: number,
    sectionNames: string[],
    minSectionSize: number,
    maxSectionSize: number,
    seed: number,
) {
    const oldRandom = Math.random;
    Math.random = seededRandom(seed);
    const result = generateLinearSectionsDungeon(
        width,
        height,
        sectionNames,
        minSectionSize,
        maxSectionSize,
    );
    Math.random = oldRandom;
    return result;
}

// Секції розташовуються випадково, але з'єднуються послідовно
export function generateLinearSectionsDungeon(
    width: number,
    height: number,
    sectionNames: string[],
    minSectionSize: number = 20,
    maxSectionSize: number = 30,
    maxTries: number = 100,
): { map: TileType[][]; sections: Section[] } {
    const map: TileType[][] = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => 'stone' as TileType),
    );

    const sections: Section[] = [];
    let prevSectionId: string | undefined = undefined;
    let prevCenter: { x: number; y: number } | null = null;

    for (let i = 0; i < sectionNames.length; i++) {
        let w = randInt(minSectionSize, maxSectionSize);
        let h = randInt(minSectionSize, maxSectionSize);

        // Випадкове розташування секції, без перекриття з попередніми
        let x = 0,
            y = 0,
            placed = false,
            tries = 0;
        while (!placed && tries < maxTries) {
            x = randInt(1, width - w - 1);
            y = randInt(1, height - h - 1);
            placed = true;
            for (const s of sections) {
                if (x < s.x + s.w + 2 && x + w + 2 > s.x && y < s.y + s.h + 2 && y + h + 2 > s.y) {
                    placed = false;
                    break;
                }
            }
            tries++;
        }
        if (!placed) {
            // fallback: розташовуємо секцію поряд з попередньою
            if (sections.length > 0) {
                const prev = sections[sections.length - 1];
                x = prev.x + prev.w + randInt(2, 3);
                y = prev.y;
            } else {
                x = randInt(1, width - w - 1);
                y = randInt(1, height - h - 1);
            }
        }

        const id = randomUUID();
        const name = sectionNames[i];
        const section: Section = { id, name, x, y, w, h };

        // Зв'язки з попередньою/наступною секцією через id
        if (i > 0) {
            section.prev = prevSectionId;
            sections[i - 1].next = id;
        }
        prevSectionId = id;

        sections.push(section);

        // Малюємо секцію (кімнату)
        for (let rx = x; rx < x + w; rx++) {
            for (let ry = y; ry < y + h; ry++) {
                map[ry][rx] = 'earth';
            }
        }

        // Малюємо коридор 2-3 клітини шириною до попередньої секції
        if (prevCenter) {
            const currCenter = {
                x: Math.floor(x + w / 2),
                y: Math.floor(y + h / 2),
            };
            const corridorWidth = randInt(2, 3);

            // Горизонтальний коридор
            for (
                let dx = Math.min(prevCenter.x, currCenter.x);
                dx <= Math.max(prevCenter.x, currCenter.x);
                dx++
            ) {
                for (
                    let dy = -Math.floor(corridorWidth / 2);
                    dy <= Math.floor(corridorWidth / 2);
                    dy++
                ) {
                    const cy = prevCenter.y + dy;
                    if (cy >= 0 && cy < height) {
                        map[cy][dx] = 'earth';
                    }
                }
            }
            // Вертикальний коридор
            for (
                let dy = Math.min(prevCenter.y, currCenter.y);
                dy <= Math.max(prevCenter.y, currCenter.y);
                dy++
            ) {
                for (
                    let dx = -Math.floor(corridorWidth / 2);
                    dx <= Math.floor(corridorWidth / 2);
                    dx++
                ) {
                    const cx = currCenter.x + dx;
                    if (cx >= 0 && cx < width) {
                        map[dy][cx] = 'earth';
                    }
                }
            }
        }
        prevCenter = {
            x: Math.floor(x + w / 2),
            y: Math.floor(y + h / 2),
        };
    }

    // Додаємо трохи трави для краси
    for (const section of sections) {
        for (let i = 0; i < Math.floor((section.w * section.h) / 4); i++) {
            const rx = randInt(section.x, section.x + section.w - 1);
            const ry = randInt(section.y, section.y + section.h - 1);
            if (map[ry][rx] === 'earth') {
                map[ry][rx] = 'grass';
            }
        }
    }

    return { map, sections };
}
