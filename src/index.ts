import { sceneManager } from './SceneManager.js';
import { LoginScene } from './scenes/auth/LoginScene.js';
import { RegisterScene } from './scenes/auth/RegisterScene.js';
import { RestorePasswordScene } from './scenes/auth/RestorePasswordScene.js';
import { RoomsListScene } from './scenes/room/RoomsListScene.js';
import { RestorePasswordConfirmScene } from './scenes/auth/RestorePasswordConfirmScene.js'; // додати імпорт
import { getQueryParam, removeQueryParam } from './utils/queryParams.js';

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
function onLoginSuccess(username: string, token: string) {
    (sceneManager.gameSocket as any).token = token;
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
    removeQueryParam('restoreToken'); // Видаляємо токен з адресного рядка
    sceneManager.setScene(
        new RestorePasswordConfirmScene(restoreToken, () => {
            sceneManager.setScene(loginScene);
        }),
    );
} else {
    // default scene activation
    sceneManager.setScene(loginScene);
}
