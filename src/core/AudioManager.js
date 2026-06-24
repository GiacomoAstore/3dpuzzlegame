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
     * @param {boolean} loop
     */
    playSound(soundId, loop = false) {
        const sound = this.#assetLoader.getSound ? this.#assetLoader.getSound(soundId) : null;
        if (sound) {
            sound.loop = loop;
            if (soundId === 'BGM') {
                sound.setVolume(0.3); // Lower volume for background music
            }
            sound.play();
        } else {
            console.log(`[Audio] Playing (simulated or not loaded): ${soundId}`);
        }
    }
}