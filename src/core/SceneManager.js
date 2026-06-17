/**
 * @file SceneManager.js
 * @description Manages Babylon.js scenes.
 */

import { Scene, Color3, Color4, HemisphericLight, Vector3, FreeCamera } from '@babylonjs/core';

export class SceneManager {
    /** @type {import('@babylonjs/core').Engine} */
    #engine;
    /** @type {Scene} */
    #currentScene;
    /** @type {FreeCamera} */
    #ambientCamera;

    /**
     * @param {import('@babylonjs/core').Engine} engine
     */
    constructor(engine) {
        this.#engine = engine;
    }

    /**
     * Creates and returns a new empty scene configured for the game.
     * @returns {Scene}
     */
    createScene() {
        if (this.#currentScene) {
            this.#currentScene.dispose();
        }

        const scene = new Scene(this.#engine);
        scene.clearColor = new Color4(0.05, 0.05, 0.05, 1);
        scene.collisionsEnabled = true;

        // Basic ambient light
        const light = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene);
        light.intensity = 0.2;
        light.groundColor = new Color3(0.1, 0.1, 0.1);

        // Persistent ambient camera (needed so scene can render even before player is created)
        this.#ambientCamera = new FreeCamera("ambientCamera", new Vector3(0, 5, -10), scene);
        this.#ambientCamera.setTarget(Vector3.Zero());
        this.#ambientCamera.minZ = 0.1;
        this.#ambientCamera.maxZ = 1000;

        // Make this the active camera initially
        scene.activeCamera = this.#ambientCamera;

        this.#currentScene = scene;
        return scene;
    }

    get scene() {
        return this.#currentScene;
    }
}