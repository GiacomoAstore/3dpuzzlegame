/**
 * @file PauseMenu.js
 * @description Pause menu UI.
 */

import { EVENTS } from '../utils/Constants.js';

export class PauseMenu {
    /** @type {HTMLElement} */ #container;
    /** @type {import('../core/EventBus.js').EventBus} */ #eventBus;

    constructor(eventBus, onResume) {
        this.#eventBus = eventBus;
        this.#container = document.createElement('div');
        this.#container.id = 'pause-menu';
        document.getElementById('ui-layer').appendChild(this.#container);
        this.#initDOM(onResume);

        this.#eventBus.on(EVENTS.GAME_PAUSE, () => this.show());
        this.#eventBus.on(EVENTS.GAME_RESUME, () => this.hide());
    }

    #initDOM(onResume) {
        this.#container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
            display: none; flex-direction: column; justify-content: center; align-items: center;
            pointer-events: auto; z-index: 20;
        `;

        this.#container.innerHTML = `
            <h2 style="font-size: 48px; margin-bottom: 30px;">IN PAUSA</h2>
            <button id="btn-resume" style="padding: 10px 30px; font-size: 20px; font-family: 'Orbitron', sans-serif; background: transparent; color: #fff; border: 2px solid #fff; cursor: pointer;">RIPRENDI</button>
        `;

        document.getElementById('btn-resume').addEventListener('click', () => {
            if (onResume) onResume();
        });
    }

    show() {
        this.#container.style.display = 'flex';
    }

    hide() {
        this.#container.style.display = 'none';
    }
}