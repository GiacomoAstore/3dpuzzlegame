/**
 * @file MainMenu.js
 * @description Main menu UI.
 */

export class MainMenu {
    /** @type {HTMLElement} */ #container;

    constructor(onStartGame) {
        this.#container = document.getElementById('menu-container');
        this.#initDOM(onStartGame);
    }

    #initDOM(onStartGame) {
        this.#container.innerHTML = `
            <div id="main-menu" style="position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; justify-content: center; align-items: center; pointer-events: auto;">
                <h1 style="font-size: 64px; margin-bottom: 50px; color: #fff; text-shadow: 0 0 20px rgba(255,255,255,0.5);">EchoVault</h1>
                <button id="btn-start" style="padding: 15px 40px; font-size: 24px; font-family: 'Orbitron', sans-serif; background: transparent; color: #fff; border: 2px solid #fff; cursor: pointer; transition: all 0.2s;">INIZIA GIOCO</button>
            </div>
        `;

        const btnStart = document.getElementById('btn-start');
        btnStart.addEventListener('mouseover', () => {
            btnStart.style.background = '#fff';
            btnStart.style.color = '#000';
        });
        btnStart.addEventListener('mouseout', () => {
            btnStart.style.background = 'transparent';
            btnStart.style.color = '#fff';
        });
        btnStart.addEventListener('click', () => {
            this.hide();
            if (onStartGame) onStartGame();
        });
    }

    show() {
        document.getElementById('main-menu').style.display = 'flex';
    }

    hide() {
        document.getElementById('main-menu').style.display = 'none';
    }
}