import { Engine } from './engine/index.js';
import { GameSocket } from './net/GameSocket.js';
import { LoginScene } from './scenes/auth/LoginScene.js';
import { RegisterScene } from './scenes/auth/RegisterScene.js';
import { RestorePasswordScene } from './scenes/auth/RestorePasswordScene.js';
import { RoomsListScene } from './scenes/room/RoomsListScene.js';

const engine = new Engine('game-canvas');
const gameSocket = new GameSocket('ws://localhost:3000');

let loginScene: LoginScene = new LoginScene(onLoginSuccess, goToRegister, goToRestoreScene);
const registerScene: RegisterScene = new RegisterScene(onRegisterSuccess, goToLogin);
const restorePasswordScene = new RestorePasswordScene(onRestoreSuccess, goToLogin);
const roomsListScene: RoomsListScene = new RoomsListScene(gameSocket, (roomId: string) => {});

// go to scenes
function goToLogin() {
    engine.setScene(loginScene);
}

function goToRegister() {
    engine.setScene(registerScene);
}

function goToRestoreScene() {
    engine.setScene(restorePasswordScene);
}

// on success handlers
function onLoginSuccess(username: string, token: string) {
    (gameSocket as any).token = token;
    engine.setScene(roomsListScene);
}

function onRestoreSuccess() {
    engine.setScene(loginScene);
}

function onRegisterSuccess(username: string, password: string) {
    loginScene = new LoginScene(onLoginSuccess, goToRegister, goToRestoreScene, username, password);
    engine.setScene(loginScene);
}

// default scene activation
engine.setScene(loginScene);
