/**
 * @file Trigger.js
 * @description Invisible zones that trigger events (e.g. Level Exit).
 */

import { MeshBuilder, Vector3, ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import { EVENTS } from '../utils/Constants.js';

export class Trigger {
    /** @type {import('@babylonjs/core').AbstractMesh} */ mesh;

    constructor(scene, eventBus, id, position, size, eventToEmit, playerMesh) {
        this.mesh = MeshBuilder.CreateBox(id, { width: size.width, height: size.height, depth: size.depth }, scene);
        this.mesh.position = new Vector3(position.x, position.y, position.z);
        this.mesh.isVisible = false;
        this.mesh.isPickable = false;
        this.mesh.checkCollisions = false;

        this.mesh.actionManager = new ActionManager(scene);
        this.mesh.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: playerMesh
                },
                () => {
                    eventBus.emit(eventToEmit);
                }
            )
        );
    }

    dispose() {
        if (this.mesh) this.mesh.dispose();
    }
}