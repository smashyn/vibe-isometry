import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

export const serverConfig = {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    wsMaxMessageSize: 32 * 1024, // 32 KB
    tokenLifeTime: 24 * 60 * 60 * 1000, // 24 години
    roomsListOnConnect: true, // надсилати список кімнат при підключенні
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS',
        headers: process.env.CORS_HEADERS || 'Content-Type, Authorization',
    },
    gracefulShutdownTimeout: process.env.GRACEFUL_SHUTDOWN_TIMEOUT
        ? Number(process.env.GRACEFUL_SHUTDOWN_TIMEOUT)
        : 5000, // ms
    hashSalt: process.env.HASH_SALT || 'default_salt',
    dbFiles: {
        users: path.join(__dirname, './gameData/users.json'),
        rooms: path.join(__dirname, './gameData/rooms.json'),
        maps: path.join(__dirname, './gameData/maps'),
    },
};
