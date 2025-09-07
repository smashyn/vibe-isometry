import { generateRoomsLinearWithDeadends } from './generateRoomsLinearWithDeadends';
import { Act, Section, TileType } from './types';
import { randomUUID } from 'crypto';

// Створює акт з заданим ім'ям, метою та списком секцій
export function createAct(
    name: string,
    goal: string,
    sectionConfigs: { name: string; roomsCount: number }[],
): Act {
    const actId = randomUUID();
    const sections: Section[] = sectionConfigs.map((cfg, idx) => ({
        id: randomUUID(),
        name: cfg.name,
        rooms: generateRoomsLinearWithDeadends(
            cfg.roomsCount,
            Math.floor(cfg.roomsCount / 2),
            'earth',
        ),
        prev: idx > 0 ? undefined : undefined, // можна додати prev/next при генерації
        next: undefined,
    }));

    // Проставляємо prev/next для секцій
    for (let i = 0; i < sections.length; i++) {
        if (i > 0) sections[i].prev = sections[i - 1].id;
        if (i < sections.length - 1) sections[i].next = sections[i + 1].id;
    }

    return {
        id: actId,
        name,
        goal,
        description: '',
        sections,
    };
}
