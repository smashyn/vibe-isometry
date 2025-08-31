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
    email: string;
    token?: string;
    characters: CharacterData[];
    activeCharacterId?: string;
    activeRoom?: string;
};
