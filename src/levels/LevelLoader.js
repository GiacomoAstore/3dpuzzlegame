/**
 * @file LevelLoader.js
 * @description Loads level data and constructs the scene.
 */

import { MeshBuilder, StandardMaterial, Color3, Vector3, PointLight, Texture, ShadowGenerator } from '@babylonjs/core';
import { Player } from '../entities/Player.js';
import { PuzzleBlock } from '../entities/PuzzleBlock.js';
import { Collectible } from '../entities/Collectible.js';
import { Door } from '../entities/Door.js';
import { Trigger } from '../entities/Trigger.js';
import { TEXTURE_URLS, EVENTS } from '../utils/Constants.js';

export class LevelLoader {
    /** @type {import('@babylonjs/core').Scene} */ #scene;
    /** @type {import('../core/EventBus.js').EventBus} */ #eventBus;
    /** @type {import('../core/InputManager.js').InputManager} */ #inputManager;

    // Level state
    entities = [];
    player = null;
    totalBlocks = 0;
    blocksPlaced = 0;
    totalCrystals = 0;
    crystalsCollected = 0;
    door = null;

    constructor(scene, eventBus, inputManager) {
        this.#scene = scene;
        this.#eventBus = eventBus;
        this.#inputManager = inputManager;

        this.#setupEventListeners();
    }

    #setupEventListeners() {
        this.onBlockPlaced = () => {
            this.blocksPlaced++;
            this.#eventBus.emit('HUD_UPDATE_BLOCKS', { placed: this.blocksPlaced, total: this.totalBlocks });
            this.#checkLevelCompletion();
        };

        this.onCrystalCollected = (data) => {
            if (data && data.id) {
                this.crystalsCollected++;
                this.#eventBus.emit('HUD_UPDATE_CRYSTALS', { collected: this.crystalsCollected, total: this.totalCrystals });
                this.#checkLevelCompletion();
            }
        };

