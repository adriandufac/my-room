// src/game/entities/Enemy.ts

import { Vector2D } from "../physics/Vector2D";
import { GAME_CONFIG } from "../utils/Constants";
import { SpriteRenderer } from "../graphics/SpriteRenderer";
import { getSpriteConfig } from "../graphics/SpriteConfigs";

export class Enemy {
  public position: Vector2D;
  public velocity: Vector2D;
  public size: Vector2D;
  public color: string;
  public id: string;

  // Propriétés de mouvement
  private patrolStartX: number;
  private patrolEndX: number;
  private direction: number = 1; // 1 pour droite, -1 pour gauche
  private speed: number;

  // Propriétés de gameplay
  public isAlive: boolean = true;
  public canBeEliminated: boolean = true;

  // Sprite rendering
  private spriteRenderer: SpriteRenderer | null = null;
  private useSprite: boolean = true;

  constructor(
    x: number,
    y: number,
    patrolDistance: number = GAME_CONFIG.ENEMIES.PATROL_DISTANCE
  ) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.size = new Vector2D(
      GAME_CONFIG.ENEMIES.WIDTH,
      GAME_CONFIG.ENEMIES.HEIGHT
    );
    this.color = GAME_CONFIG.ENEMIES.COLOR;
    this.speed = GAME_CONFIG.ENEMIES.SPEED;
    this.id = `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Définir la zone de patrouille
    this.patrolStartX = x - patrolDistance / 2;
    this.patrolEndX = x + patrolDistance / 2;

    // Initialize sprite renderer
    const spriteConfig = getSpriteConfig("enemy");
    if (spriteConfig) {
      console.log("[ENEMY] Found sprite config:", spriteConfig);
      this.spriteRenderer = new SpriteRenderer(spriteConfig);
      this.spriteRenderer.setAnimation("walk");
      console.log("[ENEMY] Sprite renderer initialized, animation set to 'walk'");
      
      // Add a temporary image to check dimensions
      const tempImg = new Image();
      tempImg.onload = () => {
        console.log(`[ENEMY] ennemie.png natural size: ${tempImg.naturalWidth}x${tempImg.naturalHeight}`);
      };
      tempImg.src = "/textures/sprites/ennemie.png";
    } else {
      console.warn("[ENEMY] No sprite config found, using fallback rendering");
      this.useSprite = false;
    }

    console.log(
      `[ENEMY] Created at (${x}, ${y}) - Patrol: ${this.patrolStartX} to ${this.patrolEndX}`
    );
  }

  public update(deltaTime: number): void {
    if (!this.isAlive) return;

    // Update sprite animation
    if (this.spriteRenderer) {
      this.spriteRenderer.update(deltaTime);
    }

    // Appliquer la gravité
    this.velocity.y += GAME_CONFIG.PHYSICS.GRAVITY * deltaTime;

    // Limiter la vitesse de chute
    if (this.velocity.y > GAME_CONFIG.PHYSICS.MAX_FALL_SPEED) {
      this.velocity.y = GAME_CONFIG.PHYSICS.MAX_FALL_SPEED;
    }

    // Mouvement horizontal de patrouille
    this.updatePatrolMovement();

    // Mettre à jour la position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  private updatePatrolMovement(): void {
    // Définir la vitesse horizontale selon la direction
    this.velocity.x = this.direction * this.speed;

    // Vérifier les limites de patrouille et changer de direction
    if (
      this.direction > 0 &&
      this.position.x + this.size.x >= this.patrolEndX
    ) {
      this.direction = -1;
      this.position.x = this.patrolEndX - this.size.x; // Corriger la position
    } else if (this.direction < 0 && this.position.x <= this.patrolStartX) {
      this.direction = 1;
      this.position.x = this.patrolStartX; // Corriger la position
    }
  }

  public checkPlatformEdge(platforms: any[]): void {
    if (!this.isAlive) return;

    // Vérifier s'il y a encore une plateforme devant l'ennemi
    const futureX =
      this.position.x + (this.direction > 0 ? this.size.x + 5 : -5);
    const footY = this.position.y + this.size.y + 5; // Un peu en dessous des pieds

    let hasGroundAhead = false;

    for (const platform of platforms) {
      const platformBounds = platform.getBounds();

      // Vérifier si il y a une plateforme sous la position future
      if (
        futureX >= platformBounds.x &&
        futureX <= platformBounds.x + platformBounds.width &&
        footY >= platformBounds.y &&
        footY <= platformBounds.y + platformBounds.height + 10
      ) {
        hasGroundAhead = true;
        break;
      }
    }

    // Si pas de sol devant, faire demi-tour
    if (!hasGroundAhead) {
      this.direction *= -1;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive) return;

    console.log(`[ENEMY] Render - useSprite: ${this.useSprite}, spriteRenderer: ${!!this.spriteRenderer}, loaded: ${this.spriteRenderer?.isLoaded()}, animation: ${this.spriteRenderer?.getCurrentAnimation()}`);

    if (this.useSprite && this.spriteRenderer && this.spriteRenderer.isLoaded() && this.spriteRenderer.getCurrentAnimation()) {
      // Handle sprite flipping based on direction
      if (this.direction < 0) {
        // Flip horizontally for left movement
        ctx.save();
        ctx.scale(-1, 1);
        this.spriteRenderer.render(
          ctx,
          -(this.position.x + this.size.x), // Adjusted X for flip
          this.position.y,
          this.size.x,
          this.size.y
        );
        ctx.restore();
      } else {
        // Normal rendering for right movement
        this.spriteRenderer.render(
          ctx,
          this.position.x,
          this.position.y,
          this.size.x,
          this.size.y
        );
      }
    } else {
      // Fallback: render as colored rectangle
      console.log(`[ENEMY] Rendering fallback rectangle`);
      ctx.fillStyle = this.color;
      ctx.fillRect(
        Math.round(this.position.x),
        Math.round(this.position.y),
        this.size.x,
        this.size.y
      );

      // Bordure plus foncée
      ctx.strokeStyle = "#CC4400";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        Math.round(this.position.x),
        Math.round(this.position.y),
        this.size.x,
        this.size.y
      );
    }

    // Debug : afficher la zone de patrouille et hitbox
    if (GAME_CONFIG.DEBUG.SHOW_COLLISION_BOXES) {
      ctx.strokeStyle = "orange";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        this.position.x,
        this.position.y,
        this.size.x,
        this.size.y
      );

      // Ligne de patrouille
      ctx.strokeStyle = "yellow";
      ctx.beginPath();
      ctx.moveTo(this.patrolStartX, this.position.y + this.size.y + 5);
      ctx.lineTo(this.patrolEndX, this.position.y + this.size.y + 5);
      ctx.stroke();
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

  public eliminate(): void {
    if (this.canBeEliminated) {
      this.isAlive = false;
      console.log(`💥 Ennemi ${this.id} éliminé!`);
    }
  }

  public dealDamage(): boolean {
    return this.isAlive;
  }

  // Méthode pour vérifier si l'ennemi est sur une plateforme
  public isOnPlatform(platforms: any[]): boolean {
    const enemyBottom = this.position.y + this.size.y;
    const enemyLeft = this.position.x;
    const enemyRight = this.position.x + this.size.x;

    for (const platform of platforms) {
      const platformBounds = platform.getBounds();

      // Vérifier si l'ennemi est au-dessus de cette plateforme
      if (
        enemyLeft < platformBounds.x + platformBounds.width &&
        enemyRight > platformBounds.x &&
        enemyBottom >= platformBounds.y &&
        enemyBottom <= platformBounds.y + 10
      ) {
        // 10px de tolérance
        return true;
      }
    }

    return false;
  }

  // Méthode pour ajuster la position après résolution de collision
  public resolveCollision(
    side: "top" | "bottom" | "left" | "right",
    penetration: Vector2D
  ): void {
    switch (side) {
      case "top":
        // Ennemi atterrit sur une plateforme
        this.position.y += penetration.y;
        this.velocity.y = 0;
        break;
      case "bottom":
        // Ennemi heurte une plateforme par en dessous
        this.position.y += penetration.y;
        this.velocity.y = 0;
        break;
      case "left":
      case "right":
        // Collision latérale - faire demi-tour
        this.position.x += penetration.x;
        this.velocity.x = 0;
        this.direction *= -1;
        break;
    }
  }

  // Utilitaires pour l'éditeur
  public setPosition(x: number, y: number): void {
    this.position.set(x, y);
    // Recalculer la zone de patrouille
    const patrolDistance = this.patrolEndX - this.patrolStartX;
    this.patrolStartX = x - patrolDistance / 2;
    this.patrolEndX = x + patrolDistance / 2;
  }

  public setPatrolDistance(distance: number): void {
    const centerX = this.position.x + this.size.x / 2;
    this.patrolStartX = centerX - distance / 2;
    this.patrolEndX = centerX + distance / 2;
  }

  // Méthode pour obtenir des informations de debug
  public getDebugInfo(): string {
    return `Enemy ${this.id.slice(-8)} - Pos: (${Math.round(
      this.position.x
    )}, ${Math.round(this.position.y)}) - Dir: ${
      this.direction > 0 ? "RIGHT" : "LEFT"
    } - Alive: ${this.isAlive}`;
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
