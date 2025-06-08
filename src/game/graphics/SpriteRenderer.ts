import type { AnimationConfig, SpriteConfig } from "./SpriteTypes";

// Re-export types for easier imports
export type { AnimationConfig, SpriteConfig } from "./SpriteTypes";

export class SpriteRenderer {
  private image: HTMLImageElement;
  private loaded: boolean = false;
  private currentAnimation: string = "";
  private currentFrame: number = 0;
  private animationTimer: number = 0;
  private animations: Record<string, AnimationConfig> = {};
  private frameWidth: number;
  private frameHeight: number;

  constructor(config: SpriteConfig) {
    this.frameWidth = config.frameWidth;
    this.frameHeight = config.frameHeight;
    this.animations = config.animations;

    this.image = new Image();
    this.image.onload = () => {
      this.loaded = true;
      console.log(`[SPRITE] Loaded: ${config.imagePath}`);
    };
    this.image.onerror = () => {
      console.error(`[ERROR] Failed to load sprite: ${config.imagePath}`);
    };
    this.image.src = config.imagePath;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public setAnimation(animationName: string): void {
    if (!this.animations[animationName]) {
      console.warn(`[WARNING] Animation '${animationName}' not found`);
      return;
    }

    if (this.currentAnimation !== animationName) {
      this.currentAnimation = animationName;
      this.currentFrame = 0;
      this.animationTimer = 0;
      console.log(`[SPRITE] Animation changed to: ${animationName}`);
    }
  }

  public getCurrentAnimation(): string {
    return this.currentAnimation;
  }

  public update(deltaTime: number): void {
    if (!this.loaded || !this.currentAnimation) return;

    const animation = this.animations[this.currentAnimation];
    if (!animation) return;

    this.animationTimer += deltaTime * 1000; // Convert to milliseconds

    const frameTime = animation.duration / animation.frameCount;

    if (this.animationTimer >= frameTime) {
      this.currentFrame++;
      this.animationTimer = 0;

      if (this.currentFrame >= animation.frameCount) {
        if (animation.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = animation.frameCount - 1;
        }
      }
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    if (!this.loaded || !this.currentAnimation) {
      console.log('[SPRITE] Render skipped - loaded:', this.loaded, 'animation:', this.currentAnimation);
      return;
    }

    const animation = this.animations[this.currentAnimation];
    if (!animation) {
      console.log('[SPRITE] Animation not found:', this.currentAnimation);
      return;
    }

    const renderWidth = width || this.frameWidth;
    const renderHeight = height || this.frameHeight;

    // Calculate source position in spritesheet
    const sourceX = (animation.startFrame + this.currentFrame) * this.frameWidth;
    const sourceY = 0; // Assuming horizontal spritesheet

    // Debug: only log if needed
    // console.log('[SPRITE] Render params:', { sourceX, currentFrame: this.currentFrame, animation: animation.name });

    // Handle flipping
    if (animation.flipX) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.image,
        sourceX,
        sourceY,
        this.frameWidth,
        this.frameHeight,
        -(x + renderWidth),
        y,
        renderWidth,
        renderHeight
      );
      ctx.restore();
    } else {
      try {
        // Use the normal spritesheet logic (horizontal layout)
        ctx.drawImage(
          this.image,
          sourceX,
          sourceY,
          this.frameWidth,
          this.frameHeight,
          Math.round(x),
          Math.round(y),
          renderWidth,
          renderHeight
        );
        // console.log('[SPRITE] Normal render - sourceX:', sourceX, 'frame:', this.currentFrame);
      } catch (error) {
        console.error('[SPRITE] DrawImage error:', error);
      }
    }
  }

  public renderDebug(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    if (!this.loaded) return;

    const renderWidth = width || this.frameWidth;
    const renderHeight = height || this.frameHeight;

    // Draw bounding box
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x), Math.round(y), renderWidth, renderHeight);

    // Draw animation info
    if (this.currentAnimation) {
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.fillText(`${this.currentAnimation}:${this.currentFrame}`, x, y - 5);
    }
  }

  public dispose(): void {
    this.image.src = "";
    this.loaded = false;
    this.animations = {};
  }

  // Utility methods
  public getFrameSize(): { width: number; height: number } {
    return { width: this.frameWidth, height: this.frameHeight };
  }

  public getImage(): HTMLImageElement {
    return this.image;
  }

  public getAnimationList(): string[] {
    return Object.keys(this.animations);
  }

  public isAnimationFinished(): boolean {
    if (!this.currentAnimation) return true;

    const animation = this.animations[this.currentAnimation];
    if (!animation) return true;

    return !animation.loop && this.currentFrame >= animation.frameCount - 1;
  }
}
