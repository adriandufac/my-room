import type { LevelData } from "../utils/Types";
import { LevelGenerator } from "./LevelGenerator";
import { FileSystemLevelService } from "./FileSystemLevelService";

/**
 * Gestionnaire central des niveaux - Interface entre le jeu et les différentes sources de niveaux
 */
export class LevelManager {
  private static instance: LevelManager | null = null;
  private loadedLevels: Map<string, LevelData> = new Map();
  private currentLevel: LevelData | null = null;
  private levelHistory: string[] = [];

  private constructor() {
    this.initializeDefaultLevels();
  }

  /**
   * Singleton pattern pour avoir une instance unique
   */
  static getInstance(): LevelManager {
    if (!LevelManager.instance) {
      LevelManager.instance = new LevelManager();
    }
    return LevelManager.instance;
  }

  /**
   * Initialise les niveaux par défaut
   */
  private async initializeDefaultLevels(): Promise<void> {
    try {
      // Charger UNIQUEMENT les niveaux depuis les fichiers JSON
      await this.loadCustomLevels();

      console.log(
        `[GAME] LevelManager initialisé avec ${this.loadedLevels.size} niveaux depuis Data/levels/custom/`
      );
    } catch (error) {
      console.error(
        "[ERROR] Erreur lors de l'initialisation des niveaux:",
        error
      );
    }
  }

  /**
   * Charge tous les niveaux personnalisés depuis le FileSystemLevelService
   */
  async loadCustomLevels(): Promise<void> {
    try {
      const customLevels = await FileSystemLevelService.getAllLevels();

      for (const [fileName, levelData] of Object.entries(customLevels)) {
        // Vérifier que le niveau est valide
        const validation = LevelGenerator.validateLevelJSON(
          JSON.stringify(levelData)
        );
        if (validation.valid && validation.level) {
          this.loadedLevels.set(levelData.id, validation.level);
          console.log(
            `[SUCCESS] Niveau personnalisé chargé: ${levelData.name}`
          );
        } else {
          console.warn(
            `[WARNING] Niveau invalide ignoré: ${fileName}`,
            validation.errors
          );
        }
      }
    } catch (error) {
      console.error(
        "[ERROR] Erreur lors du chargement des niveaux personnalisés:",
        error
      );
    }
  }

  /**
   * Recharge tous les niveaux (utile après ajout/modification)
   */
  async reloadLevels(): Promise<void> {
    this.loadedLevels.clear();
    await this.initializeDefaultLevels();
  }

  /**
   * Obtient tous les niveaux disponibles
   */
  getAllLevels(): LevelData[] {
    return Array.from(this.loadedLevels.values());
  }

  /**
   * Obtient un niveau par son ID
   */
  getLevelById(id: string): LevelData | null {
    return this.loadedLevels.get(id) || null;
  }

  /**
   * Obtient un niveau par son nom
   */
  getLevelByName(name: string): LevelData | null {
    for (const level of this.loadedLevels.values()) {
      if (level.name === name) {
        return level;
      }
    }
    return null;
  }