        this.#eventBus.on(EVENTS.PUZZLE_BLOCK_PLACED, this.onBlockPlaced);
        this.#eventBus.on(EVENTS.CRYSTAL_COLLECTED, this.onCrystalCollected);
    }

    dispose() {
        this.#eventBus.off(EVENTS.PUZZLE_BLOCK_PLACED, this.onBlockPlaced);
        this.#eventBus.off(EVENTS.CRYSTAL_COLLECTED, this.onCrystalCollected);
        this.#clearLevel();
    }

    #checkLevelCompletion() {
        if (this.blocksPlaced === this.totalBlocks && this.crystalsCollected === this.totalCrystals) {
            this.#eventBus.emit(EVENTS.PUZZLE_SOLVED);
        }
    }

    async loadLevel(levelJsonUrl) {
        this.#clearLevel();

        try {
            const response = await fetch(levelJsonUrl);
            const data = await response.json();

            this.#buildRoom(data.roomSize);
            this.#setupLighting(data.lights);

            // Instantiate Player first so other entities can reference it
            this.player = new Player(this.#scene, data.spawnPoint, this.#inputManager, this.#eventBus);
            if (this.#scene.shadowGenerators) {
                this.#scene.shadowGenerators.forEach(sg => sg.addShadowCaster(this.player.mesh, true));
            }

            this.#setupTargets(data.targets);
            this.#setupBlocks(data.blocks);
            this.#setupCrystals(data.crystals);

            if (data.exitPoint) {
                this.door = new Door(this.#scene, this.#eventBus, data.exitPoint);
                // Exit trigger behind the door
                // Get player mesh explicitly
                const playerMesh = this.#scene.getMeshByName("player");
                const exitTrigger = new Trigger(
                    this.#scene, this.#eventBus, "exitTrigger",
                    new Vector3(data.exitPoint.x, data.exitPoint.y, data.exitPoint.z + 2),
                    { width: 3, height: 4, depth: 2 },
                    EVENTS.LEVEL_COMPLETE,
                    playerMesh // Needs access to internal mesh for trigger, simple workaround
                );
                this.entities.push(this.door, exitTrigger);
            }

            // Freeze static meshes for performance
            // this.#scene.freezeActiveMeshes();

            // Initial HUD update
            this.#eventBus.emit('HUD_UPDATE_CRYSTALS', { collected: 0, total: this.totalCrystals });
            this.#eventBus.emit('HUD_UPDATE_BLOCKS', { placed: 0, total: this.totalBlocks });

            return this.player;
        } catch (err) {
            console.error(`Failed to load level ${levelJsonUrl}`, err);
        }
    }

    #buildRoom(size) {
        // Floor
        const floor = MeshBuilder.CreateGround("floor", { width: size.width, height: size.depth }, this.#scene);
        const floorMat = new StandardMaterial("floorMat", this.#scene);
        floorMat.diffuseTexture = new Texture(TEXTURE_URLS.FLOOR, this.#scene);
        floor.material = floorMat;
        floor.checkCollisions = true;
        floor.receiveShadows = true;
        floor.freezeWorldMatrix(); // Optimization: make static
        this.entities.push({ dispose: () => floor.dispose() }); // Simple wrapper for disposal

        // Add walls (simplified box with inverted normals or separate planes)
        // For simplicity, a large box
        const room = MeshBuilder.CreateBox("room", { width: size.width, height: size.height, depth: size.depth }, this.#scene);
        room.position.y = (size.height / 2) - 0.01; // offset slightly to prevent Z-fighting with floor
        room.flipFaces(true); // Inside out
        room.checkCollisions = true;
        room.isPickable = false;

        const wallMat = new StandardMaterial("wallMat", this.#scene);
        wallMat.diffuseTexture = new Texture(TEXTURE_URLS.WALL, this.#scene);
        room.material = wallMat;
        room.receiveShadows = true;
        room.freezeWorldMatrix(); // Optimization: make static
        this.entities.push({ dispose: () => room.dispose() });
    }

    #setupLighting(lightsData) {
        if (!lightsData) return;
        this.#scene.shadowGenerators = [];
        lightsData.forEach((l, i) => {
            if (l.type === "point") {
                const light = new PointLight(`light_${i}`, new Vector3(l.position.x, l.position.y, l.position.z), this.#scene);
                light.intensity = l.intensity;
                light.diffuse = new Color3(1, 0.8, 0.5); // Orange/yellow torch color
                
                // Ombre
                const shadowGenerator = new ShadowGenerator(1024, light);
                shadowGenerator.useBlurExponentialShadowMap = true;
                shadowGenerator.blurKernel = 32;
                this.#scene.shadowGenerators.push(shadowGenerator);

                this.entities.push({ dispose: () => { light.dispose(); shadowGenerator.dispose(); } });
            }
        });
    }

    #setupTargets(targetsData) {
        if (!targetsData) return;
        targetsData.forEach(t => {
            const target = MeshBuilder.CreateGround(t.id, { width: 1.2, height: 1.2 }, this.#scene);
            target.position = new Vector3(t.position.x, t.position.y + 0.01, t.position.z);
            const mat = new StandardMaterial(t.id + "_mat", this.#scene);
            mat.diffuseColor = t.color === 'red' ? new Color3(0.5, 0, 0) : (t.color === 'blue' ? new Color3(0, 0, 0.5) : new Color3(0, 0.5, 0));
            target.material = mat;
            this.entities.push({ dispose: () => target.dispose() });
        });
    }

    #setupBlocks(blocksData) {
        this.totalBlocks = blocksData ? blocksData.length : 0;
        this.blocksPlaced = 0;
        if (!blocksData) return;

        blocksData.forEach(b => {
            const block = new PuzzleBlock(this.#scene, this.#eventBus, b.id, b.color, b.position, b.targetId);
            if (this.#scene.shadowGenerators) {
                this.#scene.shadowGenerators.forEach(sg => sg.addShadowCaster(block.mesh, true));
            }
            this.entities.push(block);
        });
    }

    #setupCrystals(crystalsData) {
        this.totalCrystals = crystalsData ? crystalsData.length : 0;
        this.crystalsCollected = 0;
        if (!crystalsData) return;

        // Note: Hack to get player mesh. Should be exposed via getter.
        const playerMesh = this.#scene.getMeshByName("player");

        crystalsData.forEach(c => {
            const crystal = new Collectible(this.#scene, this.#eventBus, c.id, c.position, playerMesh);
            if (this.#scene.shadowGenerators) {
                this.#scene.shadowGenerators.forEach(sg => sg.addShadowCaster(crystal.mesh, true));
            }
            this.entities.push(crystal);
        });
    }

    #clearLevel() {
        // this.#scene.unfreezeActiveMeshes();
        this.entities.forEach(e => e.dispose());
        this.entities = [];
        if (this.player) {
            this.player.dispose();
            this.player = null;
        }
        this.door = null;
    }

    update(deltaTime) {
        if (this.player) {
            this.player.update(deltaTime);
        }
    }
}