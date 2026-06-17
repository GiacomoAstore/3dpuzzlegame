/**
 * @file InputManager.js
 * @description Handles keyboard and mouse input.
 */

export class InputManager {
    /** @type {Set<string>} */
    #keys = new Set();
    /** @type {boolean} */
    #isPointerLocked = false;
    /** @type {HTMLCanvasElement} */
    #canvas;

    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.#canvas = canvas;
        this.#setupListeners();
    }

    #setupListeners() {
        window.addEventListener('keydown', (e) => this.#keys.add(e.code));
        window.addEventListener('keyup', (e) => this.#keys.delete(e.code));

        this.#canvas.addEventListener('click', () => {
            if (!this.#isPointerLocked) {
                this.#canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.#isPointerLocked = document.pointerLockElement === this.#canvas;
        });
    }

    /**
     * Checks if a key is currently pressed.
     * @param {string} code (e.g. 'KeyW')
     * @returns {boolean}
     */
    isKeyDown(code) {
        return this.#keys.has(code);
    }

    get isPointerLocked() {
        return this.#isPointerLocked;
    }
}