// src/game/entities/Player.ts

import { Vector2D } from "../physics/Vector2D";
import { GAME_CONFIG } from "../utils/Constants";

export class Player {
  public position: Vector2D;
  public velocity: Vector2D;
  public size: Vector2D;
  public color: string;
  public isOnGround: boolean;
  public isJumping: boolean;

  constructor(x: number, y: number) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.size = new Vector2D(
      GAME_CONFIG.PLAYER.WIDTH,
      GAME_CONFIG.PLAYER.HEIGHT
    );
    this.color = GAME_CONFIG.PLAYER.COLOR;
    this.isOnGround = false;
    this.isJumping = false;
  }

  public update(deltaTime: number): void {
    // Appliquer la gravité
    if (!this.isOnGround) {
      this.velocity.y += GAME_CONFIG.PHYSICS.GRAVITY * deltaTime;
    }

    // Limiter la vitesse de chute
    if (this.velocity.y > GAME_CONFIG.PHYSICS.MAX_FALL_SPEED) {
      this.velocity.y = GAME_CONFIG.PHYSICS.MAX_FALL_SPEED;
    }

    // Mettre à jour la position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Friction horizontale
    this.velocity.x *= GAME_CONFIG.PHYSICS.FRICTION;

    // Arrêter les micro-mouvements
    if (Math.abs(this.velocity.x) < 0.1) {
      this.velocity.x = 0;
    }
  }

  public moveLeft(): void {
    this.velocity.x = -GAME_CONFIG.PLAYER.SPEED;
  }

  public moveRight(): void {
    this.velocity.x = GAME_CONFIG.PLAYER.SPEED;
  }

  public jump(): void {
    if (this.isOnGround && !this.isJumping) {
      this.velocity.y = -GAME_CONFIG.PLAYER.JUMP_POWER;
      this.isOnGround = false;
      this.isJumping = true;
    }
  }

  public stopHorizontalMovement(): void {
    // Arrêt progressif grâce à la friction appliquée dans update()
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      Math.round(this.position.x),
      Math.round(this.position.y),
      this.size.x,
      this.size.y
    );

    // Debug : afficher un point au centre
    if (GAME_CONFIG.DEBUG.SHOW_PLAYER_CENTER) {
      ctx.fillStyle = "white";
      ctx.fillRect(
        Math.round(this.position.x + this.size.x / 2 - 2),
        Math.round(this.position.y + this.size.y / 2 - 2),
        4,
        4
      );
    }

    // Debug : afficher la boîte de collision
    if (GAME_CONFIG.DEBUG.SHOW_COLLISION_BOXES) {
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        Math.round(this.position.x),
        Math.round(this.position.y),
        this.size.x,
        this.size.y
      );
    }

    // Debug : afficher le vecteur de vélocité
    if (GAME_CONFIG.DEBUG.SHOW_VELOCITY_VECTORS) {
      const centerX = this.position.x + this.size.x / 2;
      const centerY = this.position.y + this.size.y / 2;

      ctx.strokeStyle = "cyan";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + this.velocity.x * 0.1,
        centerY + this.velocity.y * 0.1
      );
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

  // Méthodes utiles pour le debug et les tests
  public setPosition(x: number, y: number): void {
    this.position.set(x, y);
  }

  public setVelocity(x: number, y: number): void {
    this.velocity.set(x, y);
  }

  public getCenter(): Vector2D {
    return new Vector2D(
      this.position.x + this.size.x / 2,
      this.position.y + this.size.y / 2
    );
  }

  public getBottom(): number {
    return this.position.y + this.size.y;
  }

  public getRight(): number {
    return this.position.x + this.size.x;
  }
}
