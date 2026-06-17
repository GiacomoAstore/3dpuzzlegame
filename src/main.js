/**
 * @file main.js
 * @description Entry point for the application.
 */

import { Engine, Color3 } from '@babylonjs/core';
import { EventBus } from './core/EventBus.js';
import { InputManager } from './core/InputManager.js';
import { SceneManager } from './core/SceneManager.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { LevelLoader } from './levels/LevelLoader.js';
import { HUD } from './ui/HUD.js';
import { MainMenu } from './ui/MainMenu.js';
import { PauseMenu } from './ui/PauseMenu.js';
import { GAME_STATES, EVENTS } from './utils/Constants.js';

class Game {
    /** @type {Engine} */ #engine;
    /** @type {SceneManager} */ #sceneManager;
    /** @type {InputManager} */ #inputManager;
    /** @type {EventBus} */ #eventBus;
    /** @type {AssetLoader} */ #assetLoader;
    /** @type {LevelLoader} */ #levelLoader;
    /** @type {HUD} */ #hud;
    /** @type {MainMenu} */ #mainMenu;
    /** @type {PauseMenu} */ #pauseMenu;

    #currentState = GAME_STATES.LOADING;
    #currentLevelIndex = 1;
    #levels = ['src/levels/level01.json', 'src/levels/level02.json', 'src/levels/level03.json'];

    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);
        this.#engine = new Engine(canvas, true);
        this.#eventBus = new EventBus();
        this.#inputManager = new InputManager(canvas);
        this.#sceneManager = new SceneManager(this.#engine);
        this.#assetLoader = new AssetLoader();

        // UI
        this.#hud = new HUD(this.#eventBus);
        this.#mainMenu = new MainMenu(() => this.startGame());
        this.#pauseMenu = new PauseMenu(this.#eventBus, () => this.resumeGame());

        window.addEventListener('resize', () => this.#engine.resize());

        // Global key handlers
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.#currentState === GAME_STATES.PLAYING) {
                    this.pauseGame();
                } else if (this.#currentState === GAME_STATES.PAUSED) {
                    this.resumeGame();
                }
            } else if (e.code === 'KeyR' && this.#currentState === GAME_STATES.PLAYING) {
                this.loadLevel(this.#currentLevelIndex); // Reset level
            }
        });

        this.#setupEvents();
    }

    #setupEvents() {
        this.#eventBus.on(EVENTS.LEVEL_COMPLETE, () => {
            this.#currentLevelIndex++;
            if (this.#currentLevelIndex > this.#levels.length) {
                // Game complete
                this.#currentState = GAME_STATES.GAME_OVER;
                console.log("Game Complete!");
                this.#mainMenu.show();
                this.#hud.showCrosshair(false);
                document.exitPointerLock();
            } else {
                this.loadLevel(this.#currentLevelIndex);
            }
        });
    }

    async init() {
        this.#sceneManager.createScene(); // Create initial empty scene
        this.#levelLoader = new LevelLoader(this.#sceneManager.scene, this.#eventBus, this.#inputManager);
        this.#currentState = GAME_STATES.MENU;
        this.#mainMenu.show();

        this.#engine.runRenderLoop(() => {
            if (this.#currentState === GAME_STATES.PLAYING && this.#levelLoader) {
                this.#levelLoader.update(this.#engine.getDeltaTime() / 1000);
            }
            if (this.#sceneManager.scene) {
                this.#sceneManager.scene.render();
            }
        });
    }

    async startGame() {
        this.#currentLevelIndex = 1;
        await this.loadLevel(this.#currentLevelIndex);
        this.#currentState = GAME_STATES.PLAYING;
        this.#hud.showCrosshair(true);
        this.#engine.getRenderingCanvas().requestPointerLock();
    }

    pauseGame() {
        this.#currentState = GAME_STATES.PAUSED;
        this.#eventBus.emit(EVENTS.GAME_PAUSE);
        this.#hud.showCrosshair(false);
        document.exitPointerLock();
    }

    resumeGame() {
        this.#currentState = GAME_STATES.PLAYING;
        this.#eventBus.emit(EVENTS.GAME_RESUME);
        this.#hud.showCrosshair(true);
        this.#engine.getRenderingCanvas().requestPointerLock();
    }

    async loadLevel(index) {
        this.#currentState = GAME_STATES.LOADING;

        if (this.#levelLoader) {
            this.#levelLoader.dispose();
        }

        this.#sceneManager.createScene(); // Reset scene
        // Add fog
        this.#sceneManager.scene.fogMode = 2; // EXP2
        this.#sceneManager.scene.fogColor = new Color3(0, 0, 0);
        this.#sceneManager.scene.fogDensity = 0.04;

        this.#levelLoader = new LevelLoader(this.#sceneManager.scene, this.#eventBus, this.#inputManager);
        await this.#levelLoader.loadLevel(this.#levels[index - 1]);
        this.#currentState = GAME_STATES.PLAYING;
    }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game('renderCanvas');
    game.init();
});