import fs from 'fs';
import path from 'path';
import { Room } from './mapGenerator/generateDungeon';
import { serverConfig } from '../serverConfig';

const MAPS_DIR = serverConfig.dbFiles.maps;

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
};
