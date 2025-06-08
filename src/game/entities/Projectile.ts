// src/game/entities/Projectile.ts

import { Vector2D } from "../physics/Vector2D";
import { GAME_CONFIG } from "../utils/Constants";

export class Projectile {
  public position: Vector2D;
  public velocity: Vector2D;
  public size: Vector2D;
  public color: string;
  public id: string;

  // Propriétés de gameplay
  public isActive: boolean = true;
  public canDealDamage: boolean = true;
  private lifeTime: number = 0;
  private maxLifeTime: number;

  // Propriétés visuelles
  private rotation: number = 0;
  private rotationSpeed: number = 5; // radians par seconde

  constructor(x: number, y: number, direction: number = 1) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(
      direction * GAME_CONFIG.PROJECTILES.SPEED,
      0
    );
    this.size = new Vector2D(
      GAME_CONFIG.PROJECTILES.WIDTH,
      GAME_CONFIG.PROJECTILES.HEIGHT
    );
    this.color = GAME_CONFIG.PROJECTILES.COLOR;
    this.maxLifeTime = GAME_CONFIG.PROJECTILES.LIFETIME / 1000; // Convertir en secondes
    this.id = `projectile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(
      `=€ Projectile créé à (${x}, ${y}) direction: ${direction > 0 ? "DROITE" : "GAUCHE"}`
    );
  }

  public update(deltaTime: number): void {
    if (!this.isActive) return;

    // Mettre à jour le temps de vie
    this.lifeTime += deltaTime;
    
    // Vérifier si le projectile a dépassé sa durée de vie
    if (this.lifeTime >= this.maxLifeTime) {
      this.destroy();
      return;
    }

    // Mettre à jour la rotation pour l'effet visuel
    this.rotation += this.rotationSpeed * deltaTime;

    // Mettre à jour la position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const centerX = this.position.x + this.size.x / 2;
    const centerY = this.position.y + this.size.y / 2;

    // Sauvegarder le contexte pour la rotation
    ctx.save();

    // Translater vers le centre du projectile et appliquer la rotation
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);

    // Dessiner le projectile comme un carré orange rotatif
    ctx.fillStyle = this.color;
    ctx.fillRect(
      -this.size.x / 2,
      -this.size.y / 2,
      this.size.x,
      this.size.y
    );

    // Bordure plus foncée
    ctx.strokeStyle = "#CC5500";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      -this.size.x / 2,
      -this.size.y / 2,
      this.size.x,
      this.size.y
    );

    // Petit point central pour l'effet visuel
    ctx.fillStyle = "#FFAA00";
    ctx.fillRect(-1, -1, 2, 2);

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

      // Afficher le temps de vie restant
      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      const timeLeft = (this.maxLifeTime - this.lifeTime).toFixed(1);
      ctx.fillText(
        timeLeft + "s",
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
    console.log(`=¥ Projectile ${this.id.slice(-8)} détruit`);
  }

  public dealDamage(): boolean {
    if (this.canDealDamage && this.isActive) {
      // Un projectile ne peut infliger des dégâts qu'une seule fois
      this.canDealDamage = false;
      return true;
    }
    return false;
  }

  // Vérifier si le projectile est hors des limites du niveau
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

      // Vérification AABB simple
      if (
        projectileBounds.x < platformBounds.x + platformBounds.width &&
        projectileBounds.x + projectileBounds.width > platformBounds.x &&
        projectileBounds.y < platformBounds.y + platformBounds.height &&
        projectileBounds.y + projectileBounds.height > platformBounds.y
      ) {
        console.log(`=¥ Projectile ${this.id.slice(-8)} touché une plateforme`);
        this.destroy();
        return true;
      }
    }

    return false;
  }

  // Informations de debug
  public getDebugInfo(): string {
    const timeLeft = (this.maxLifeTime - this.lifeTime).toFixed(1);
    return `Projectile ${this.id.slice(-8)} - Pos: (${Math.round(
      this.position.x
    )}, ${Math.round(this.position.y)}) - Speed: ${Math.round(
      this.velocity.x
    )} - Time: ${timeLeft}s - Active: ${this.isActive}`;
  }

  // Propriétés pour l'accès externe
  public getLifeTimeProgress(): number {
    return this.lifeTime / this.maxLifeTime;
  }

  public getRemainingLifeTime(): number {
    return Math.max(0, this.maxLifeTime - this.lifeTime);
  }

  public getDirection(): number {
    return this.velocity.x > 0 ? 1 : -1;
  }

  // Méthode pour modifier la vitesse (utile pour des effets spéciaux)
  public setVelocity(x: number, y: number): void {
    this.velocity.set(x, y);
  }

  // Méthode pour ajouter une force (gravité, vent, etc.)
  public addForce(force: Vector2D, deltaTime: number): void {
    this.velocity.x += force.x * deltaTime;
    this.velocity.y += force.y * deltaTime;
  }
}