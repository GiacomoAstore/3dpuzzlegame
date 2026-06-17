/**
 * @file Collectible.js
 * @description Crystals or items the player can collect.
 */

import { MeshBuilder, StandardMaterial, Color3, Vector3, ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import { EVENTS } from '../utils/Constants.js';

export class Collectible {
    /** @type {import('@babylonjs/core').AbstractMesh} */ mesh;

    constructor(scene, eventBus, id, position, playerMesh) {
        // Create a simple crystal shape
        this.mesh = MeshBuilder.CreateCylinder(id, { diameterTop: 0, diameterBottom: 0.5, height: 1, tessellation: 6 }, scene);
        this.mesh.position = new Vector3(position.x, position.y, position.z);

        const material = new StandardMaterial(id + "_mat", scene);
        material.diffuseColor = new Color3(0, 1, 1);
        material.emissiveColor = new Color3(0, 0.5, 0.5);
        this.mesh.material = material;

        this.scene = scene;

        this.onBeforeRender = () => {
            if (this.mesh) {
                this.mesh.rotation.y += 0.02;
            }
        };
        // Add a gentle rotation animation
        scene.onBeforeRenderObservable.add(this.onBeforeRender);

        // Setup intersection trigger to collect
        this.mesh.actionManager = new ActionManager(scene);
        this.mesh.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: playerMesh
                },
                () => {
                    eventBus.emit(EVENTS.CRYSTAL_COLLECTED, { id: this.mesh.name });
                    this.dispose();
                }
            )
        );
    }

    dispose() {
        if (this.scene) {
            this.scene.onBeforeRenderObservable.removeCallback(this.onBeforeRender);
        }
        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null;
        }
    }
}