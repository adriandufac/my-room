export interface AnimationConfig {
  name: string;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  startFrame: number;
  duration: number; // Duration in milliseconds
  loop: boolean;
  flipX?: boolean;
}

export interface SpriteConfig {
  imagePath: string;
  frameWidth: number;
  frameHeight: number;
  animations: Record<string, AnimationConfig>;
}

export interface AnimationState {
  name: string;
  priority: number;
  conditions?: () => boolean;
}