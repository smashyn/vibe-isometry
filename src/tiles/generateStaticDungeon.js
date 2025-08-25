"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDungeonWithSeed = generateDungeonWithSeed;
var generateDungeon_js_1 = require("./generateDungeon.js");
var fs = require("fs");
// Додаємо підтримку сідованого Math.random
function seededRandom(seed) {
    var x = Math.sin(seed) * 10000;
    return function () {
        x = Math.sin(x) * 10000;
        return x - Math.floor(x);
    };
}
// Патчимо Math.random для стабільної генерації
function generateDungeonWithSeed(width, height, roomCount, minRoomSize, maxRoomSize, seed) {
    var oldRandom = Math.random;
    Math.random = seededRandom(seed);
    var result = (0, generateDungeon_js_1.generateDungeon)(width, height, roomCount, minRoomSize, maxRoomSize);
    Math.random = oldRandom;
    return result;
}
// Генеруємо підземелля з 20 кімнатами та сидом 12345
var _a = generateDungeonWithSeed(50, 30, 20, 4, 8, 12345), map = _a.map, rooms = _a.rooms;
// Готуємо дані для збереження
var dungeonMapString = JSON.stringify(map, null, 2);
var roomsString = JSON.stringify(rooms, null, 2);
var fileContent = "import { TileType, Room } from './generateDungeon.js';\n\nexport const STATIC_DUNGEON_WIDTH = 50;\nexport const STATIC_DUNGEON_HEIGHT = 30;\n\nexport const STATIC_DUNGEON_MAP: TileType[][] = ".concat(dungeonMapString, ";\n\nexport const STATIC_DUNGEON_ROOMS: Room[] = ").concat(roomsString, ";\n");
fs.writeFileSync('src/tiles/staticDungeon.ts', fileContent, 'utf-8');
console.log('Static dungeon generated and saved to src/tiles/staticDungeon.ts');
