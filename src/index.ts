import { Engine } from './engine/index.js';
import { MenuScene } from './scenes/MenuScene.js';
import { MapLobby } from './scenes/MapLobby.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { MainScene } from './scenes/mainScene.js';
import { GameSocket } from './net/GameSocket.js';

const engine = new Engine('game-canvas');

// --- Створюємо один екземпляр GameSocket ---
const gameSocket = new GameSocket('ws://localhost:3000');

let menuScene: MenuScene;
let mapLobby: MapLobby;
let settingsScene: SettingsScene;
let mainScene: MainScene;

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
    mainScene = new MainScene(gameSocket, mapName, goToMapLobby); // Передаємо gameSocket у MainScene
    engine.setScene(mainScene);
}

// Передаємо gameSocket у всі сцени, яким потрібен доступ до серверу
menuScene = new MenuScene(goToMapLobby, goToSettings);
mapLobby = new MapLobby(startGame, gameSocket, goToMenu);
settingsScene = new SettingsScene(goToMenu);

engine.setScene(menuScene);

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

function resizeCanvas() {
    // Встановлюємо розміри canvas відповідно до розміру вікна
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Викликаємо одразу при старті
