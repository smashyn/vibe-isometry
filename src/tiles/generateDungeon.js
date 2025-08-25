"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDungeon = generateDungeon;
// Тепер повертає і карту, і масив кімнат
function generateDungeon(width, height, roomCount, minRoomSize, maxRoomSize) {
    if (roomCount === void 0) { roomCount = 6; }
    if (minRoomSize === void 0) { minRoomSize = 4; }
    if (maxRoomSize === void 0) { maxRoomSize = 8; }
    var map = Array.from({ length: height }, function () {
        return Array.from({ length: width }, function () { return 'stone'; });
    });
    var rooms = [];
    for (var i = 0; i < roomCount; i++) {
        var w = randInt(minRoomSize, maxRoomSize);
        var h = randInt(minRoomSize, maxRoomSize);
        var x = randInt(1, width - w - 1);
        var y = randInt(1, height - h - 1);
        var newRoom = { x: x, y: y, w: w, h: h };
        var overlaps = false;
        for (var _i = 0, rooms_1 = rooms; _i < rooms_1.length; _i++) {
            var room = rooms_1[_i];
            if (x < room.x + room.w + 1 &&
                x + w + 1 > room.x &&
                y < room.y + room.h + 1 &&
                y + h + 1 > room.y) {
                overlaps = true;
                break;
            }
        }
        if (!overlaps) {
            rooms.push(newRoom);
            for (var rx = x; rx < x + w; rx++) {
                for (var ry = y; ry < y + h; ry++) {
                    map[ry][rx] = 'earth';
                }
            }
        }
    }
    for (var i = 1; i < rooms.length; i++) {
        var prev = rooms[i - 1];
        var curr = rooms[i];
        var prevCenter = {
            x: Math.floor(prev.x + prev.w / 2),
            y: Math.floor(prev.y + prev.h / 2),
        };
        var currCenter = {
            x: Math.floor(curr.x + curr.w / 2),
            y: Math.floor(curr.y + curr.h / 2),
        };
        var x = prevCenter.x;
        var y = prevCenter.y;
        while (x !== currCenter.x) {
            map[y][x] = 'earth';
            x += x < currCenter.x ? 1 : -1;
        }
        while (y !== currCenter.y) {
            map[y][x] = 'earth';
            y += y < currCenter.y ? 1 : -1;
        }
        map[y][x] = 'earth';
    }
    for (var _a = 0, rooms_2 = rooms; _a < rooms_2.length; _a++) {
        var room = rooms_2[_a];
        for (var i = 0; i < Math.floor((room.w * room.h) / 4); i++) {
            var rx = randInt(room.x, room.x + room.w - 1);
            var ry = randInt(room.y, room.y + room.h - 1);
            if (map[ry][rx] === 'earth') {
                map[ry][rx] = 'grass';
            }
        }
    }
    return { map: map, rooms: rooms };
}
function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}
