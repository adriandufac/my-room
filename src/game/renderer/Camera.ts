// src/game/renderer/Camera.ts

import { Vector2D } from "../physics/Vector2D";
import { Player } from "../entities/Player";
import { GAME_CONFIG } from "../utils/Constants";

export class Camera {
  public position: Vector2D;
  private target: Vector2D;
  private smoothness: number;
  private viewportWidth: number;
  private viewportHeight: number;
  private levelWidth: number;
  private levelHeight: number;
  private offsetX: number;
  private offsetY: number;
  private boundsMargin: number;

  constructor(
    viewportWidth: number,
    viewportHeight: number,
    levelWidth: number = GAME_CONFIG.LEVEL.DEFAULT_WIDTH,
    levelHeight: number = GAME_CONFIG.LEVEL.DEFAULT_HEIGHT
  ) {
    this.position = new Vector2D(0, 0);
    this.target = new Vector2D(0, 0);
    this.smoothness = GAME_CONFIG.CAMERA.FOLLOW_SMOOTHNESS;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.levelWidth = levelWidth;
    this.levelHeight = levelHeight;
    this.offsetX = GAME_CONFIG.CAMERA.OFFSET_X;
    this.offsetY = GAME_CONFIG.CAMERA.OFFSET_Y;
    this.boundsMargin = GAME_CONFIG.CAMERA.BOUNDS_MARGIN;
  }

  /**
   * Met à jour la position de la caméra pour suivre le joueur
   */
  public update(player: Player, deltaTime: number): void {
    // Calculer la position cible basée sur la position du joueur
    this.calculateTargetPosition(player);

    // Appliquer le lissage pour un mouvement fluide
    this.applySmoothFollow(deltaTime);

    // Contraindre la caméra aux limites du niveau
    this.constrainToBounds();
  }

  /**
   * Calcule la position cible de la caméra basée sur la position du joueur
   */
  private calculateTargetPosition(player: Player): void {
    // Centrer la caméra sur le joueur avec un décalage
    const playerCenterX = player.position.x + player.size.x / 2;
    const playerCenterY = player.position.y + player.size.y / 2;

    // Position cible avec décalage
    this.target.x = playerCenterX - this.offsetX;
    this.target.y = playerCenterY - this.offsetY;

    // Ajustement vertical dynamique basé sur la vélocité du joueur
    // Si le joueur tombe vite, anticiper légèrement vers le bas
    if (player.velocity.y > 100) {
      this.target.y += player.velocity.y * 0.1;
    }
    // Si le joueur monte vite, anticiper légèrement vers le haut
    else if (player.velocity.y < -100) {
      this.target.y += player.velocity.y * 0.05;
    }
  }

  /**
   * Applique le lissage pour un mouvement fluide de la caméra
   */
  private applySmoothFollow(deltaTime: number): void {
    // Interpolation linéaire (lerp) pour un mouvement fluide
    const lerpFactor = Math.min(this.smoothness * deltaTime * 10, 1);

    this.position.x += (this.target.x - this.position.x) * lerpFactor;
    this.position.y += (this.target.y - this.position.y) * lerpFactor;
  }

  /**
   * Contraint la caméra aux limites du niveau
   */
  private constrainToBounds(): void {
    // Limites horizontales
    const minX = -this.boundsMargin;
    const maxX = this.levelWidth - this.viewportWidth + this.boundsMargin;

    this.position.x = Math.max(minX, Math.min(maxX, this.position.x));

    // Limites verticales
    const minY = -this.boundsMargin;
    const maxY = this.levelHeight - this.viewportHeight + this.boundsMargin;

    this.position.y = Math.max(minY, Math.min(maxY, this.position.y));
  }

  /**
   * Convertit les coordonnées du monde en coordonnées écran
   */
  public worldToScreen(worldX: number, worldY: number): Vector2D {
    return new Vector2D(worldX - this.position.x, worldY - this.position.y);
  }

  /**
   * Convertit les coordonnées écran en coordonnées du monde
   */
  public screenToWorld(screenX: number, screenY: number): Vector2D {
    return new Vector2D(screenX + this.position.x, screenY + this.position.y);
  }

