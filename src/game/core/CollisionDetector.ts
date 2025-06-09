// src/game/core/CollisionDetector.ts

import { Player } from "../entities/Player";
import { Platform } from "../entities/Platform";
import { Vector2D } from "../physics/Vector2D";

export interface CollisionResult {
  hasCollision: boolean;
  side: "top" | "bottom" | "left" | "right" | null;
  penetration: Vector2D;
  platform: Platform | null;
}

export class CollisionDetector {
  private static readonly COLLISION_TOLERANCE = 0.1;

  /**
   * Détecte et retourne la collision la plus significative entre le joueur et les plateformes
   */
  public static checkPlayerPlatformCollision(
    player: Player,
    platforms: Platform[]
  ): CollisionResult {
    const playerBounds = player.getBounds();
    let bestCollision: CollisionResult = {
      hasCollision: false,
      side: null,
      penetration: new Vector2D(0, 0),
      platform: null,
    };

    let maxPenetration = 0;

    for (const platform of platforms) {
      const platformBounds = platform.getBounds();

      if (this.aabbIntersect(playerBounds, platformBounds)) {
        const collision = this.calculateCollisionDetails(
          playerBounds,
          platformBounds,
          platform,
          player
        );

        if (collision.hasCollision) {
          const penetrationMagnitude = collision.penetration.magnitude();

          // Priorité absolue aux collisions verticales si le joueur tombe
          if (player.velocity.y > 0 && collision.side === "top") {
            return collision;
          }

          // Sinon, prendre la collision avec la plus grande pénétration
          if (penetrationMagnitude > maxPenetration) {
            maxPenetration = penetrationMagnitude;
            bestCollision = collision;
          }
        }
      }
    }

    return bestCollision;
  }

  /**
   * Calcule les détails d'une collision spécifique
   */
  private static calculateCollisionDetails(
    playerBounds: { x: number; y: number; width: number; height: number },
    platformBounds: { x: number; y: number; width: number; height: number },
    platform: Platform,
    player: Player
  ): CollisionResult {
    // Calculer les chevauchements dans chaque direction
    const overlapLeft = playerBounds.x + playerBounds.width - platformBounds.x;
    const overlapRight =
      platformBounds.x + platformBounds.width - playerBounds.x;
    const overlapTop = playerBounds.y + playerBounds.height - platformBounds.y;
    const overlapBottom =
      platformBounds.y + platformBounds.height - playerBounds.y;

    // Vérifier que c'est une vraie intersection
    if (
      overlapLeft <= 0 ||
      overlapRight <= 0 ||
      overlapTop <= 0 ||
      overlapBottom <= 0
    ) {
      return {
        hasCollision: false,
        side: null,
        penetration: new Vector2D(0, 0),
        platform: null,
      };
    }

    // Déterminer les pénétrations minimales
    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    let side: "top" | "bottom" | "left" | "right";
    let penetration: Vector2D;

    // Choisir l'axe de résolution (celui avec la plus petite pénétration)
    if (minOverlapX < minOverlapY) {
      // Collision horizontale
      if (overlapLeft < overlapRight) {
        side = "right"; // Joueur heurte le côté droit de la plateforme
        penetration = new Vector2D(-minOverlapX, 0);
      } else {
        side = "left"; // Joueur heurte le côté gauche de la plateforme
        penetration = new Vector2D(minOverlapX, 0);
      }
    } else {
      // Collision verticale
      if (overlapTop < overlapBottom) {
        side = "top"; // Joueur atterrit sur la plateforme
        penetration = new Vector2D(0, -minOverlapY);
      } else {
        side = "bottom"; // Joueur heurte la plateforme par en dessous
        penetration = new Vector2D(0, minOverlapY);
      }
    }

    // Validation de la collision selon la vélocité du joueur
    if (!this.isCollisionValid(player, side)) {
      return {
        hasCollision: false,
        side: null,
        penetration: new Vector2D(0, 0),
        platform: null,
      };
    }

    return {
      hasCollision: true,
      side,
      penetration,
      platform,
    };
  }

