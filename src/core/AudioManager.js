/**
 * @file AudioManager.js
 * @description Manages all audio playback.
 */

import { AssetLoader } from '../utils/AssetLoader.js';

export class AudioManager {
    /** @type {AssetLoader} */
    #assetLoader;

    /**
     * @param {AssetLoader} assetLoader
     */
    constructor(assetLoader) {
        this.#assetLoader = assetLoader;
    }

    /**
     * Init sounds for a given scene.
     * @param {import('@babylonjs/core').Scene} scene
     * @param {object} urls Map of ID to URL
     */
    async initSounds(scene, urls) {
        const promises = [];
        for (const [id, url] of Object.entries(urls)) {
            promises.push(this.#assetLoader.loadSound(id, url, scene));
        }
        await Promise.all(promises);
    }

    /**
     * Plays a sound by its ID.
     * @param {string} soundId
     */
    playSound(soundId) {
        // We bypass the AssetLoader getSound here for simplicity and assume it's attached via global reference or custom HTMLAudioElement
        // However, if we loaded it via Babylon Sound in AssetLoader:
        const sound = this.#assetLoader.getSound ? this.#assetLoader.getSound(soundId) : null;
        if (sound) {
            sound.play();
        } else {
            console.log(`[Audio] Playing (simulated or not loaded): ${soundId}`);
        }
    }
}