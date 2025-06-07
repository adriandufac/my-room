// src/game/entities/Platform.ts

import { Vector2D } from "../physics/Vector2D";
import { GAME_CONFIG } from "../utils/Constants";

export class Platform {
  public position: Vector2D;
  public size: Vector2D;
  public color: string;
  public id: string;

  constructor(
    x: number,
    y: number,
    width: number = GAME_CONFIG.PLATFORMS.DEFAULT_WIDTH,
    height: number = GAME_CONFIG.PLATFORMS.DEFAULT_HEIGHT
  ) {
    this.position = new Vector2D(x, y);
    this.size = new Vector2D(width, height);
    this.color = GAME_CONFIG.PLATFORMS.COLOR;
    this.id = `platform_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  public update(deltaTime: number): void {
    // Pour l'instant, les plateformes sont statiques
    // Cette méthode sera utilisée plus tard pour les plateformes mobiles
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Rendu de base de la plateforme
    ctx.fillStyle = this.color;
    ctx.fillRect(
      Math.round(this.position.x),
      Math.round(this.position.y),
      this.size.x,
      this.size.y
    );

    // Bordure pour plus de visibilité
    ctx.strokeStyle = "#654321"; // Marron plus foncé
    ctx.lineWidth = 2;
    ctx.strokeRect(
      Math.round(this.position.x),
      Math.round(this.position.y),
      this.size.x,
      this.size.y
    );

    // Debug : afficher la boîte de collision
    if (GAME_CONFIG.DEBUG.SHOW_COLLISION_BOXES) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        this.position.x,
        this.position.y,
        this.size.x,
        this.size.y
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

  public setPosition(x: number, y: number): void {
    this.position.set(x, y);
  }

  public setSize(width: number, height: number): void {
    this.size.set(width, height);
  }

  public contains(x: number, y: number): boolean {
    return (
      x >= this.position.x &&
      x <= this.position.x + this.size.x &&
      y >= this.position.y &&
      y <= this.position.y + this.size.y
    );
  }
}
