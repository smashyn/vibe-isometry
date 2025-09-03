import { MapStorage, SavedMapData } from './mapStorage';
import { generateDungeonWithSeed } from './mapGenerator/generateDungeon';

export const MapManager = {
    /**
     * Генерує нову карту, зберігає її у файл і повертає дані карти.
     */
    generateAndSaveMap(
        name: string,
        width: number,
        height: number,
        roomCount: number,
        minRoomSize: number,
        maxRoomSize: number,
        seed: number,
    ): SavedMapData {
        const { map, rooms } = generateDungeonWithSeed(
            width,
            height,
            roomCount,
            minRoomSize,
            maxRoomSize,
            seed,
        );
        const mapData: SavedMapData = { map, rooms, width, height, seed };
        MapStorage.saveMapToFile(name, mapData);
        return mapData;
    },

    /**
     * Завантажує карту з файлу за назвою.
     */
    loadMap(name: string): SavedMapData | null {
        return MapStorage.loadMapFromFile(name);
    },

    /**
     * Повертає список назв збережених карт.
     */
    listMaps(): string[] {
        return MapStorage.listSavedMaps();
    },
};
