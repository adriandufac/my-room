// Constantes de base du jeu
export const GAME_CONFIG = {
  CANVAS: {
    WIDTH: 1200,
    HEIGHT: 600,
    BACKGROUND_COLOR: "#87CEEB", // Bleu ciel
  },

  PHYSICS: {
    GRAVITY: 1200, // pixels/seconde²
    FRICTION: 0.85, // Coefficient de friction (0-1)
    GROUND_FRICTION: 0.8, // Friction spécifique au sol
    AIR_RESISTANCE: 0.98, // Résistance de l'air (0-1)
    MAX_FALL_SPEED: 500, // Vitesse maximale de chute
    DELTA_TIME_MAX: 1 / 30, // Limite le deltaTime pour éviter les gros sauts
    TERMINAL_VELOCITY: 1000, // Vitesse terminale maximale
  },

  PLAYER: {
    WIDTH: 32,
    HEIGHT: 48,
    COLOR: "#FF4444", // Rouge
    SPEED: 300, // pixels/seconde
    JUMP_POWER: 600, // Force du saut (vers le haut)
    STARTING_X: 100,
    STARTING_Y: 100,
    MAX_SPEED: 600, // Vitesse maximale horizontale
    ACCELERATION: 1200, // Accélération
    DECELERATION: 800, // Décélération

    AIR_CONTROL_MULTIPLIER: 0.6, // Réduction du contrôle en l'air (0-1)
    JUMP_HORIZONTAL_IMPULSE: 0.7, // Force de l'impulsion horizontale (facteur de SPEED)
    AIR_ACCELERATION_BONUS: 0.3, // Bonus d'accélération dans la même direction
    AIR_DECELERATION_FORCE: 0.8, // Force de décélération dans la direction opposée
    MAX_AIR_SPEED_MULTIPLIER: 1.2, // Multiplicateur de vitesse max en l'air
  },

  PLATFORMS: {
    COLOR: "#8B4513", // Marron
    DEFAULT_WIDTH: 200,
    DEFAULT_HEIGHT: 20,
  },

  ENEMIES: {
    COLOR: "#FF6600", // Orange-rouge
    WIDTH: 38, // 191px / 5 = ~38px (taille raisonnable)
    HEIGHT: 39, // 197px / 5 = ~39px 
    SPEED: 100,
    PATROL_DISTANCE: 150,
  },

  PROJECTILES: {
    COLOR: "#FF8800", // Orange
    WIDTH: 8,
    HEIGHT: 8,
    SPEED: 250,
    LIFETIME: 3000, // 3 secondes en millisecondes
  },

  GAME_LOOP: {
    TARGET_FPS: 60,
    FIXED_TIMESTEP: 1000 / 60, // 16.67ms
  },

  CAMERA: {
    FOLLOW_SMOOTHNESS: 0.3, // Entre 0 et 1
    OFFSET_X: 400, // Décalage horizontal par rapport au joueur
    OFFSET_Y: 200, // Décalage vertical par rapport au joueur
    BOUNDS_MARGIN: 50, // Marge pour les limites de la caméra
  },

  LEVEL: {
    DEFAULT_WIDTH: 2400,
    DEFAULT_HEIGHT: 600,
    GRID_SIZE: 32, // Taille de la grille pour l'éditeur
    BACKGROUND_COLOR: "#87CEEB",
  },

  UI: {
    FONT_FAMILY: "Arial, sans-serif",
    FONT_SIZE_SMALL: 14,
    FONT_SIZE_MEDIUM: 18,
    FONT_SIZE_LARGE: 24,
    FONT_SIZE_TITLE: 32,
    COLOR_PRIMARY: "#333333",
    COLOR_SECONDARY: "#666666",
    COLOR_SUCCESS: "#4CAF50",
    COLOR_ERROR: "#F44336",
    COLOR_WARNING: "#FF9800",
  },

  DEBUG: {
    SHOW_FPS: true,
    SHOW_PLAYER_CENTER: false,
    SHOW_COLLISION_BOXES: true,
    SHOW_VELOCITY_VECTORS: false,
    SHOW_GRID: false,
    SHOW_CAMERA_BOUNDS: false,
  },

  CONTROLS: {
    MOVE_LEFT: ["ArrowLeft", "q", "Q"], // Q pour AZERTY
    MOVE_RIGHT: ["ArrowRight", "d", "D"],
    JUMP: [" ", "ArrowUp", "z", "Z"], // Z pour AZERTY
    PAUSE: ["Escape", "p", "P"],
    DEBUG_TOGGLE: ["F1"],
    RESET: ["r", "R"],
  },
} as const;

// Constantes pour l'éditeur de niveaux
export const EDITOR_CONFIG = {
  TOOLBAR: {
    HEIGHT: 80,
    BUTTON_SIZE: 60,
    SPACING: 10,
    BACKGROUND_COLOR: "#f0f0f0",
    BORDER_COLOR: "#ccc",
  },

  GRID: {
    SIZE: 32,
    COLOR: "#ddd",
    THICKNESS: 1,
  },

  TOOLS: {
    SELECT: "select",
    PLATFORM: "platform",
    ENEMY: "enemy",
    PROJECTILE_SPAWNER: "projectile_spawner",
    START_POINT: "start_point",
    END_POINT: "end_point",
    DELETE: "delete",
  },

  COLORS: {
    SELECTED: "#00ff00",
    HOVER: "#ffff00",
    GRID: "#ddd",
    BACKGROUND: "#f9f9f9",
  },
} as const;

// Types pour une meilleure sécurité TypeScript
export type GameConfig = typeof GAME_CONFIG;
export type EditorConfig = typeof EDITOR_CONFIG;

// Énumérations utiles
export enum GameState {
  MENU = "menu",
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "game_over",
  VICTORY = "victory",
  LEVEL_EDITOR = "level_editor",
}

export enum EntityType {
  PLAYER = "player",
  PLATFORM = "platform",
  ENEMY = "enemy",
  PROJECTILE = "projectile",
  START_POINT = "start_point",
  END_POINT = "end_point",
}

export enum Direction {
  LEFT = -1,
  RIGHT = 1,
  UP = -1,
  DOWN = 1,
}
