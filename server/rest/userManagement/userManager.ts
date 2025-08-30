import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type Character = { name: string; class: string };
type User = {
    username: string;
    password: string;
    characters?: Character[];
    token?: string;
    tokenExpiresAt?: number; // timestamp (ms)
};
const USERS_FILE = path.join(__dirname, '../../gameData/users.json');

const TOKEN_LIFE_TIME = 24 * 60 * 60 * 1000;

function loadUsers(): Record<string, User> {
    if (!fs.existsSync(USERS_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    } catch {
        return {};
    }
}

function saveUsers(users: Record<string, User>) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export const UserManager = {
    register(username: string, password: string): boolean {
        const users = loadUsers();
        if (users[username]) return false;
        users[username] = { username, password, characters: [] };
        saveUsers(users);
        return true;
    },
    /**
     * Аутентифікація користувача.
     * Якщо успішно — повертає { success: true, token }
     * Якщо ні — { success: false }
     */
    authenticate(username: string, password: string): { success: boolean; token?: string } {
        const users = loadUsers();
        const user = users[username];
        if (!!user && user.password === password) {
            // Видаємо новий токен при кожному логіні
            const token = this.issueToken(username);
            return { success: true, token: token! };
        }
        return { success: false };
    },
    // Генерує токен, зберігає його і дату закінчення, повертає токен
    issueToken(username: string, ttlMs: number = TOKEN_LIFE_TIME): string | null {
        const users = loadUsers();
        const user = users[username];
        if (!user) return null;
        const token = generateToken();
        user.token = token;
        user.tokenExpiresAt = Date.now() + ttlMs;
        saveUsers(users);
        return token;
    },
    // Перевіряє токен і його строк дії
    validateToken(token: string): string | null {
        const users = loadUsers();
        for (const username in users) {
            const user = users[username];
            if (user.token === token && user.tokenExpiresAt && user.tokenExpiresAt > Date.now()) {
                return username;
            }
        }
        return null;
    },
    resetPassword(username: string, newPassword: string): boolean {
        const users = loadUsers();
        if (!users[username]) return false;
        users[username].password = newPassword;
        saveUsers(users);
        return true;
    },
    /**
     * Подовжує дію токена для користувача.
     * @param token - токен користувача
     * @param ttlMs - новий час життя (за замовчуванням 24 години)
     * @returns true якщо подовжено, false якщо токен не знайдено або протермінований
     */
    extendToken(token: string, ttlMs: number = TOKEN_LIFE_TIME): boolean {
        const users = loadUsers();
        for (const username in users) {
            const user = users[username];
            if (user.token === token && user.tokenExpiresAt && user.tokenExpiresAt > Date.now()) {
                user.tokenExpiresAt = Date.now() + ttlMs;
                saveUsers(users);
                return true;
            }
        }
        return false;
    },
    exists(username: string): boolean {
        const users = loadUsers();
        return !!users[username];
    },
};
