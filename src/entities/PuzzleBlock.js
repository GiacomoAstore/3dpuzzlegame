/**
 * @file PuzzleBlock.js
 * @description A pushable block for puzzles.
 */

import { MeshBuilder, StandardMaterial, Color3, Vector3, ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import { EVENTS } from '../utils/Constants.js';

export class PuzzleBlock {
    /** @type {import('@babylonjs/core').AbstractMesh} */ mesh;
    /** @type {string} */ color;
    /** @type {string} */ targetId;
    /** @type {boolean} */ isPlaced = false;

    constructor(scene, eventBus, id, color, position, targetId) {
        this.mesh = MeshBuilder.CreateBox(id, { size: 1 }, scene);
        this.mesh.position = new Vector3(position.x, position.y, position.z);
        this.mesh.checkCollisions = true;
        this.color = color;
        this.targetId = targetId;

        // Metadata for interaction raycast
        this.mesh.metadata = { interactable: true, type: 'block', instance: this };

        const material = new StandardMaterial(id + "_mat", scene);
        material.diffuseColor = this.#getColorValue(color);
        this.mesh.material = material;

        this.eventBus = eventBus;

        // Setup interaction logic here (pushed by player)
        this.onPlayerInteract = (interactedMesh) => {
            if (interactedMesh === this.mesh && !this.isPlaced) {
                // Determine push direction based on player relative position
                // Simplified push logic
                const pushDirection = this.mesh.position.subtract(scene.activeCamera.globalPosition).normalize();
                pushDirection.y = 0; // Keep horizontal

                // Snap direction to nearest axis
                if (Math.abs(pushDirection.x) > Math.abs(pushDirection.z)) {
                    pushDirection.z = 0;
                    pushDirection.x = Math.sign(pushDirection.x);
                } else {
                    pushDirection.x = 0;
                    pushDirection.z = Math.sign(pushDirection.z);
                }

                // Move one unit
                this.mesh.position.addInPlace(pushDirection);

                // Check if on target
                this.#checkTarget(scene, eventBus);
            }
        };

        this.eventBus.on(EVENTS.PLAYER_INTERACT, this.onPlayerInteract);
    }

    #checkTarget(scene, eventBus) {
        const targetMesh = scene.getMeshByName(this.targetId);
        // We only care about X and Z for distance since Y might be slightly different
        if (targetMesh) {
            const dx = this.mesh.position.x - targetMesh.position.x;
            const dz = this.mesh.position.z - targetMesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < 0.8) { // Slightly more forgiving threshold
                this.isPlaced = true;
                this.mesh.position.x = targetMesh.position.x;
                this.mesh.position.z = targetMesh.position.z;
                this.mesh.position.y = targetMesh.position.y + 0.5; // Sit on top of target

                // Visual feedback
                this.mesh.material.emissiveColor = this.#getColorValue(this.color).scale(0.8);
                this.mesh.metadata.interactable = false;

                eventBus.emit(EVENTS.PUZZLE_BLOCK_PLACED, { blockId: this.mesh.name });
            }
        }
    }

    #getColorValue(colorStr) {
        switch(colorStr) {
            case 'red': return new Color3(1, 0, 0);
            case 'blue': return new Color3(0, 0, 1);
            case 'green': return new Color3(0, 1, 0);
            default: return new Color3(1, 1, 1);
        }
    }

    dispose() {
        if (this.eventBus) {
            this.eventBus.off(EVENTS.PLAYER_INTERACT, this.onPlayerInteract);
        }
        if (this.mesh) this.mesh.dispose();
    }
}