  /**
   * Valide si une collision est logique selon la direction du mouvement
   */
  private static isCollisionValid(
    player: Player,
    side: "top" | "bottom" | "left" | "right"
  ): boolean {
    const velocityTolerance = 10; // Petite tolérance pour les micro-mouvements

    switch (side) {
      case "top":
        // Collision par le haut : acceptable si le joueur tombe ou est stationnaire
        return player.velocity.y >= -velocityTolerance;

      case "bottom":
        // Collision par le bas : acceptable si le joueur monte ou est stationnaire
        return player.velocity.y <= velocityTolerance;

      case "left":
        // Collision par la gauche : acceptable si le joueur va vers la droite ou est stationnaire
        return player.velocity.x >= -velocityTolerance;

      case "right":
        // Collision par la droite : acceptable si le joueur va vers la gauche ou est stationnaire
        return player.velocity.x <= velocityTolerance;

      default:
        return true;
    }
  }

  /**
   * Résout les collisions en séparant les axes (empêche le forçage)
   */
  public static resolveCollisionsSeparated(
    player: Player,
    platforms: Platform[]
  ): void {
    // 1. D'abord gérer les collisions horizontales
    this.resolveHorizontalCollisions(player, platforms);

    // 2. Puis gérer les collisions verticales
    this.resolveVerticalCollisions(player, platforms);
  }

