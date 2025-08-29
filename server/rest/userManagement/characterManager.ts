import fs from 'fs';
import path from 'path';
import type { Character } from './userManager';
import { UserManager } from './userManager';

const USERS_FILE = path.join(__dirname, 'gameData/users.json');

function loadUsers(): Record<string, any> {
    if (!fs.existsSync(USERS_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    } catch {
        return {};
    }
}

function saveUsers(users: Record<string, any>) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export const CharacterManager = {
    /**
     * Додає персонажа користувачу (перевіряє токен)
     */
    createCharacter(token: string, characterName: string, characterClass: string) {
        const username = UserManager.validateToken(token);
        if (!username) return { success: false, error: 'Invalid or expired token' };
        const users = loadUsers();
        const user = users[username];
        if (!user) return { success: false, error: 'User not found' };
        if (!user.characters) user.characters = [];
        if (user.characters.find((c: Character) => c.name === characterName)) {
            return { success: false, error: 'Character with this name already exists' };
        }
        const character = { name: characterName, class: characterClass };
        user.characters.push(character);
        saveUsers(users);
        return { success: true, character };
    },

    /**
     * Оновлює персонажа користувача (перевіряє токен)
     */
    updateCharacter(token: string, characterName: string, newCharacterData: Partial<Character>) {
        const username = UserManager.validateToken(token);
        if (!username) return { success: false, error: 'Invalid or expired token' };
        return this.updateCharacterByUsername(username, characterName, newCharacterData);
    },

    /**
     * Оновлює персонажа користувача за username (без перевірки токена)
     */
    updateCharacterByUsername(
        username: string,
        characterName: string,
        newCharacterData: Partial<Character>,
    ) {
        const users = loadUsers();
        const user = users[username];
        if (!user || !user.characters)
            return { success: false, error: 'User or character not found' };
        const character = user.characters.find((c: Character) => c.name === characterName);
        if (!character) return { success: false, error: 'Character not found' };
        if (newCharacterData.name) {
            if (
                user.characters.some(
                    (c: Character) => c.name === newCharacterData.name && c !== character,
                )
            ) {
                return { success: false, error: 'Character with this name already exists' };
            }
            character.name = newCharacterData.name;
        }
        if (newCharacterData.class) {
            character.class = newCharacterData.class;
        }
        saveUsers(users);
        return { success: true, character };
    },

    /**
     * Видаляє персонажа користувача (перевіряє токен)
     */
    deleteCharacter(token: string, characterName: string) {
        const username = UserManager.validateToken(token);
        if (!username) return { success: false, error: 'Invalid or expired token' };
        return this.deleteCharacterByUsername(username, characterName);
    },

    /**
     * Видаляє персонажа користувача за username (без перевірки токена)
     */
    deleteCharacterByUsername(username: string, characterName: string) {
        const users = loadUsers();
        const user = users[username];
        if (!user || !user.characters)
            return { success: false, error: 'User or character not found' };
        const index = user.characters.findIndex((c: Character) => c.name === characterName);
        if (index === -1) return { success: false, error: 'Character not found' };
        user.characters.splice(index, 1);
        saveUsers(users);
        return { success: true };
    },
};
