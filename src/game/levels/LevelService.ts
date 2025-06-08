import type { LevelData } from '../utils/Types';
import { FileSystemLevelService } from './FileSystemLevelService';

export class LevelService {
  // Sauvegarder un niveau (délègue au FileSystemLevelService)
  static async saveLevel(levelData: LevelData): Promise<boolean> {
    return await FileSystemLevelService.saveLevel(levelData);
  }

  // Charger tous les niveaux (délègue au FileSystemLevelService)
  static async getAllLevels(): Promise<Record<string, LevelData>> {
    return await FileSystemLevelService.getAllLevels();
  }

  // Charger un niveau spécifique (délègue au FileSystemLevelService)
  static async loadLevel(fileName: string): Promise<LevelData | null> {
    return await FileSystemLevelService.loadLevel(fileName);
  }

  // Supprimer un niveau (délègue au FileSystemLevelService)
  static async deleteLevel(fileName: string): Promise<boolean> {
    return await FileSystemLevelService.deleteLevel(fileName);
  }

  // Exporter un niveau en JSON téléchargeable (délègue au FileSystemLevelService)
  static exportLevel(levelData: LevelData): void {
    FileSystemLevelService.exportLevel(levelData);
  }

  // Importer un niveau depuis un fichier JSON (délègue au FileSystemLevelService)
  static async importLevel(file: File): Promise<LevelData | null> {
    return await FileSystemLevelService.importLevel(file);
  }

  // Obtenir les statistiques des niveaux (délègue au FileSystemLevelService)
  static async getLevelStats(): Promise<{ total: number; totalSize: string }> {
    return await FileSystemLevelService.getLevelStats();
  }

  // Méthodes de compatibilité pour l'interface synchrone existante
  static getAllLevelsSync(): Record<string, LevelData> {
    console.warn('[WARNING] getAllLevelsSync est déprécié, utilisez getAllLevels() avec await');
    // Fallback localStorage pour compatibilité
    try {
      const stored = localStorage.getItem('custom_levels');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  static saveLeveSync(levelData: LevelData): boolean {
    console.warn('[WARNING] saveLevelSync est déprécié, utilisez saveLevel() avec await');
    // Démarrer la sauvegarde async mais retourner immédiatement
    this.saveLevel(levelData);
    return true;
  }

  static deleteLevelSync(fileName: string): boolean {
    console.warn('[WARNING] deleteLevelSync est déprécié, utilisez deleteLevel() avec await');
    // Démarrer la suppression async mais retourner immédiatement
    this.deleteLevel(fileName);
    return true;
  }

  static getLevelStatsSync(): { total: number; totalSize: string } {
    console.warn('[WARNING] getLevelStatsSync est déprécié, utilisez getLevelStats() avec await');
    const levels = this.getAllLevelsSync();
    const total = Object.keys(levels).length;
    const jsonString = JSON.stringify(levels);
    const totalSize = `${(jsonString.length / 1024).toFixed(1)} Ko`;
    return { total, totalSize };
  }
}