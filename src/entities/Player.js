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
    /** @type {number} */ #footstepTimer = 0;

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

        // Disable default movement keys on camera to handle it manually with moveWithCollisions
        this.#fpsCamera.keysUp = [];
        this.#fpsCamera.keysDown = [];
        this.#fpsCamera.keysLeft = [];
        this.#fpsCamera.keysRight = [];

        this.#fpsCamera.attachControl(this.#scene.getEngine().getRenderingCanvas(), true);
        this.#fpsCamera.checkCollisions = false; // The mesh handles collisions

        // TPS Camera
        this.#tpsCamera = new ArcRotateCamera("tpsCamera", -Math.PI / 2, Math.PI / 2.5, 5, this.#mesh.position, this.#scene);
        this.#tpsCamera.setTarget(this.#mesh);
        this.#tpsCamera.checkCollisions = true;
        this.#tpsCamera.collisionRadius = new Vector3(0.5, 0.5, 0.5);
        this.#tpsCamera.minZ = 0.1;
        this.#tpsCamera.maxZ = 1000;
        this.#fpsCamera.maxZ = 1000;

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

        // Determine movement direction based on active camera
        let forward, right;

        if (this.#isFirstPerson) {
            this.#mesh.rotation.y = this.#fpsCamera.rotation.y;
            forward = this.#fpsCamera.getDirection(Vector3.Forward());
            right = this.#fpsCamera.getDirection(Vector3.Right());
        } else {
            forward = this.#tpsCamera.getDirection(Vector3.Forward());
            right = this.#tpsCamera.getDirection(Vector3.Right());
            // In TPS, forward direction usually ignores Y pitch
            forward.y = 0;
            right.y = 0;
            forward.normalize();
            right.normalize();
        }

        let moveDirection = Vector3.Zero();

        if (this.#inputManager.isKeyDown('KeyW')) {
            moveDirection.addInPlace(forward);
        }
        if (this.#inputManager.isKeyDown('KeyS')) {
            moveDirection.subtractInPlace(forward);
        }
        if (this.#inputManager.isKeyDown('KeyA')) {
            moveDirection.subtractInPlace(right);
        }
        if (this.#inputManager.isKeyDown('KeyD')) {
            moveDirection.addInPlace(right);
        }

        if (moveDirection.length() > 0) {
            moveDirection.normalize();

            // Only rotate mesh to match movement in TPS
            if (!this.#isFirstPerson) {
                const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
                this.#mesh.rotation.y = targetRotation;
            }
        }

        // Apply speed, delta time, and simple gravity
        const velocity = moveDirection.scale(PLAYER_SETTINGS.SPEED * deltaTime);
        velocity.y = -9.81 * deltaTime; // Simple gravity

        this.#mesh.moveWithCollisions(velocity);

        if (moveDirection.length() > 0) {
            this.#footstepTimer += deltaTime;
            if (this.#footstepTimer > 0.5) { // play sound roughly every 0.5s of movement
                this.#eventBus.emit(EVENTS.PLAYER_MOVE);
                this.#footstepTimer = 0;
            }
        } else {
            this.#footstepTimer = 0;
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

    get mesh() {
        return this.#mesh;
    }
}