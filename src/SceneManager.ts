import { Engine } from './engine/index.js';
import { GameSocket } from './net/GameSocket.js';

class SceneManager {
    private static _instance: SceneManager;
    public engine: Engine;
    public gameSocket: GameSocket;

    private constructor() {
        this.engine = new Engine('game-canvas');
        this.gameSocket = new GameSocket('ws://localhost:3000');
    }

    static get instance(): SceneManager {
        if (!SceneManager._instance) {
            SceneManager._instance = new SceneManager();
        }
        return SceneManager._instance;
    }

    setScene(scene: any) {
        this.engine.setScene(scene);
    }
}

export const sceneManager = SceneManager.instance;
