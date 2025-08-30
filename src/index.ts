import { Engine } from './engine/index.js';
import { MenuScene } from './scenes/MenuScene.js';
import { MapLobby } from './scenes/MapLobby.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { MainScene } from './scenes/mainScene.js';
import { GameSocket } from './net/GameSocket.js';
import { LoginScene } from './scenes/LoginScene.js';
import { RegisterScene } from './scenes/RegisterScene.js';

const engine = new Engine('game-canvas');
const gameSocket = new GameSocket('ws://localhost:3000');

let loginScene: LoginScene;
let menuScene: MenuScene;
let mapLobby: MapLobby;
let settingsScene: SettingsScene;
let mainScene: MainScene;
let registerScene: RegisterScene;

function goToMenu() {
    engine.setScene(menuScene);
}
function goToMapLobby() {
    engine.setScene(mapLobby);
}
function goToSettings() {
    engine.setScene(settingsScene);
}
function startGame(mapName: string) {
    mainScene = new MainScene(gameSocket, mapName, goToMapLobby);
    engine.setScene(mainScene);
}

// Додаємо сцену логіна
function onLoginSuccess(username: string, token: string) {
    // Можна зберегти токен у GameSocket або глобально
    (gameSocket as any).token = token;
    menuScene = new MenuScene(goToMapLobby, goToSettings);
    mapLobby = new MapLobby(startGame, gameSocket, goToMenu);
    settingsScene = new SettingsScene(goToMenu);
    engine.setScene(menuScene);
}

// Додаємо функцію для переходу на реєстрацію
function goToRegister() {
    registerScene = new RegisterScene(onRegisterSuccess);
    engine.setScene(registerScene);
}

// Після успішної реєстрації можна одразу логінити:
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