  /**
   * Résout uniquement les collisions horizontales
   */
  private static resolveHorizontalCollisions(
    player: Player,
    platforms: Platform[]
  ): void {
    const playerBounds = player.getBounds();

    for (const platform of platforms) {
      const platformBounds = platform.getBounds();

      if (this.aabbIntersect(playerBounds, platformBounds)) {
        // Calculer les chevauchements
        const overlapLeft =
          playerBounds.x + playerBounds.width - platformBounds.x;
        const overlapRight =
          platformBounds.x + platformBounds.width - playerBounds.x;
        const overlapTop =
          playerBounds.y + playerBounds.height - platformBounds.y;
        const overlapBottom =
          platformBounds.y + platformBounds.height - playerBounds.y;

        // Vérifier que c'est une vraie intersection
        if (
          overlapLeft <= 0 ||
          overlapRight <= 0 ||
          overlapTop <= 0 ||
          overlapBottom <= 0
        ) {
          continue;
        }

        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);

        // Ne traiter que si c'est principalement une collision horizontale
        if (minOverlapX < minOverlapY && minOverlapX > 0.1) {
          // Déterminer le côté de collision
          if (overlapLeft < overlapRight) {
            // Collision par la droite de la plateforme
            player.position.x = platformBounds.x - player.size.x;
          } else {
            // Collision par la gauche de la plateforme
            player.position.x = platformBounds.x + platformBounds.width;
          }

          // Arrêter le mouvement horizontal
          player.velocity.x = 0;
          break; // Traiter une seule collision à la fois
        }
      }
    }
  }

  /**
   * Résout uniquement les collisions verticales
   */
  private static resolveVerticalCollisions(
    player: Player,
    platforms: Platform[]
  ): void {
    const playerBounds = player.getBounds();

    for (const platform of platforms) {
      const platformBounds = platform.getBounds();

      if (this.aabbIntersect(playerBounds, platformBounds)) {
        // Calculer les chevauchements
        const overlapLeft =
          playerBounds.x + playerBounds.width - platformBounds.x;
        const overlapRight =
          platformBounds.x + platformBounds.width - playerBounds.x;
        const overlapTop =
          playerBounds.y + playerBounds.height - platformBounds.y;
        const overlapBottom =
          platformBounds.y + platformBounds.height - playerBounds.y;

        // Vérifier que c'est une vraie intersection
        if (
          overlapLeft <= 0 ||
          overlapRight <= 0 ||
          overlapTop <= 0 ||
          overlapBottom <= 0
        ) {
          continue;
        }

        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);

        // Ne traiter que si c'est principalement une collision verticale
        if (minOverlapY <= minOverlapX && minOverlapY > 0.1) {
          // Déterminer le côté de collision
          if (overlapTop < overlapBottom) {
            // Atterrissage sur la plateforme - utiliser Math.floor pour éviter les gaps
            player.position.y = Math.floor(platformBounds.y - player.size.y);
            player.velocity.y = 0;
            player.isOnGround = true;
            player.isJumping = false;
          } else {
            // Coup de tête contre la plateforme
            player.position.y = Math.ceil(platformBounds.y + platformBounds.height);
            player.velocity.y = 0;
          }
          break; // Traiter une seule collision à la fois
        }
      }
    }
  }

  /**
   * Test d'intersection AABB optimisé
   */
  private static aabbIntersect(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      rect1.x + rect1.width <= rect2.x + this.COLLISION_TOLERANCE ||
      rect2.x + rect2.width <= rect1.x + this.COLLISION_TOLERANCE ||
      rect1.y + rect1.height <= rect2.y + this.COLLISION_TOLERANCE ||
      rect2.y + rect2.height <= rect1.y + this.COLLISION_TOLERANCE
    );
  }

  /**
   * Vérifie si le joueur est effectivement au sol
   */
  public static isPlayerOnGround(
    player: Player,
    platforms: Platform[]
  ): boolean {
    // Créer un petit rectangle sous le joueur pour détecter le contact au sol
    const groundCheckBounds = {
      x: player.position.x + 2, // Légèrement réduit sur les côtés
      y: player.position.y + player.size.y,
      width: player.size.x - 4,
      height: 2, // Petite zone de détection
    };

    for (const platform of platforms) {
      const platformBounds = platform.getBounds();
      if (this.aabbIntersect(groundCheckBounds, platformBounds)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Prédit les collisions futures pour des mouvements plus fluides
   */
  public static predictCollision(
    player: Player,
    platforms: Platform[],
    deltaTime: number
  ): CollisionResult {
    // Calculer la position future
    const futurePosition = new Vector2D(
      player.position.x + player.velocity.x * deltaTime,
      player.position.y + player.velocity.y * deltaTime
    );

    // Créer un joueur temporaire avec la position future
    const tempPlayer = {
      ...player,
      position: futurePosition,
      getBounds: () => ({
        x: futurePosition.x,
        y: futurePosition.y,
        width: player.size.x,
        height: player.size.y,
      }),
    };

    return this.checkPlayerPlatformCollision(tempPlayer as Player, platforms);
  }

  /**
   * Utilitaire de debug pour afficher les informations de collision
   */
  public static debugCollision(player: Player, platforms: Platform[]): void {
    const playerBounds = player.getBounds();
    console.group("🔍 DEBUG COLLISION");
    console.log("Joueur:", {
      position: {
        x: Math.round(playerBounds.x),
        y: Math.round(playerBounds.y),
      },
      size: { width: playerBounds.width, height: playerBounds.height },
      velocity: {
        x: player.velocity.x.toFixed(1),
        y: player.velocity.y.toFixed(1),
      },
      onGround: player.isOnGround,
    });

    let intersectionCount = 0;
    platforms.forEach((platform, index) => {
      const platformBounds = platform.getBounds();
      if (this.aabbIntersect(playerBounds, platformBounds)) {
        intersectionCount++;
        console.log(`Plateforme ${index}:`, {
          position: { x: platformBounds.x, y: platformBounds.y },
          size: { width: platformBounds.width, height: platformBounds.height },
          status: "INTERSECTION",
        });
      }
    });

    console.log(`Total intersections: ${intersectionCount}`);
    console.groupEnd();
  }

  /**
   * Méthode utilitaire pour tester les collisions entre deux rectangles quelconques
   */
  public static testRectangleIntersection(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return this.aabbIntersect(rect1, rect2);
  }

  /**
   * Calcule la distance entre le joueur et une plateforme
   */
  public static distanceToPlayerPlatform(
    player: Player,
    platform: Platform
  ): number {
    const playerCenter = {
      x: player.position.x + player.size.x / 2,
      y: player.position.y + player.size.y / 2,
    };

    const platformCenter = {
      x: platform.position.x + platform.size.x / 2,
      y: platform.position.y + platform.size.y / 2,
    };

    const dx = playerCenter.x - platformCenter.x;
    const dy = playerCenter.y - platformCenter.y;

    return Math.sqrt(dx * dx + dy * dy);
  }
}
