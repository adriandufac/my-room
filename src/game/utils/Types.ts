export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Vector2D;
  size: Vector2D;
  velocity?: Vector2D;
  color: string;
  type: GameObjectType;
}

export enum GameObjectType {
  PLAYER = "player",
  PLATFORM = "platform",
  MOVING_PLATFORM = "movingPlatform",
  BREAKABLE_PLATFORM = "breakablePlatform",
  ENEMY = "enemy",
  PROJECTILE = "projectile",
  FINISH_LINE = "finishLine",
}

export enum PlatformType {
  SOLID = "solid", // Vert - plateforme normale
  ICE = "ice", // Bleu clair - glissante
  SPIKE = "spike", // Rouge foncé - fait mal
  MOVING = "moving", // Violet - bouge
  BREAKABLE = "breakable", // Jaune - se casse
}

export interface LevelData {
  id: string;
  name: string;
  width: number;
  height: number;
  playerStart: Vector2D;
  finishLine: Vector2D;
  platforms: GameObject[];
  enemies: GameObject[];
  projectiles: GameObject[];
  background?: string;
}

export interface GameState {
  currentLevel: number;
  score: number;
  lives: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  levelComplete: boolean;
}
