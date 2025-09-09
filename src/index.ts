import { sceneManager } from './SceneManager.js';
import { LoginScene } from './scenes/auth/LoginScene.js';
import { RegisterScene } from './scenes/auth/RegisterScene.js';
import { RestorePasswordScene } from './scenes/auth/RestorePasswordScene.js';
import { RoomsListScene } from './scenes/room/RoomsListScene.js';
import { RestorePasswordConfirmScene } from './scenes/auth/RestorePasswordConfirmScene.js';
import { getQueryParam, removeQueryParam } from './utils/queryParams.js';
import { RoomDetailsScene } from './scenes/room/RoomDetailsScene.js';
import { MainScene } from './scenes/game/MainScene.js';

let loginScene: LoginScene = new LoginScene(onLoginSuccess, goToRegister, goToRestoreScene);
const registerScene: RegisterScene = new RegisterScene(onRegisterSuccess, goToLogin);
const restorePasswordScene = new RestorePasswordScene(onRestoreSuccess, goToLogin);
const roomsListScene: RoomsListScene = new RoomsListScene();

// go to scenes
function goToLogin() {
    sceneManager.setScene(loginScene);
}

function goToRegister() {
    sceneManager.setScene(registerScene);
}

function goToRestoreScene() {
    sceneManager.setScene(restorePasswordScene);
}

// on success handlers
function onLoginSuccess() {
    sceneManager.setScene(roomsListScene);
}

function onRestoreSuccess() {
    sceneManager.setScene(loginScene);
}

function onRegisterSuccess(username: string, password: string) {
    loginScene = new LoginScene(onLoginSuccess, goToRegister, goToRestoreScene, username, password);
    sceneManager.setScene(loginScene);
}

// --- Додаємо перевірку restoreToken у query ---
const restoreToken = getQueryParam('restoreToken');
if (restoreToken) {
    removeQueryParam('restoreToken');
    sceneManager.setScene(
        new RestorePasswordConfirmScene(restoreToken, () => {
            sceneManager.setScene(loginScene);
        }),
    );
} else {
    // default scene activation
    sceneManager.setScene(loginScene);
}

// rules

sceneManager.gameSocket.onType('error', (data) => {
    console.error('WebSocket error:', data.message);
});
sceneManager.gameSocket.onType('room', (data) => {
    console.log('WebSocket room event:', data);

    if (data.room.status === 'GAME') {
        // Якщо гра вже почалася, можна одразу перейти в MainScene
        sceneManager.engine.setScene(
            new MainScene(sceneManager.gameSocket.getUsername(), data.room.id),
        );
        return;
    }
    sceneManager.engine.setScene(
        new RoomDetailsScene(data.room, () => {
            sceneManager.engine.setScene(roomsListScene);
        }),
    );
});

sceneManager.gameSocket.onType('game_started', (data) => {
    console.log('Game started in room:', data.roomId);
});
