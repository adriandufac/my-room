import type { LevelData } from "../utils/Types";

import { GAME_CONFIG } from "../utils/Constants";

/**
 * Générateur de niveaux - Convertit les données de gameplay en format JSON
 * et crée des niveaux prédéfinis pour démonstration
 */
export class LevelGenerator {
  /**
   * Génère un niveau vide de base avec spawn et finish
   */
  static generateEmptyLevel(name: string = "Nouveau Niveau"): LevelData {
    return {
      id: `level_${Date.now()}`,
      name,
      width: GAME_CONFIG.LEVEL.DEFAULT_WIDTH,
      height: GAME_CONFIG.LEVEL.DEFAULT_HEIGHT,
      playerStart: { x: 100, y: 500 },
      finishLine: { x: 2200, y: 0 },
      platforms: [],
      enemies: [],
      projectileSpawners: [],
      version: "1.0.0",
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };
  }

  /**
   * Exporte un niveau au format JSON optimisé
   */
  static exportToJSON(levelData: LevelData): string {
    // Nettoyer et optimiser les données
    const cleanedLevel = {
      ...levelData,
      modified: new Date().toISOString(),
    };

    return JSON.stringify(cleanedLevel, null, 2);
  }

  /**
   * Valide la structure JSON d'un niveau
   */
  static validateLevelJSON(jsonString: string): {
    valid: boolean;
    level?: LevelData;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      const level: LevelData = JSON.parse(jsonString);

      // Vérifications obligatoires
      if (!level.id) errors.push("ID manquant");
      if (!level.name) errors.push("Nom manquant");
      if (!level.width || level.width <= 0) errors.push("Largeur invalide");
      if (!level.height || level.height <= 0) errors.push("Hauteur invalide");
      if (!level.playerStart) errors.push("Point de spawn manquant");
      if (!level.finishLine) errors.push("Ligne d'arrivée manquante");
      if (!Array.isArray(level.platforms)) errors.push("Plateformes invalides");
      if (!Array.isArray(level.enemies)) errors.push("Ennemis invalides");
      if (!Array.isArray(level.projectileSpawners))
        errors.push("Spawners invalides");

      // Vérifications de cohérence
      if (
        level.playerStart &&
        (level.playerStart.x < 0 || level.playerStart.x > level.width)
      ) {
        errors.push("Position de spawn hors limites");
      }
      if (
        level.finishLine &&
        (level.finishLine.x < 0 || level.finishLine.x > level.width)
      ) {
        errors.push("Position d'arrivée hors limites");
      }

      return {
        valid: errors.length === 0,
        level: errors.length === 0 ? level : undefined,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: ["JSON invalide: " + (error as Error).message],
      };
    }
  }
}
