/**
 * @file AssetLoader.js
 * @description Handles loading of textures, models, and sounds.
 */

import { SceneLoader, Texture, Sound, AssetContainer } from '@babylonjs/core';
import '@babylonjs/loaders'; // Ensure loaders like GLTF are available
import { TEXTURE_URLS } from './Constants.js';

export class AssetLoader {
    /** @type {Map<string, Texture>} */
    #textures = new Map();
    /** @type {Map<string, AssetContainer>} */
    #models = new Map();
    /** @type {Map<string, Sound>} */
    #sounds = new Map();

    /**
     * Loads a texture from URL.
     * @param {string} id
     * @param {string} url
     * @param {import('@babylonjs/core').Scene} scene
     * @returns {Promise<Texture>}
     */
    async loadTexture(id, url, scene) {
        return new Promise((resolve, reject) => {
            if (this.#textures.has(id)) {
                resolve(this.#textures.get(id));
                return;
            }
            const texture = new Texture(url, scene, undefined, undefined, undefined, () => {
                this.#textures.set(id, texture);
                resolve(texture);
            }, (message, exception) => {
                console.error(`Failed to load texture ${url}`, exception);
                reject(exception);
            });
        });
    }

    /**
     * Loads a 3D model into an AssetContainer.
     * @param {string} id
     * @param {string} rootUrl
     * @param {string} fileName
     * @param {import('@babylonjs/core').Scene} scene
     * @returns {Promise<AssetContainer>}
     */
    async loadModel(id, rootUrl, fileName, scene) {
        if (this.#models.has(id)) {
            return this.#models.get(id);
        }
        try {
            const container = await SceneLoader.LoadAssetContainerAsync(rootUrl, fileName, scene);
            this.#models.set(id, container);
            return container;
        } catch (error) {
            console.error(`Failed to load model ${rootUrl}${fileName}`, error);
            throw error;
        }
    }

    /**
     * Loads a sound.
     * @param {string} id
     * @param {string} url
     * @param {import('@babylonjs/core').Scene} scene
     * @returns {Promise<Sound>}
     */
    async loadSound(id, url, scene) {
        return new Promise((resolve, reject) => {
            if (this.#sounds.has(id)) {
                // Sound already exists but we might need to recreate it if it belongs to an old disposed scene.
                // We'll dispose the old one and recreate it to ensure it's bound to the new scene.
                this.#sounds.get(id).dispose();
                this.#sounds.delete(id);
            }
            const sound = new Sound(id, url, scene, () => {
                this.#sounds.set(id, sound);
                resolve(sound);
            }, { loop: false, autoplay: false }, (error) => {
                console.warn(`Could not load sound ${url}`, error);
                // Resolve anyway so the game doesn't halt on audio failure
                resolve(null);
            });
        });
    }

    /**
     * Retrieves a loaded texture.
     * @param {string} id
     * @returns {Texture|null}
     */
    getTexture(id) {
        return this.#textures.get(id) || null;
    }

    /**
     * Retrieves a loaded sound.
     * @param {string} id
     * @returns {Sound|null}
     */
    getSound(id) {
        return this.#sounds.get(id) || null;
    }

    /**
     * Disposes all loaded assets.
     */
    dispose() {
        this.#textures.forEach(t => t.dispose());
        this.#textures.clear();
        this.#models.forEach(m => m.dispose());
        this.#models.clear();
        this.#sounds.forEach(s => s.dispose());
        this.#sounds.clear();
    }
}