/**
 * @file EventBus.js
 * @description Lightweight pub/sub system for decoupled communication.
 */

export class EventBus {
    #listeners = new Map();

    /**
     * Subscribe to an event.
     * @param {string} event
     * @param {Function} callback
     */
    on(event, callback) {
        if (!this.#listeners.has(event)) {
            this.#listeners.set(event, []);
        }
        this.#listeners.get(event).push(callback);
    }

    /**
     * Unsubscribe from an event.
     * @param {string} event
     * @param {Function} callback
     */
    off(event, callback) {
        if (!this.#listeners.has(event)) return;
        const callbacks = this.#listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emit an event with optional data.
     * @param {string} event
     * @param {any} data
     */
    emit(event, data = null) {
        if (!this.#listeners.has(event)) return;
        for (const callback of this.#listeners.get(event)) {
            callback(data);
        }
    }
}