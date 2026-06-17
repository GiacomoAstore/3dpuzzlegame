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
    FOOTSTEP: 'https://kenney.nl/assets/impact-sounds/footstep_stone_001.ogg', // placeholder URL
    BLOCK_TARGET: 'https://freesound.org/data/previews/270/270402_5123851-lq.mp3', // placeholder
    CRYSTAL_COLLECT: 'https://freesound.org/data/previews/146/146727_2615119-lq.mp3', // placeholder
    DOOR_OPEN: 'https://freesound.org/data/previews/198/198961_2092147-lq.mp3' // placeholder
};

export const PHYSICS_GROUPS = {
    DEFAULT: 1,
    PLAYER: 2,
    INTERACTABLE: 4,
    TRIGGER: 8
};