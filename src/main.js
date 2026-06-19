/**
 * @file main.js
 * @description Entry point for the application.
 */

import { Engine, Color3 } from '@babylonjs/core';
import { EventBus } from './core/EventBus.js';
import { InputManager } from './core/InputManager.js';
import { SceneManager } from './core/SceneManager.js';
import { AudioManager } from './core/AudioManager.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { LevelLoader } from './levels/LevelLoader.js';
import { HUD } from './ui/HUD.js';
import { MainMenu } from './ui/MainMenu.js';
import { PauseMenu } from './ui/PauseMenu.js';
import { GAME_STATES, EVENTS, AUDIO_URLS } from './utils/Constants.js';

class Game {
    /** @type {Engine} */ #engine;
    /** @type {SceneManager} */ #sceneManager;
    /** @type {InputManager} */ #inputManager;
    /** @type {EventBus} */ #eventBus;
    /** @type {AssetLoader} */ #assetLoader;
    /** @type {AudioManager} */ #audioManager;
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
        this.#audioManager = new AudioManager(this.#assetLoader);

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
        this.#eventBus.on(EVENTS.PUZZLE_BLOCK_PLACED, () => this.#audioManager.playSound('BLOCK_TARGET'));
        this.#eventBus.on(EVENTS.CRYSTAL_COLLECTED, () => this.#audioManager.playSound('CRYSTAL_COLLECT'));
        this.#eventBus.on(EVENTS.DOOR_OPEN, () => this.#audioManager.playSound('DOOR_OPEN'));
        this.#eventBus.on(EVENTS.PLAYER_MOVE, () => this.#audioManager.playSound('FOOTSTEP'));

        this.#eventBus.on(EVENTS.LEVEL_COMPLETE, () => {
            this.#currentLevelIndex++;
            if (this.#currentLevelIndex > this.#levels.length) {
                // Game complete
                this.#currentState = GAME_STATES.GAME_OVER;
                console.log("Game Complete!");
                this.#mainMenu.show("Hai Vinto!");
                this.#hud.showCrosshair(false);
                document.exitPointerLock();
            } else {
                this.loadLevel(this.#currentLevelIndex);
            }
        });
    }

    async init() {
        const scene = this.#sceneManager.createScene(); // Create initial empty scene
        await this.#audioManager.initSounds(scene, AUDIO_URLS);

        this.#levelLoader = new LevelLoader(scene, this.#eventBus, this.#inputManager);
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

        const scene = this.#sceneManager.createScene(); // Reset scene
        // Add fog
        scene.fogMode = 2; // EXP2
        scene.fogColor = new Color3(0, 0, 0);
        scene.fogDensity = 0.04;

        // Re-init audio on the new scene
        await this.#audioManager.initSounds(scene, AUDIO_URLS);

        this.#levelLoader = new LevelLoader(scene, this.#eventBus, this.#inputManager);
        await this.#levelLoader.loadLevel(this.#levels[index - 1]);
        this.#currentState = GAME_STATES.PLAYING;
    }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game('renderCanvas');
    game.init();
});