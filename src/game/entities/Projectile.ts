// src/game/entities/Projectile.ts

import { Vector2D } from "../physics/Vector2D";
import { GAME_CONFIG } from "../utils/Constants";
import { SpriteRenderer } from "../graphics/SpriteRenderer";
import { getSpriteConfig } from "../graphics/SpriteConfigs";

export class Projectile {
  public position: Vector2D;
  public velocity: Vector2D;
  public size: Vector2D;
  public color: string;
  public id: string;

  // Proprietes de gameplay
  public isActive: boolean = true;
  public canDealDamage: boolean = true;
  private direction: number = 1; // 1 = droite, -1 = gauche (pour le flip du sprite)

  // Proprietes visuelles et direction
  private angle: number = 0; // Angle de tir en radians (0 = horizontal droite)
  private autoRotate: boolean = false; // Pour les projectiles qui tournent (ex: boomerang)

  // Sprite rendering
  private spriteRenderer: SpriteRenderer | null = null;
  private useSprite: boolean = true;

  constructor(x: number, y: number, direction: number = 1, angle: number = 0) {
    this.position = new Vector2D(x, y);
    this.angle = angle;
    this.direction = direction;
    
    // Calculate velocity based on direction and angle to match editor visualization
    const speed = GAME_CONFIG.PROJECTILES.SPEED;
    const finalAngle = direction > 0 ? angle : Math.PI + angle; // Match editor logic
    this.velocity = new Vector2D(
      speed * Math.cos(finalAngle),
      speed * Math.sin(finalAngle) // Positive for canvas coordinates (Y increases downward)
    );
    this.size = new Vector2D(
      GAME_CONFIG.PROJECTILES.WIDTH,
      GAME_CONFIG.PROJECTILES.HEIGHT
    );
    this.color = GAME_CONFIG.PROJECTILES.COLOR;
    this.id = `projectile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize sprite renderer
    const spriteConfig = getSpriteConfig("projectile");
    if (spriteConfig) {
      this.spriteRenderer = new SpriteRenderer(spriteConfig);
      this.spriteRenderer.setAnimation("default");
      console.log("[PROJECTILE] Sprite renderer initialized");
    } else {
      console.warn("[PROJECTILE] No sprite config found, using fallback rendering");
      this.useSprite = false;
    }

    console.log(
      `[PROJECTILE] Created at (${x}, ${y}) direction: ${direction > 0 ? "RIGHT" : "LEFT"}`
    );
  }

  public update(deltaTime: number): void {
    if (!this.isActive) return;

    // Update sprite animation
    if (this.spriteRenderer) {
      this.spriteRenderer.update(deltaTime);
    }

    // Note: Projectiles no longer have a lifetime
    // They only die from collisions or going out of bounds

    // Optional auto-rotation for special projectiles (disabled by default)
    if (this.autoRotate) {
      this.angle += 5 * deltaTime; // 5 radians per second
    }

    // Mettre a jour la position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const centerX = this.position.x + this.size.x / 2;
    const centerY = this.position.y + this.size.y / 2;

    // Sauvegarder le contexte pour la rotation
    ctx.save();

    // Translater vers le centre du projectile et appliquer l'angle
    ctx.translate(centerX, centerY);
    ctx.rotate(this.angle);

    if (this.useSprite && this.spriteRenderer && this.spriteRenderer.isLoaded()) {
      // Handle sprite flipping for left-moving projectiles
      if (this.direction < 0) {
        // Flip horizontally for left movement
        ctx.scale(-1, 1);
        this.spriteRenderer.render(
          ctx,
          -this.size.x / 2,
          -this.size.y / 2,
          this.size.x,
          this.size.y
        );
      } else {
        // Normal rendering for right movement
        this.spriteRenderer.render(
          ctx,
          -this.size.x / 2,
          -this.size.y / 2,
          this.size.x,
          this.size.y
        );
      }
    } else {
      // Fallback: render as colored square
      ctx.fillStyle = this.color;
      ctx.fillRect(
        -this.size.x / 2,
        -this.size.y / 2,
        this.size.x,
        this.size.y
      );

      ctx.strokeStyle = "#CC5500";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        -this.size.x / 2,
        -this.size.y / 2,
        this.size.x,
        this.size.y
      );
    }

    // Restaurer le contexte
    ctx.restore();

    // Debug : afficher les informations du projectile
    if (GAME_CONFIG.DEBUG.SHOW_COLLISION_BOXES) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        this.position.x,
        this.position.y,
        this.size.x,
        this.size.y
      );

      // Afficher la direction et l'angle
      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.fillText(
        `Dir: ${this.direction > 0 ? "R" : "L"} Angle: ${(this.angle * 180 / Math.PI).toFixed(0)}°`,
        this.position.x,
        this.position.y - 5
      );
    }
  }

  public getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.size.x,
      height: this.size.y,
    };
  }

  public getCenter(): Vector2D {
    return new Vector2D(
      this.position.x + this.size.x / 2,
      this.position.y + this.size.y / 2
    );
  }

  public destroy(): void {
    this.isActive = false;
    this.canDealDamage = false;
    console.log(`[PROJECTILE] ${this.id} destroyed`);
  }

  public dealDamage(): boolean {
    if (this.canDealDamage && this.isActive) {
      this.canDealDamage = false; // Empecher les degats multiples
      return true;
    }
    return false;
  }

  // Methode pour verifier si le projectile est sorti de l'ecran
  public isOutOfBounds(levelWidth: number, levelHeight: number): boolean {
    return (
      this.position.x + this.size.x < 0 ||
      this.position.x > levelWidth ||
      this.position.y + this.size.y < 0 ||
      this.position.y > levelHeight + 100 // Un peu de marge vers le bas
    );
  }

  // Collision avec les plateformes (les projectiles disparaissent)
  public checkPlatformCollision(platforms: any[]): boolean {
    const projectileBounds = this.getBounds();

    for (const platform of platforms) {
      const platformBounds = platform.getBounds();

      // Verification AABB simple
      if (
        projectileBounds.x < platformBounds.x + platformBounds.width &&
        projectileBounds.x + projectileBounds.width > platformBounds.x &&
        projectileBounds.y < platformBounds.y + platformBounds.height &&
        projectileBounds.y + projectileBounds.height > platformBounds.y
      ) {
        console.log(`[PROJECTILE] ${this.id.slice(-8)} hit platform`);
        this.destroy();
        return true;
      }
    }

    return false;
  }

  // Utilitaires pour l'editeur
  public setPosition(x: number, y: number): void {
    this.position.set(x, y);
  }

  public setVelocity(x: number, y: number): void {
    this.velocity.set(x, y);
  }

  public setAngle(angle: number): void {
    this.angle = angle;
    // Recalculate velocity based on new angle to match editor visualization
    const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    const finalAngle = this.direction > 0 ? angle : Math.PI + angle; // Match editor logic
    this.velocity.set(
      speed * Math.cos(finalAngle),
      speed * Math.sin(finalAngle) // Positive for canvas coordinates (Y increases downward)
    );
  }

  public setAutoRotate(enabled: boolean): void {
    this.autoRotate = enabled;
  }

  public getAngle(): number {
    return this.angle;
  }

  // Methode pour obtenir des informations de debug
  public getDebugInfo(): string {
    return `Projectile ${this.id.slice(-8)} - Pos: (${Math.round(
      this.position.x
    )}, ${Math.round(this.position.y)}) - Vel: (${Math.round(
      this.velocity.x
    )}, ${Math.round(this.velocity.y)}) - Dir: ${this.direction} - Angle: ${(this.angle * 180 / Math.PI).toFixed(0)}°`;
  }

  public dispose(): void {
    if (this.spriteRenderer) {
      this.spriteRenderer.dispose();
      this.spriteRenderer = null;
    }
  }

  public isUsingSprite(): boolean {
    return this.useSprite && this.spriteRenderer !== null && this.spriteRenderer.isLoaded();
  }
}