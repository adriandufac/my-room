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

  // Nouvelles propriétés pour le contrôle aérien - valeurs directes
  private jumpDirection: number = 0; // Direction du saut initial (-1, 0, 1)
  private airControlAcceleration: number = 6.0; // Force directe d'accélération en l'air
  private airControlDeceleration: number = 10.0; // Force directe de décélération en l'air

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

    // Appliquer la friction selon l'état
    if (this.isOnGround) {
      // Au sol : friction normale (comme avant)
      this.velocity.x *= GAME_CONFIG.PHYSICS.FRICTION;
    } else {
      // En l'air : très peu de friction
      this.velocity.x *= 0.995;
    }

    // Arrêter les micro-mouvements
    if (Math.abs(this.velocity.x) < 0.1) {
      this.velocity.x = 0;
    }

    // Réinitialiser la direction de saut quand on atterrit
    if (this.isOnGround && this.isJumping) {
      this.isJumping = false;
      this.jumpDirection = 0;
      console.log("🦶 Atterrissage - réinitialisation du saut");
    }
  }

  public moveLeft(): void {
    if (this.isOnGround) {
      // Mouvement normal au sol - contrôle total
      this.velocity.x = -GAME_CONFIG.PLAYER.SPEED;
    } else {
      // En l'air - contrôle très limité
      this.applyAirControl(-1);
    }
  }

  public moveRight(): void {
    if (this.isOnGround) {
      // Mouvement normal au sol - contrôle total
      this.velocity.x = GAME_CONFIG.PLAYER.SPEED;
    } else {
      // En l'air - contrôle très limité
      this.applyAirControl(1);
    }
  }

  /**
   * Applique un contrôle aérien limité - version simplifiée
   */
  private applyAirControl(direction: number): void {
    const currentDirection = Math.sign(this.velocity.x);

    if (direction === currentDirection) {
      // Même direction : accélération
      this.velocity.x += direction * this.airControlAcceleration;
    } else {
      // Direction opposée : décélération plus forte
      this.velocity.x += direction * this.airControlDeceleration;
    }

    // Limiter la vitesse en l'air
    const maxAirSpeed = GAME_CONFIG.PLAYER.SPEED * 0.9;
    if (Math.abs(this.velocity.x) > maxAirSpeed) {
      this.velocity.x = Math.sign(this.velocity.x) * maxAirSpeed;
    }
  }

  public jump(inputDirection: number = 0): void {
    // Debug : afficher l'état complet
    console.log(
      `🔍 État du saut - isOnGround: ${this.isOnGround}, isJumping: ${
        this.isJumping
      }, velocity.y: ${this.velocity.y.toFixed(2)}`
    );

    // Vérification plus permissive pour éviter les blocages
    if (!this.isOnGround) {
      console.log(`❌ Saut refusé - Pas au sol`);
      return;
    }

    if (this.isJumping && this.velocity.y < -50) {
      // Seulement si on monte encore
      console.log(`❌ Saut refusé - Déjà en train de sauter`);
      return;
    }

    console.log(`🦘 Saut autorisé avec direction: ${inputDirection}`);

    // Saut vertical
    this.velocity.y = -GAME_CONFIG.PLAYER.JUMP_POWER;

    // Impulsion horizontale selon l'input
    if (inputDirection !== 0) {
      // Saut directionnel - impulsion forte
      const horizontalImpulse = GAME_CONFIG.PLAYER.SPEED * 0.8;
      this.velocity.x = inputDirection * horizontalImpulse;
      this.jumpDirection = inputDirection;
      console.log(
        `🎯 Saut directionnel: ${inputDirection}, vitesse: ${this.velocity.x}`
      );
    } else {
      // Saut neutre - garde la vitesse actuelle mais réduite
      this.velocity.x *= 0.7;
      this.jumpDirection = 0;
      console.log(`⬆️ Saut neutre, vitesse conservée: ${this.velocity.x}`);
    }

    // Marquer comme en saut
    this.isOnGround = false;
    this.isJumping = true;
  }

  public stopHorizontalMovement(): void {
    if (this.isOnGround) {
      // Au sol : arrêt immédiat comme avant
      this.velocity.x = 0;
    } else {
      // En l'air : très légère décélération
      this.velocity.x *= 0.998;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Couleur différente selon l'état
    let playerColor = this.color;
    if (this.isJumping) {
      playerColor = "#FF6666"; // Rouge clair en saut
    } else if (!this.isOnGround) {
      playerColor = "#FF8888"; // Rouge encore plus clair si en l'air sans avoir sauté
    }

    ctx.fillStyle = playerColor;
    ctx.fillRect(
      Math.round(this.position.x),
      Math.round(this.position.y),
      this.size.x,
      this.size.y
    );

    // Indicateur d'état au sol
    if (this.isOnGround) {
      ctx.fillStyle = "green";
      ctx.fillRect(
        this.position.x + 2,
        this.position.y + this.size.y - 4,
        this.size.x - 4,
        2
      );
    }

    // Indicateur de direction de saut
    if (this.isJumping && this.jumpDirection !== 0) {
      ctx.fillStyle = "white";
      const arrowX =
        this.position.x + (this.jumpDirection > 0 ? this.size.x - 8 : 4);
      const arrowY = this.position.y + 4;

      ctx.fillRect(arrowX, arrowY, 4, 2);
      ctx.fillRect(
        arrowX + (this.jumpDirection > 0 ? -2 : 4),
        arrowY - 1,
        2,
        4
      );
    }

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

    // Debug : afficher la boîte de collision avec couleur selon l'état
    if (GAME_CONFIG.DEBUG.SHOW_COLLISION_BOXES) {
      if (this.isOnGround) {
        ctx.strokeStyle = "green"; // Vert = au sol
      } else if (this.isJumping) {
        ctx.strokeStyle = "cyan"; // Cyan = en saut
      } else {
        ctx.strokeStyle = "red"; // Rouge = en l'air (chute)
      }
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

      // Afficher la direction de saut
      if (this.isJumping && this.jumpDirection !== 0) {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + this.jumpDirection * 20, centerY);
        ctx.stroke();
      }
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

  // Nouvelles méthodes pour le debug et réglages
  public getJumpDirection(): number {
    return this.jumpDirection;
  }

  public isInAir(): boolean {
    return !this.isOnGround;
  }

  public forceGroundState(onGround: boolean): void {
    this.isOnGround = onGround;
    if (onGround) {
      this.isJumping = false;
      this.jumpDirection = 0;
    }
  }

  // Méthodes pour ajuster le contrôle aérien facilement
  public setAirControlAcceleration(value: number): void {
    this.airControlAcceleration = value;
    console.log(`🎮 Contrôle aérien - Accélération: ${value}`);
  }

  public setAirControlDeceleration(value: number): void {
    this.airControlDeceleration = value;
    console.log(`🎮 Contrôle aérien - Décélération: ${value}`);
  }

  public getAirControlValues(): { acceleration: number; deceleration: number } {
    return {
      acceleration: this.airControlAcceleration,
      deceleration: this.airControlDeceleration,
    };
  }

  public getDebugInfo(): string {
    return `Player - Pos: (${Math.round(this.position.x)}, ${Math.round(
      this.position.y
    )}) - Vel: (${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(
      1
    )}) - OnGround: ${this.isOnGround} - Jumping: ${
      this.isJumping
    } - JumpDir: ${this.jumpDirection} - AirControl: ${
      this.airControlAcceleration
    }/${this.airControlDeceleration}`;
  }
}
