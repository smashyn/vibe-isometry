import { Engine } from './engine/index.js';
import { MenuScene } from './scenes/MenuScene.js';
import { ConnectScene } from './scenes/ConnectScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { MainScene } from './scenes/mainScene.js';

const engine = new Engine('game-canvas');

let menuScene: MenuScene;
let connectScene: ConnectScene;
let settingsScene: SettingsScene;
let mainScene: MainScene;

function goToMenu() {
    engine.setScene(menuScene);
}
function goToConnect() {
    engine.setScene(connectScene);
}
function goToSettings() {
    engine.setScene(settingsScene);
}
function startGame() {
    mainScene = new MainScene();
    engine.setScene(mainScene);
}

menuScene = new MenuScene(goToConnect, goToSettings);
connectScene = new ConnectScene(startGame);
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
