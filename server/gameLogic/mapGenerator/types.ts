type Act1TileType = 'earth' | 'grass' | 'stone';
type Act2TileType = 'sand' | 'stone' | 'lava';

export type TileType = Act1TileType | Act2TileType;

// Room -> Section -> Act
// Room - це конкретна кімната на карті, яка має координати і розміри
// Section - це логічна частина акту, яка може містити кілька кімнат
// Act - це набір секцій з певною метою
// Тип для кімнати
export interface Room {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    type: 'main' | 'deadend'; // основний шлях чи тупик
    connections: string[]; // id інших кімнат
    texture: TileType; // тип текстури для кімнати
    tiles: TileType[][]; // локальна карта кімнати
    objects?: MapObject[]; // об'єкти (наприклад, будинки, скрині)
    structures?: MapObject[]; // складні структури (наприклад, храм, печера)
    monsters?: { type: string; count: number }[]; // монстри та їх кількість
}

// Тип для секції
export interface Section {
    id: string;
    name: string;
    description?: string;
    rooms: Room[]; // послідовність кімнат
    texture?: TileType; // основний стиль секції
    prev?: string; // id попередньої секції
    next?: string; // id наступної секції
}

// Тип для акту
export interface Act {
    id: string;
    name: string;
    goal: 'find_artifact' | 'kill_boss' | 'rescue_prisoner' | string;
    description: string;
    sections: Section[]; // послідовність секцій
}

export interface MapObject {
    texture: boolean;
    id: string;
    type: string; // наприклад, 'house', 'temple', 'cave'
    x: number;
    y: number;
    w: number;
    h: number;
    tiles?: TileType[][]; // локальна карта об'єкта
    entrance?: { x: number; y: number }; // координати входу
    properties?: Record<string, any>;
}
