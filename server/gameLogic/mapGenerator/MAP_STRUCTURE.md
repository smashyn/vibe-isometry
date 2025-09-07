# Структура генератора карти

```
┌────────────┐
│   Act      │
│────────────│
│ id         │
│ name       │
│ goal       │
│ sections[] │
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Section   │
│────────────│
│ id         │
│ name       │
│ rooms[]    │
└─────┬──────┘
      │
      ▼
┌────────────┐
│   Room     │
│────────────│
│ id         │
│ x, y, w, h │
│ type       │
│ connections│
│ texture    │
│ tiles[][]  │
│ objects[]  │
│ structures[]│
│ monsters[] │
└────────────┘
```

## Опис

- **Act** — головний сценарій (наприклад, знайти артефакт, вбити боса). Містить масив секцій.
- **Section** — частина акта, яка складається з послідовних кімнат (деякі можуть бути тупиками).
- **Room** — область на карті, має координати, розміри, тип (основна/тупик), зв'язки з іншими кімнатами, текстуру, двомірний масив тайлів, об'єкти, структури, монстрів.

## Логіка проходження

1. Гравець починає у першій кімнаті першої секції першого акта.
2. Проходить всі основні кімнати секції (може заходити у тупики).
3. В кінці секції переходить до наступної секції.
4. В кінці останньої секції виконує головну мету акта.

---

**Цю структуру можна використовувати як основу для генерації та навігації по карті.**

---

## Приклад (максимально простий)

```typescript
const act: Act = {
    id: 'act1',
    name: 'Пошук артефакта',
    goal: 'find_artifact',
    sections: [
        {
            id: 'sec1',
            name: 'Ліс',
            rooms: [
                {
                    id: 'room1',
                    x: 0,
                    y: 0,
                    w: 10,
                    h: 10,
                    type: 'main',
                    connections: ['room2'],
                    texture: 'grass',
                    tiles: [
                        /* ... */
                    ],
                    objects: [],
                    structures: [],
                    monsters: [{ type: 'wolf', count: 2 }],
                },
                {
                    id: 'room2',
                    x: 12,
                    y: 0,
                    w: 10,
                    h: 10,
                    type: 'main',
                    connections: ['room1', 'room3', 'room_deadend'],
                    texture: 'grass',
                    tiles: [
                        /* ... */
                    ],
                    objects: [],
                    structures: [],
                    monsters: [{ type: 'goblin', count: 1 }],
                },
                {
                    id: 'room_deadend',
                    x: 12,
                    y: 12,
                    w: 8,
                    h: 8,
                    type: 'deadend',
                    connections: ['room2'],
                    texture: 'grass',
                    tiles: [
                        /* ... */
                    ],
                    objects: [],
                    structures: [],
                    monsters: [],
                },
                {
                    id: 'room3',
                    x: 24,
                    y: 0,
                    w: 10,
                    h: 10,
                    type: 'main',
                    connections: ['room2'],
                    texture: 'grass',
                    tiles: [
                        /* ... */
                    ],
                    objects: [],
                    structures: [],
                    monsters: [{ type: 'boss', count: 1 }],
                },
            ],
        },
    ],
};
```

**У цьому прикладі:**

- Є один акт з однією секцією "Ліс".
- В секції три основні кімнати (room1 → room2 → room3) і один тупик (room_deadend).
- Гравець проходить room1 → room2 → room3, може зайти у тупик room_deadend.
- В room3 знаходиться бос, що завершує секцію.
