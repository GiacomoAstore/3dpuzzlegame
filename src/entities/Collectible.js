/**
 * @file Collectible.js
 * @description Crystals or items the player can collect.
 */

import { MeshBuilder, StandardMaterial, Color3, Color4, Vector3, ActionManager, ExecuteCodeAction, ParticleSystem, Texture } from '@babylonjs/core';
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

        // Particellari Aura
        this.particleSystem = new ParticleSystem("particles", 500, scene);
        this.particleSystem.particleTexture = new Texture("https://playground.babylonjs.com/textures/flare.png", scene);
        this.particleSystem.emitter = this.mesh;
        this.particleSystem.color1 = new Color4(0, 1, 1, 1);
        this.particleSystem.color2 = new Color4(0, 0.5, 1, 1);
        this.particleSystem.colorDead = new Color4(0, 0, 0.2, 0);
        this.particleSystem.minSize = 0.05;
        this.particleSystem.maxSize = 0.15;
        this.particleSystem.minLifeTime = 0.5;
        this.particleSystem.maxLifeTime = 1.5;
        this.particleSystem.emitRate = 30;
        this.particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        this.particleSystem.gravity = new Vector3(0, 0.5, 0);
        this.particleSystem.direction1 = new Vector3(-0.5, 0.5, -0.5);
        this.particleSystem.direction2 = new Vector3(0.5, 1, 0.5);
        this.particleSystem.minEmitPower = 0.2;
        this.particleSystem.maxEmitPower = 0.5;
        this.particleSystem.updateSpeed = 0.01;
        this.particleSystem.start();

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
                    
                    // Burst effect
                    if (this.particleSystem) {
                        this.particleSystem.emitter = this.mesh.position.clone();
                        this.particleSystem.minEmitPower = 2;
                        this.particleSystem.maxEmitPower = 4;
                        this.particleSystem.emitRate = 500;
                        this.particleSystem.targetStopDuration = 0.2;
                        this.particleSystem.disposeOnStop = true;
                    }
                    this.particleSystem = null; // Prevent dispose() from destroying it early
                    
                    this.dispose();
                }
            )
        );
    }

    dispose() {
        if (this.scene) {
            this.scene.onBeforeRenderObservable.removeCallback(this.onBeforeRender);
        }
        if (this.particleSystem) {
            this.particleSystem.dispose();
        }
        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null;
        }
    }
}