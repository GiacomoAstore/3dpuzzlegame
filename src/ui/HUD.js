/**
 * @file HUD.js
 * @description Heads-Up Display using DOM overlay.
 */

import { EVENTS } from '../utils/Constants.js';

export class HUD {
    /** @type {HTMLElement} */ #container;
    /** @type {import('../core/EventBus.js').EventBus} */ #eventBus;

    constructor(eventBus) {
        this.#eventBus = eventBus;
        this.#container = document.getElementById('hud-container');
        this.#initDOM();
        this.#setupListeners();
    }

    #initDOM() {
        this.#container.innerHTML = `
            <div style="position: absolute; top: 20px; left: 20px; font-size: 24px; text-shadow: 2px 2px 4px #000;">
                <span id="hud-crystals">💎 0/0</span>
            </div>
            <div id="hud-prompt" style="position: absolute; bottom: 50px; width: 100%; text-align: center; font-size: 20px; display: none;">
                Premi <span style="background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 5px;">E</span> per interagire
            </div>
        `;
    }

    #setupListeners() {
        this.onUpdateCrystals = (data) => {
            document.getElementById('hud-crystals').innerText = `💎 ${data.collected}/${data.total}`;
        };

        this.onShowPrompt = (show) => {
            document.getElementById('hud-prompt').style.display = show ? 'block' : 'none';
        };

        this.#eventBus.on('HUD_UPDATE_CRYSTALS', this.onUpdateCrystals);
        this.#eventBus.on('SHOW_INTERACT_PROMPT', this.onShowPrompt);
    }

    showCrosshair(show) {
        document.getElementById('crosshair').style.display = show ? 'block' : 'none';
    }

    dispose() {
        this.#eventBus.off('HUD_UPDATE_CRYSTALS', this.onUpdateCrystals);
        this.#eventBus.off('SHOW_INTERACT_PROMPT', this.onShowPrompt);
        this.#container.innerHTML = '';
    }
}