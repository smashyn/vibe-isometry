import { randomUUID } from 'crypto';

export type CharacterData = {
    id: string;
    name: string;
    class: string;
    x: number;
    y: number;
    direction: string;
    isMoving?: boolean;
    isAttacking?: boolean;
    isRunAttacking?: boolean;
    isDead?: boolean;
    isHurt?: boolean;
    hurtUntil?: number;
    deathDirection?: string;
};

export type UserData = {
    id: string;
    username: string;
    token?: string;
    characters: CharacterData[];
    activeCharacterId?: string;
    activeRoom?: string; // <-- Додаємо activeRoom
};

export class PlayerManager {
    users = new Map<string, UserData>();

    /**
     * Додає нового користувача (якщо ще не існує)
     */
    addUser(username: string, token?: string) {
        if (!this.users.has(username)) {
            const id = randomUUID();
            this.users.set(username, { id, username, token, characters: [] });
        } else if (token) {
            // Оновлюємо токен, якщо користувач вже існує
            const user = this.users.get(username)!;
            user.token = token;
        }
    }

    /**
     * Додає персонажа користувачу
     */
    addCharacter(username: string, character: Omit<CharacterData, 'id'>) {
        this.addUser(username);
        const user = this.users.get(username)!;
        const newChar: CharacterData = { ...character, id: randomUUID() };
        user.characters.push(newChar);
        // Якщо це перший персонаж — робимо його активним
        if (!user.activeCharacterId) user.activeCharacterId = newChar.id;
        return newChar;
    }

    /**
     * Встановлює активного персонажа для користувача
     */
    setActiveCharacter(username: string, characterId: string) {
        const user = this.users.get(username);
        if (user && user.characters.some((c) => c.id === characterId)) {
            user.activeCharacterId = characterId;
            return true;
        }
        return false;
    }

    /**
     * Встановлює активну кімнату для користувача
     */
    setActiveRoom(username: string, roomId: string) {
        const user = this.users.get(username);
        if (user) {
            user.activeRoom = roomId;
            return true;
        }
        return false;
    }

    /**
     * Повертає активного персонажа користувача
     */
    getActiveCharacter(username: string): CharacterData | undefined {
        const user = this.users.get(username);
        if (!user || !user.activeCharacterId) return undefined;
        return user.characters.find((c) => c.id === user.activeCharacterId);
    }

    /**
     * Оновлює дані активного персонажа користувача
     */
    updateActiveCharacter(username: string, data: Partial<CharacterData>) {
        const char = this.getActiveCharacter(username);
        if (char) Object.assign(char, data);
    }

    /**
     * Видаляє персонажа користувача
     */
    removeCharacter(username: string, characterId: string) {
        const user = this.users.get(username);
        if (!user) return false;
        user.characters = user.characters.filter((c) => c.id !== characterId);
        if (user.activeCharacterId === characterId) {
            user.activeCharacterId = user.characters[0]?.id;
        }
        return true;
    }

    /**
     * Видаляє користувача (наприклад, при дисконекті)
     */
    removeUser(username: string) {
        this.users.delete(username);
    }

    /**
     * Повертає всіх користувачів
     */
    getAllUsers(): UserData[] {
        return Array.from(this.users.values());
    }

    /**
     * Повертає всіх персонажів (усіх користувачів)
     */
    getAllCharacters(): CharacterData[] {
        return Array.from(this.users.values()).flatMap((u) => u.characters);
    }
}
