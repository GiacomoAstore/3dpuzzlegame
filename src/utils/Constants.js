/**
 * @file Constants.js
 * @description Global constants for the game.
 */

export const GAME_STATES = {
    LOADING: 'LOADING',
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    GAME_OVER: 'GAME_OVER'
};

export const EVENTS = {
    PUZZLE_BLOCK_PLACED: 'PUZZLE_BLOCK_PLACED',
    PUZZLE_SOLVED: 'PUZZLE_SOLVED',
    CRYSTAL_COLLECTED: 'CRYSTAL_COLLECTED',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    LEVEL_RESET: 'LEVEL_RESET',
    PLAYER_INTERACT: 'PLAYER_INTERACT',
    PLAYER_MOVE: 'PLAYER_MOVE',
    DOOR_OPEN: 'DOOR_OPEN',
    GAME_PAUSE: 'GAME_PAUSE',
    GAME_RESUME: 'GAME_RESUME'
};

export const PLAYER_SETTINGS = {
    SPEED: 5,
    INTERACT_RANGE: 3,
    HEIGHT: 1.5,
    RADIUS: 0.5
};

export const TEXTURE_URLS = {
    FLOOR: 'https://playground.babylonjs.com/textures/wood.jpg',
    WALL: 'https://playground.babylonjs.com/textures/floor.png',
    BLOCK_RED: 'https://playground.babylonjs.com/textures/albedo.png',
    CRYSTAL: 'https://playground.babylonjs.com/textures/reflectivity.png'
};

export const AUDIO_URLS = {
    FOOTSTEP: 'https://playground.babylonjs.com/sounds/violons11.wav',
    BLOCK_TARGET: 'https://playground.babylonjs.com/sounds/bounce.wav',
    CRYSTAL_COLLECT: 'https://playground.babylonjs.com/sounds/cellolong.wav',
    DOOR_OPEN: 'https://playground.babylonjs.com/sounds/gunshot.wav'
};

export const PHYSICS_GROUPS = {
    DEFAULT: 1,
    PLAYER: 2,
    INTERACTABLE: 4,
    TRIGGER: 8
};