  /**
   * Vérifie si un objet est visible à l'écran (culling)
   */
  public isVisible(
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    const screenPos = this.worldToScreen(x, y);

    return !(
      screenPos.x + width < 0 ||
      screenPos.x > this.viewportWidth ||
      screenPos.y + height < 0 ||
      screenPos.y > this.viewportHeight
    );
  }

  /**
   * Applique la transformation de la caméra au contexte de rendu
   */
  public applyTransform(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(-this.position.x, -this.position.y);
  }

  /**
   * Retire la transformation de la caméra du contexte de rendu
   */
  public removeTransform(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  /**
   * Met à jour les dimensions du niveau pour la caméra
   */
  public updateLevelBounds(levelWidth: number, levelHeight: number): void {
    this.levelWidth = levelWidth;
    this.levelHeight = levelHeight;
  }

  /**
   * Centre immédiatement la caméra sur le joueur (sans lissage)
   */
  public snapToPlayer(player: Player): void {
    this.calculateTargetPosition(player);
    this.position.x = this.target.x;
    this.position.y = this.target.y;
    this.constrainToBounds();
  }

  /**
   * Définit les dimensions du niveau
   */
  public setLevelBounds(width: number, height: number): void {
    this.levelWidth = width;
    this.levelHeight = height;
  }

  /**
   * Définit les dimensions du viewport
   */
  public setViewportSize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Modifie les paramètres de suivi de la caméra
   */
  public setSmoothness(smoothness: number): void {
    this.smoothness = Math.max(0, Math.min(1, smoothness));
  }

  /**
   * Modifie les décalages de la caméra
   */
  public setOffset(offsetX: number, offsetY: number): void {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  /**
   * Obtient les limites visibles de la caméra dans le monde
   */
  public getVisibleBounds(): {
    left: number;
    right: number;
    top: number;
    bottom: number;
  } {
    return {
      left: this.position.x,
      right: this.position.x + this.viewportWidth,
      top: this.position.y,
      bottom: this.position.y + this.viewportHeight,
    };
  }

  /**
   * Vérifie si la caméra est aux limites du niveau
   */
  public isAtBounds(): {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
  } {
    const tolerance = 1; // Petite tolérance pour les erreurs de flottant

    return {
      left: this.position.x <= -this.boundsMargin + tolerance,
      right:
        this.position.x >=
        this.levelWidth - this.viewportWidth + this.boundsMargin - tolerance,
      top: this.position.y <= -this.boundsMargin + tolerance,
      bottom:
        this.position.y >=
        this.levelHeight - this.viewportHeight + this.boundsMargin - tolerance,
    };
  }

  /**
   * Méthodes de debug
   */
  public getDebugInfo(): {
    position: Vector2D;
    target: Vector2D;
    bounds: { left: number; right: number; top: number; bottom: number };
    atBounds: { left: boolean; right: boolean; top: boolean; bottom: boolean };
  } {
    return {
      position: this.position.clone(),
      target: this.target.clone(),
      bounds: this.getVisibleBounds(),
      atBounds: this.isAtBounds(),
    };
  }

  /**
   * Rendu des informations de debug de la caméra
   */
  public renderDebug(ctx: CanvasRenderingContext2D): void {
    if (!GAME_CONFIG.DEBUG.SHOW_CAMERA_BOUNDS) return;

    ctx.save();

    // Dessiner les limites de la caméra
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.viewportWidth, this.viewportHeight);

    // Dessiner le centre de la caméra
    const centerX = this.viewportWidth / 2;
    const centerY = this.viewportHeight / 2;

    ctx.fillStyle = "red";
    ctx.fillRect(centerX - 2, centerY - 2, 4, 4);

    // Afficher les informations de position
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText(
      `Camera: (${Math.round(this.position.x)}, ${Math.round(
        this.position.y
      )})`,
      10,
      this.viewportHeight - 40
    );
    ctx.fillText(
      `Target: (${Math.round(this.target.x)}, ${Math.round(this.target.y)})`,
      10,
      this.viewportHeight - 25
    );

    ctx.restore();
  }
}
