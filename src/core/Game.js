/**
 * @file Game.js
 * @description Main game class.
 */

import { Engine } from '@babylonjs/core';
import { EventBus } from './EventBus.js';
import { InputManager } from './InputManager.js';
import { SceneManager } from './SceneManager.js';
import { AudioManager } from './AudioManager.js';
import { AssetLoader } from '../utils/AssetLoader.js';
import { GAME_STATES, EVENTS } from '../utils/Constants.js';
// We'll import LevelLoader and UI components later.

export class Game {
    /** @type {Engine} */ #engine;
    /** @type {SceneManager} */ #sceneManager;
    /** @type {InputManager} */ #inputManager;
    /** @type {AudioManager} */ #audioManager;
    /** @type {EventBus} */ #eventBus;
    /** @type {AssetLoader} */ #assetLoader;
    /** @type {boolean} */ #isRunning = false;
    /** @type {string} */ #currentState = GAME_STATES.LOADING;

    /**
     * @param {string} canvasId
     */
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);
        this.#engine = new Engine(canvas, true);
        this.#eventBus = new EventBus();
        this.#inputManager = new InputManager(canvas);
        this.#sceneManager = new SceneManager(this.#engine);
        this.#assetLoader = new AssetLoader();
        this.#audioManager = new AudioManager(this.#assetLoader);

        window.addEventListener('resize', () => {
            this.#engine.resize();
        });
    }

    async init() {
        // Load global assets here
        console.log('[Game] Initialized');
        this.#currentState = GAME_STATES.MENU;
        // In a full implementation, we'd load the first level and UI here.

        // Setup initial dummy scene so engine doesn't complain
        this.#sceneManager.createScene();
    }

    start() {
        if (this.#isRunning) return;
        this.#isRunning = true;

        this.#engine.runRenderLoop(() => {
            if (this.#currentState === GAME_STATES.PLAYING) {
                // Update logic
            }
            if (this.#sceneManager.scene) {
                this.#sceneManager.scene.render();
            }
        });
    }

    pause() {
        this.#currentState = GAME_STATES.PAUSED;
        this.#eventBus.emit(EVENTS.GAME_PAUSE);
    }

    resume() {
        this.#currentState = GAME_STATES.PLAYING;
        this.#eventBus.emit(EVENTS.GAME_RESUME);
    }

    dispose() {
        this.#engine.dispose();
    }
}