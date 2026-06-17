/**
 * @file Player.js
 * @description The main player character entity.
 */

import { UniversalCamera, ArcRotateCamera, Vector3, MeshBuilder, StandardMaterial, Color3, Ray } from '@babylonjs/core';
import { PLAYER_SETTINGS, EVENTS } from '../utils/Constants.js';

export class Player {
    /** @type {import('@babylonjs/core').Scene} */ #scene;
    /** @type {import('../core/InputManager.js').InputManager} */ #inputManager;
    /** @type {import('../core/EventBus.js').EventBus} */ #eventBus;
    /** @type {import('@babylonjs/core').AbstractMesh} */ #mesh;
    /** @type {UniversalCamera} */ #fpsCamera;
    /** @type {ArcRotateCamera} */ #tpsCamera;
    /** @type {boolean} */ #isFirstPerson = true;
    /** @type {import('@babylonjs/core').AbstractMesh|null} */ #currentInteractable = null;

    constructor(scene, spawnPoint, inputManager, eventBus) {
        this.#scene = scene;
        this.#inputManager = inputManager;
        this.#eventBus = eventBus;

        this.init(spawnPoint);
    }

    init(spawnPoint) {
        // Create player mesh (capsule)
        this.#mesh = MeshBuilder.CreateCapsule("player", { height: PLAYER_SETTINGS.HEIGHT, radius: PLAYER_SETTINGS.RADIUS }, this.#scene);
        this.#mesh.position = new Vector3(spawnPoint.x, spawnPoint.y + PLAYER_SETTINGS.HEIGHT / 2, spawnPoint.z);
        this.#mesh.checkCollisions = true;
        this.#mesh.ellipsoid = new Vector3(PLAYER_SETTINGS.RADIUS, PLAYER_SETTINGS.HEIGHT / 2, PLAYER_SETTINGS.RADIUS);
        this.#mesh.isVisible = false; // Hide in FPS

        const material = new StandardMaterial("playerMat", this.#scene);
        material.diffuseColor = new Color3(0, 1, 0);
        this.#mesh.material = material;

        // FPS Camera
        this.#fpsCamera = new UniversalCamera("fpsCamera", new Vector3(0, PLAYER_SETTINGS.HEIGHT / 2 - 0.1, 0), this.#scene);
        this.#fpsCamera.parent = this.#mesh;
        this.#fpsCamera.minZ = 0.1;

        // Disable rotation via mouse as it's handled when pointer is locked.
        // Wait, attaching control handles it by default, but we should make sure camera is active
        this.#fpsCamera.attachControl(this.#scene.getEngine().getRenderingCanvas(), true);
        this.#fpsCamera.checkCollisions = true;
        this.#fpsCamera.applyGravity = true;
        this.#fpsCamera.ellipsoid = new Vector3(PLAYER_SETTINGS.RADIUS, PLAYER_SETTINGS.HEIGHT / 2, PLAYER_SETTINGS.RADIUS);
        this.#fpsCamera.speed = PLAYER_SETTINGS.SPEED / 10;

        // Key bindings for WASD
        this.#fpsCamera.keysUp.push(87);    // W
        this.#fpsCamera.keysDown.push(83);  // S
        this.#fpsCamera.keysLeft.push(65);  // A
        this.#fpsCamera.keysRight.push(68); // D

        // TPS Camera
        this.#tpsCamera = new ArcRotateCamera("tpsCamera", -Math.PI / 2, Math.PI / 2.5, 5, this.#mesh.position, this.#scene);
        this.#tpsCamera.setTarget(this.#mesh);
        this.#tpsCamera.checkCollisions = true;

        this.#scene.activeCamera = this.#fpsCamera;

        // Interaction key
        this.onKeyDown = (e) => {
            if (e.code === 'KeyF') {
                this.#toggleCamera();
            } else if (e.code === 'KeyE' && this.#currentInteractable) {
                this.#eventBus.emit(EVENTS.PLAYER_INTERACT, this.#currentInteractable);
            }
        };
        window.addEventListener('keydown', this.onKeyDown);
    }

    #toggleCamera() {
        this.#isFirstPerson = !this.#isFirstPerson;
        if (this.#isFirstPerson) {
            this.#scene.activeCamera = this.#fpsCamera;
            this.#fpsCamera.attachControl(this.#scene.getEngine().getRenderingCanvas(), true);
            this.#tpsCamera.detachControl();
            this.#mesh.isVisible = false;
        } else {
            this.#scene.activeCamera = this.#tpsCamera;
            this.#tpsCamera.attachControl(this.#scene.getEngine().getRenderingCanvas(), true);
            this.#fpsCamera.detachControl();
            this.#mesh.isVisible = true;
        }
    }

    update(deltaTime) {
        if (!this.#inputManager.isPointerLocked) return;

        // Sync mesh rotation to camera in FPS mode
        if (this.#isFirstPerson) {
            this.#mesh.rotation.y = this.#fpsCamera.rotation.y;
        } else {
            // Basic movement handling for TPS could go here
            // For now, Babylon's ArcRotateCamera handles rotation around target
        }

        this.#checkInteractions();
    }

    #checkInteractions() {
        const origin = this.#isFirstPerson ? this.#fpsCamera.globalPosition : this.#mesh.position;
        const forward = this.#isFirstPerson ? this.#fpsCamera.getDirection(Vector3.Forward()) : this.#mesh.forward;

        const ray = new Ray(origin, forward, PLAYER_SETTINGS.INTERACT_RANGE);

        // Raycast logic to find interactable objects
        const hit = this.#scene.pickWithRay(ray, (mesh) => {
            return mesh.isPickable && mesh.metadata && mesh.metadata.interactable;
        });

        if (hit && hit.hit && hit.pickedMesh) {
            if (this.#currentInteractable !== hit.pickedMesh) {
                this.#currentInteractable = hit.pickedMesh;
                this.#eventBus.emit('SHOW_INTERACT_PROMPT', true);
            }
        } else {
            if (this.#currentInteractable) {
                this.#currentInteractable = null;
                this.#eventBus.emit('SHOW_INTERACT_PROMPT', false);
            }
        }
    }

    dispose() {
        window.removeEventListener('keydown', this.onKeyDown);
        if (this.#fpsCamera) this.#fpsCamera.dispose();
        if (this.#tpsCamera) this.#tpsCamera.dispose();
        if (this.#mesh) this.#mesh.dispose();
    }
}