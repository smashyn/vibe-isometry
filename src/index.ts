import { sceneManager } from './SceneManager.js';
import { LoginScene } from './scenes/auth/LoginScene.js';
import { RegisterScene } from './scenes/auth/RegisterScene.js';
import { RestorePasswordScene } from './scenes/auth/RestorePasswordScene.js';
import { RoomsListScene } from './scenes/room/RoomsListScene.js';

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

// default scene activation
sceneManager.setScene(loginScene);
