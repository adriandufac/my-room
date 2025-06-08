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
  platforms: PlatformData[];
  enemies: EnemyData[];
  projectileSpawners: ProjectileSpawnerData[];
  background?: string;
  version: string;
  created: string;
  modified: string;
}

export interface PlatformData {
  id: string;
  position: Vector2D;
  size: Vector2D;
  type: PlatformType;
  color: string;
  properties?: {
    moveSpeed?: number;
    moveDistance?: number;
    breakable?: boolean;
    slippery?: boolean;
  };
}

export interface EnemyData {
  id: string;
  position: Vector2D;
  size: Vector2D;
  type: EnemyType;
  color: string;
  properties: {
    patrolDistance: number;
    speed: number;
    direction: number;
  };
}

export interface ProjectileSpawnerData {
  id: string;
  position: Vector2D;
  direction: number;
  interval: number;
  color: string;
  properties?: {
    speed?: number;
    lifetime?: number;
  };
}

export enum EnemyType {
  BASIC = "basic",
  FLYING = "flying",
  JUMPING = "jumping",
}

export interface EditorState {
  currentTool: EditorTool;
  selectedObject: string | null;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  cameraPosition: Vector2D;
  zoom: number;
}

export enum EditorTool {
  SELECT = "select",
  PLATFORM = "platform",
  ENEMY = "enemy",
  PROJECTILE_SPAWNER = "projectileSpawner",
  SPAWN_POINT = "spawnPoint",
  FINISH_LINE = "finishLine",
  ERASE = "erase",
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
