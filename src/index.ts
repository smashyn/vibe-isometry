import { Engine } from './engine/index.js';
// import { MenuScene } from './scenes/MenuScene.js';
// import { MapLobby } from './scenes/MapLobby.js';
// import { SettingsScene } from './scenes/SettingsScene.js';
// import { MainScene } from './scenes/mainScene.js';
import { GameSocket } from './net/GameSocket.js';
import { LoginScene } from './scenes/LoginScene.js';
import { RegisterScene } from './scenes/RegisterScene.js';
import { RoomsListScene } from './scenes/RoomsListScene.js'; // Додаємо імпорт

const engine = new Engine('game-canvas');
const gameSocket = new GameSocket('ws://localhost:3000');

let loginScene: LoginScene;
// let menuScene: MenuScene;
// let mapLobby: MapLobby;
// let settingsScene: SettingsScene;
// let mainScene: MainScene;
let registerScene: RegisterScene;
let roomsListScene: RoomsListScene; // Додаємо змінну

// function goToMenu() {
//     engine.setScene(menuScene);
// }
// function goToMapLobby() {
//     engine.setScene(mapLobby);
// }
// function goToSettings() {
//     engine.setScene(settingsScene);
// }
// function startGame(mapName: string) {
//     mainScene = new MainScene(gameSocket, mapName, goToMapLobby);
//     engine.setScene(mainScene);
// }

function onLoginSuccess(username: string, token: string) {
    (gameSocket as any).token = token;
    roomsListScene = new RoomsListScene(gameSocket, (roomId: string) => {});
    engine.setScene(roomsListScene);
}

function goToRegister() {
    registerScene = new RegisterScene(onRegisterSuccess);
    engine.setScene(registerScene);
}

function onRegisterSuccess(username: string, password: string) {
    loginScene = new LoginScene(onLoginSuccess, goToRegister, username, password);
    engine.setScene(loginScene);
}

loginScene = new LoginScene(onLoginSuccess, goToRegister);
engine.setScene(loginScene);

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
