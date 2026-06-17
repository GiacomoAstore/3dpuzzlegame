/**
 * @file Door.js
 * @description A door that opens when puzzle conditions are met.
 */

import { MeshBuilder, StandardMaterial, Color3, Vector3, Animation } from '@babylonjs/core';
import { EVENTS } from '../utils/Constants.js';

export class Door {
    /** @type {import('@babylonjs/core').AbstractMesh} */ mesh;
    /** @type {boolean} */ isOpen = false;

    constructor(scene, eventBus, position) {
        this.mesh = MeshBuilder.CreateBox("door", { width: 3, height: 4, depth: 0.5 }, scene);
        this.mesh.position = new Vector3(position.x, position.y + 2, position.z);
        this.mesh.checkCollisions = true;

        const material = new StandardMaterial("door_mat", scene);
        material.diffuseColor = new Color3(0.5, 0.3, 0.1);
        this.mesh.material = material;

        this.eventBus = eventBus;

        // Listen for puzzle solved event
        this.onPuzzleSolved = () => {
            this.open(scene);
            eventBus.emit(EVENTS.DOOR_OPEN);
        };

        eventBus.on(EVENTS.PUZZLE_SOLVED, this.onPuzzleSolved);
    }

    open(scene) {
        if (this.isOpen) return;
        this.isOpen = true;

        // Simple animation to slide door up
        const slideAnim = new Animation("doorOpen", "position.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys = [
            { frame: 0, value: this.mesh.position.y },
            { frame: 60, value: this.mesh.position.y + 4 }
        ];
        slideAnim.setKeys(keys);
        this.mesh.animations.push(slideAnim);

        scene.beginAnimation(this.mesh, 0, 60, false, 1, () => {
            this.mesh.checkCollisions = false; // Allow passing through
        });
    }

    dispose() {
        if (this.eventBus) {
            this.eventBus.off(EVENTS.PUZZLE_SOLVED, this.onPuzzleSolved);
        }
        if (this.mesh) this.mesh.dispose();
    }
}