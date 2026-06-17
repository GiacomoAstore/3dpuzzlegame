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
     * Plays a sound by its ID.
     * @param {string} soundId
     */
    playSound(soundId) {
        // Implementation will depend on AssetLoader saving sounds by ID
        // Simplified for this scope, you'd retrieve and play the Sound object
        console.log(`[Audio] Playing ${soundId}`);
    }
}