  /**
   * Filtre les niveaux par critères
   */
  filterLevels(criteria: {
    difficulty?: "easy" | "medium" | "hard";
    hasEnemies?: boolean;
    hasProjectiles?: boolean;
    custom?: boolean;
  }): LevelData[] {
    return this.getAllLevels().filter((level) => {
      // Estimer la difficulté basée sur le contenu
      const enemyCount = level.enemies.length;
      const projectileCount = level.projectileSpawners.length;

      let estimatedDifficulty: "easy" | "medium" | "hard" = "easy";
      if (enemyCount > 3 || projectileCount > 2) {
        estimatedDifficulty = "hard";
      } else if (enemyCount > 1 || projectileCount > 0) {
        estimatedDifficulty = "medium";
      }

      if (criteria.difficulty && estimatedDifficulty !== criteria.difficulty) {
        return false;
      }

      if (
        criteria.hasEnemies !== undefined &&
        level.enemies.length > 0 !== criteria.hasEnemies
      ) {
        return false;
      }

      if (
        criteria.hasProjectiles !== undefined &&
        level.projectileSpawners.length > 0 !== criteria.hasProjectiles
      ) {
        return false;
      }

      if (criteria.custom !== undefined) {
        const isCustom = ![
          "tutorial_level",
          "intermediate_level",
          "challenge_level",
        ].includes(level.id);
        if (isCustom !== criteria.custom) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Charge un niveau et le définit comme niveau actuel
   */
  loadLevel(id: string): LevelData | null {
    const level = this.getLevelById(id);
    if (level) {
      this.currentLevel = level;
      this.levelHistory.push(id);
      console.log(`[LEVEL] Niveau chargé: ${level.name}`);
      return level;
    }
    console.error(`[ERROR] Niveau non trouvé: ${id}`);
    return null;
  }

  /**
   * Obtient le niveau actuellement chargé
   */
  getCurrentLevel(): LevelData | null {
    return this.currentLevel;
  }

  /**
   * Importe un niveau depuis un fichier JSON
   */
  async importLevel(
    file: File
  ): Promise<{ success: boolean; level?: LevelData; errors?: string[] }> {
    try {
      const jsonString = await file.text();
      const validation = LevelGenerator.validateLevelJSON(jsonString);

      if (validation.valid && validation.level) {
        // Générer un nouvel ID pour éviter les conflits
        const importedLevel = {
          ...validation.level,
          id: `imported_${Date.now()}`,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        };

        // Ajouter à la collection
        this.loadedLevels.set(importedLevel.id, importedLevel);

        // Sauvegarder via le service de fichiers
        await FileSystemLevelService.saveLevel(importedLevel);

        console.log(
          `[SUCCESS] Niveau importé avec succès: ${importedLevel.name}`
        );
        return { success: true, level: importedLevel };
      } else {
        console.error("[ERROR] Niveau JSON invalide:", validation.errors);
        return { success: false, errors: validation.errors };
      }
    } catch (error) {
      const errorMsg = `Erreur lors de l'import: ${(error as Error).message}`;
      console.error("[ERROR]", errorMsg);
      return { success: false, errors: [errorMsg] };
    }
  }

  /**
   * Exporte un niveau au format JSON
   */
  exportLevel(id: string): string | null {
    const level = this.getLevelById(id);
    if (level) {
      return LevelGenerator.exportToJSON(level);
    }
    return null;
  }

  /**
   * Supprime un niveau
   */
  async deleteLevel(id: string): Promise<boolean> {
    try {
      const level = this.getLevelById(id);
      if (!level) {
        console.error(`[ERROR] Niveau non trouvé pour suppression: ${id}`);
        return false;
      }

      // Ne pas supprimer les niveaux de démonstration
      if (
        ["tutorial_level", "intermediate_level", "challenge_level"].includes(id)
      ) {
        console.error(
          `[ERROR] Impossible de supprimer un niveau de démonstration: ${id}`
        );
        return false;
      }

      // Supprimer de la collection locale
      this.loadedLevels.delete(id);

      // Supprimer du système de fichiers si c'est un niveau personnalisé
      await FileSystemLevelService.deleteLevel(id);

      console.log(`[SUCCESS] Niveau supprimé: ${level.name}`);
      return true;
    } catch (error) {
      console.error("[ERROR] Erreur lors de la suppression:", error);
      return false;
    }
  }

  /**
   * Ajoute un nouveau niveau (depuis l'éditeur)
   */
  async addLevel(levelData: LevelData): Promise<boolean> {
    try {
      // Valider le niveau
      const validation = LevelGenerator.validateLevelJSON(
        JSON.stringify(levelData)
      );
      if (!validation.valid) {
        console.error("[ERROR] Niveau invalide:", validation.errors);
        return false;
      }

      // Ajouter à la collection
      this.loadedLevels.set(levelData.id, levelData);

      // Sauvegarder via le service de fichiers
      await FileSystemLevelService.saveLevel(levelData);

      console.log(`[SUCCESS] Nouveau niveau ajouté: ${levelData.name}`);
      return true;
    } catch (error) {
      console.error("[ERROR] Erreur lors de l'ajout du niveau:", error);
      return false;
    }
  }

  /**
   * Met à jour un niveau existant
   */
  async updateLevel(levelData: LevelData): Promise<boolean> {
    try {
      // Valider le niveau
      const validation = LevelGenerator.validateLevelJSON(
        JSON.stringify(levelData)
      );
      if (!validation.valid) {
        console.error(
          "[ERROR] Niveau invalide pour mise à jour:",
          validation.errors
        );
        return false;
      }

      // Mettre à jour l'horodatage
      const updatedLevel = {
        ...levelData,
        modified: new Date().toISOString(),
      };

      // Mettre à jour dans la collection
      this.loadedLevels.set(updatedLevel.id, updatedLevel);

      // Sauvegarder via le service de fichiers
      await FileSystemLevelService.saveLevel(updatedLevel);

      console.log(`[SUCCESS] Niveau mis à jour: ${updatedLevel.name}`);
      return true;
    } catch (error) {
      console.error("[ERROR] Erreur lors de la mise à jour du niveau:", error);
      return false;
    }
  }

  /**
   * Obtient les statistiques des niveaux chargés
   */
  getStatistics(): {
    total: number;
    demo: number;
    custom: number;
    withEnemies: number;
    withProjectiles: number;
    averagePlatforms: number;
  } {
    const levels = this.getAllLevels();
    const demoIds = ["tutorial_level", "intermediate_level", "challenge_level"];

    return {
      total: levels.length,
      demo: levels.filter((l) => demoIds.includes(l.id)).length,
      custom: levels.filter((l) => !demoIds.includes(l.id)).length,
      withEnemies: levels.filter((l) => l.enemies.length > 0).length,
      withProjectiles: levels.filter((l) => l.projectileSpawners.length > 0)
        .length,
      averagePlatforms:
        levels.length > 0
          ? Math.round(
              levels.reduce((sum, l) => sum + l.platforms.length, 0) /
                levels.length
            )
          : 0,
    };
  }

  /**
   * Recherche de niveaux par nom ou ID
   */
  searchLevels(query: string): LevelData[] {
    const searchTerm = query.toLowerCase();
    return this.getAllLevels().filter(
      (level) =>
        level.name.toLowerCase().includes(searchTerm) ||
        level.id.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Obtient l'historique des niveaux chargés
   */
  getLevelHistory(): string[] {
    return [...this.levelHistory];
  }

  /**
   * Nettoie l'historique
   */
  clearHistory(): void {
    this.levelHistory = [];
  }
}
