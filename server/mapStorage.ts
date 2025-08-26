import fs from 'fs';
import path from 'path';
import { Room } from './generateDungeon.js';

const MAPS_DIR = path.resolve(__dirname, 'maps');

export interface SavedMapData {
    map: any;
    rooms: Room[];
    width: number;
    height: number;
    seed?: number;
}

export const MapStorage = {
    saveMapToFile(name: string, mapData: SavedMapData) {
        if (!fs.existsSync(MAPS_DIR)) fs.mkdirSync(MAPS_DIR, { recursive: true });
        fs.writeFileSync(
            path.join(MAPS_DIR, `${name}.json`),
            JSON.stringify(mapData, null, 2),
            'utf-8',
        );
    },

    loadMapFromFile(name: string): SavedMapData | null {
        const filePath = path.join(MAPS_DIR, `${name}.json`);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
        return null;
    },

    listSavedMaps(): string[] {
        if (!fs.existsSync(MAPS_DIR)) return [];
        return fs
            .readdirSync(MAPS_DIR)
            .filter((f) => f.endsWith('.json'))
            .map((f) => f.replace(/\.json$/, ''));
    },

    // Команда для ініціалізації карти (завантаження або генерація)
    initMap(
        MAP_NAME: string,
        defaultParams: {
            width: number;
            height: number;
            seed: number;
            roomCount: number;
            minRoomSize: number;
            maxRoomSize: number;
        },
        generateDungeonWithSeed: Function,
    ) {
        let DUNGEON_WIDTH = defaultParams.width;
        let DUNGEON_HEIGHT = defaultParams.height;
        let DUNGEON_SEED = defaultParams.seed;
        let dungeonMap: any, dungeonRooms: Room[];

        const loaded = MapStorage.loadMapFromFile(MAP_NAME);
        if (loaded) {
            dungeonMap = loaded.map;
            dungeonRooms = loaded.rooms;
            DUNGEON_WIDTH = loaded.width;
            DUNGEON_HEIGHT = loaded.height;
            DUNGEON_SEED = loaded.seed ?? DUNGEON_SEED;
            console.log('Карта завантажена з файлу!');
        } else {
            const generated = generateDungeonWithSeed(
                DUNGEON_WIDTH,
                DUNGEON_HEIGHT,
                defaultParams.roomCount,
                defaultParams.minRoomSize,
                defaultParams.maxRoomSize,
                DUNGEON_SEED,
            );
            dungeonMap = generated.map;
            dungeonRooms = generated.rooms;
            MapStorage.saveMapToFile(MAP_NAME, {
                map: dungeonMap,
                rooms: dungeonRooms,
                width: DUNGEON_WIDTH,
                height: DUNGEON_HEIGHT,
                seed: DUNGEON_SEED,
            });
            console.log('Карта згенерована та збережена!');
        }

        return {
            map: dungeonMap,
            rooms: dungeonRooms,
            width: DUNGEON_WIDTH,
            height: DUNGEON_HEIGHT,
            seed: DUNGEON_SEED,
        };
    },
};
