// src/game/utils/Constants.ts

export const GAME_CONFIG = {
  // Configuration du canvas
  CANVAS: {
    WIDTH: 1200,
    HEIGHT: 600,
    BACKGROUND_COLOR: "#87CEEB", // Bleu ciel
  },

  // Configuration du joueur
  PLAYER: {
    WIDTH: 32,
    HEIGHT: 32,
    COLOR: "#FF4444", // Rouge
    SPEED: 300, // pixels par seconde
    JUMP_FORCE: -500, // Force de saut (négatif car l'axe Y est inversé)
    MAX_HEALTH: 3,
  },

  // Configuration des plateformes
  PLATFORM: {
    COLOR: "#44FF44", // Vert
    DEFAULT_WIDTH: 100,
    DEFAULT_HEIGHT: 20,
  },

  // Configuration des ennemis
  ENEMY: {
    WIDTH: 24,
    HEIGHT: 24,
    COLOR: "#FF8844", // Orange-rouge
    SPEED: 100,
  },

  // Configuration des projectiles
  PROJECTILE: {
    WIDTH: 8,
    HEIGHT: 8,
    COLOR: "#FF6600", // Orange
    SPEED: 200,
  },

  // Configuration de la physique
  PHYSICS: {
    GRAVITY: 1200, // pixels par seconde²
    TERMINAL_VELOCITY: 600, // Vitesse maximale de chute
    AIR_RESISTANCE: 0.01, // Résistance de l'air (0-1)
    GROUND_FRICTION: 0.8, // Friction au sol
    WALL_FRICTION: 0.3, // Friction contre les murs
  },

  // Configuration de la caméra
  CAMERA: {
    SMOOTH_FACTOR: 0.1, // Plus petit = plus lisse
    DEAD_ZONE_X: 200, // Zone morte horizontale
    DEAD_ZONE_Y: 100, // Zone morte verticale
  },

  // Configuration du niveau
  LEVEL: {
    DEFAULT_WIDTH: 2400,
    DEFAULT_HEIGHT: 600,
    GRID_SIZE: 32, // Taille de la grille pour l'éditeur
  },

  // Configuration du jeu
  GAME: {
    TARGET_FPS: 60,
    SCORE_PER_ENEMY: 100,
    SCORE_PER_LEVEL: 1000,
  },

  // Configuration de l'éditeur
  EDITOR: {
    GRID_COLOR: "#CCCCCC",
    SELECTION_COLOR: "#00FFFF",
    PREVIEW_ALPHA: 0.5,
  },
};

// Types d'entités du jeu
export enum EntityType {
  PLAYER = "player",
  PLATFORM = "platform",
  ENEMY = "enemy",
  PROJECTILE = "projectile",
  COLLECTIBLE = "collectible",
}

// États du jeu
export enum GameState {
  MENU = "menu",
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "game_over",
  VICTORY = "victory",
  LEVEL_EDITOR = "level_editor",
}

// Touches du clavier
export enum Keys {
  LEFT = "ArrowLeft",
  RIGHT = "ArrowRight",
  UP = "ArrowUp",
  DOWN = "ArrowDown",
  SPACE = " ",
  ENTER = "Enter",
  ESCAPE = "Escape",
  A = "a",
  D = "d",
  W = "w",
  S = "s",
}

// Directions
export enum Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}
