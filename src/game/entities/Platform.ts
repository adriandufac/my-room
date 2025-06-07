// src/game/entities/Platform.ts

import { Vector2D } from "../physics/Vector2D";
import { GAME_CONFIG } from "../utils/Constants";

export class Platform {
  public position: Vector2D;
  public size: Vector2D;
  public color: string;
  public isStatic: boolean = true;

  constructor(x: number, y: number, width?: number, height?: number) {
    this.position = new Vector2D(x, y);
    this.size = new Vector2D(
      width || GAME_CONFIG.PLATFORMS.DEFAULT_WIDTH,
      height || GAME_CONFIG.PLATFORMS.DEFAULT_HEIGHT
    );
    this.color = GAME_CONFIG.PLATFORMS.COLOR;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      Math.round(this.position.x),
      Math.round(this.position.y),
      this.size.x,
      this.size.y
    );

    // Debug : contour pour mieux voir les plateformes
    if (GAME_CONFIG.DEBUG.SHOW_COLLISION_BOXES) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        Math.round(this.position.x),
        Math.round(this.position.y),
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

  // Vérifie si un point est à l'intérieur de la plateforme
  public containsPoint(x: number, y: number): boolean {
    return (
      x >= this.position.x &&
      x <= this.position.x + this.size.x &&
      y >= this.position.y &&
      y <= this.position.y + this.size.y
    );
  }

  // Vérifie l'intersection avec un rectangle
  public intersects(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    return !(
      bounds.x + bounds.width < this.position.x ||
      this.position.x + this.size.x < bounds.x ||
      bounds.y + bounds.height < this.position.y ||
      this.position.y + this.size.y < bounds.y
    );
  }
}
