import type { LevelData } from '../utils/Types';

export class FileSystemLevelService {
  private static readonly LEVELS_PATH = '/src/Data/levels/custom/';

  // Sauvegarder un niveau dans le système de fichiers
  static async saveLevel(levelData: LevelData): Promise<boolean> {
    try {
      // Valider le niveau avant sauvegarde
      if (!this.validateLevel(levelData)) {
        throw new Error('Niveau invalide : spawn et finish obligatoires');
      }

      // Nettoyer le nom pour le fichier
      const cleanName = this.sanitizeFileName(levelData.name);
      const fileName = `${cleanName}_${Date.now()}.json`;
      
      // Préparer les données du niveau
      const levelToSave = {
        ...levelData,
        id: fileName,
        modified: new Date().toISOString()
      };
      
      // En mode développement, utiliser fetch pour sauvegarder via une API
      if (import.meta.env.DEV) {
        console.log(`💾 Sauvegarde du niveau: ${fileName}`);
        
        // Sauvegarder en localStorage pour l'interface
        const existingLevels = this.getAllLevelsFromStorage();
        existingLevels[fileName] = levelToSave;
        localStorage.setItem('custom_levels', JSON.stringify(existingLevels));
        
        // Générer le fichier pour sauvegarde manuelle
        this.generateFileInstructions(levelToSave, fileName);
        
        // Aussi télécharger automatiquement le fichier
        this.exportLevel(levelToSave);
        
        return true;
      }
      
      console.log(`✅ Niveau "${levelData.name}" sauvegardé sous: ${fileName}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      return false;
    }
  }

  // Charger tous les niveaux depuis le système de fichiers
  static async getAllLevels(): Promise<Record<string, LevelData>> {
    try {
      const allLevels: Record<string, LevelData> = {};
      
      // Charger depuis localStorage (niveaux créés dans l'éditeur)
      const localLevels = this.getAllLevelsFromStorage();
      Object.assign(allLevels, localLevels);
      
      // Essayer de charger les niveaux depuis le dossier custom
      try {
        const customLevels = await this.loadCustomLevels();
        Object.assign(allLevels, customLevels);
      } catch (error) {
        console.log('📁 Aucun niveau personnalisé trouvé dans src/Data/levels/custom/');
      }
      
      return allLevels;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des niveaux:', error);
      // Fallback sur localStorage
      return this.getAllLevelsFromStorage();
    }
  }

  // Charger les niveaux depuis src/Data/levels/custom/
  private static async loadCustomLevels(): Promise<Record<string, LevelData>> {
    const customLevels: Record<string, LevelData> = {};
    
    // Liste des fichiers à essayer de charger
    const possibleFiles = [
      'exemple_niveau.json',
      // On peut ajouter d'autres fichiers ici manuellement
    ];
    
    for (const fileName of possibleFiles) {
      try {
        const response = await fetch(`/src/Data/levels/custom/${fileName}`);
        if (response.ok) {
          const levelData: LevelData = await response.json();
          if (this.validateLevel(levelData)) {
            customLevels[fileName] = levelData;
            console.log(`📁 Niveau chargé: ${fileName}`);
          }
        }
      } catch (error) {
        // Fichier non trouvé, ignorer silencieusement
        console.log(`📁 ${fileName} non trouvé`);
      }
    }
    
    return customLevels;
  }

  // Fallback localStorage pour le développement
  private static getAllLevelsFromStorage(): Record<string, LevelData> {
    try {
      const stored = localStorage.getItem('custom_levels');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ Erreur localStorage:', error);
      return {};
    }
  }

  // Charger un niveau spécifique
  static async loadLevel(fileName: string): Promise<LevelData | null> {
    try {
      const levels = await this.getAllLevels();
      return levels[fileName] || null;
    } catch (error) {
      console.error('❌ Erreur lors du chargement du niveau:', error);
      return null;
    }
  }

  // Supprimer un niveau
  static async deleteLevel(fileName: string): Promise<boolean> {
    try {
      if (import.meta.env.DEV) {
        // En dev, supprimer de localStorage
        const levels = this.getAllLevelsFromStorage();
        delete levels[fileName];
        localStorage.setItem('custom_levels', JSON.stringify(levels));
        console.log(`🗑️ Niveau supprimé de localStorage: ${fileName}`);
        return true;
      }
      
      // En production, supprimer via API
      const response = await fetch(`/api/levels/${fileName}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Impossible de supprimer le niveau');
      }
      
      console.log(`🗑️ Niveau supprimé: ${fileName}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      return false;
    }
  }

  // Exporter un niveau en JSON téléchargeable (fonctionne toujours)
  static exportLevel(levelData: LevelData): void {
    try {
      const jsonString = JSON.stringify(levelData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.sanitizeFileName(levelData.name)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`📁 Niveau exporté: ${levelData.name}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'export:', error);
    }
  }

  // Importer un niveau depuis un fichier JSON
  static async importLevel(file: File): Promise<LevelData | null> {
    try {
      const text = await file.text();
      const levelData: LevelData = JSON.parse(text);
      
      // Valider le niveau importé
      if (!this.validateLevel(levelData)) {
        throw new Error('JSON invalide : structure de niveau incorrecte');
      }
      
      // Régénérer ID et dates
      levelData.id = `imported_${Date.now()}`;
      levelData.created = new Date().toISOString();
      levelData.modified = new Date().toISOString();
      
      console.log(`📥 Niveau importé: ${levelData.name}`);
      return levelData;
    } catch (error) {
      console.error('❌ Erreur lors de l\'import:', error);
      return null;
    }
  }

  // Valider qu'un niveau a les éléments obligatoires
  private static validateLevel(levelData: LevelData): boolean {
    return !!(
      levelData &&
      levelData.name &&
      levelData.width > 0 &&
      levelData.height > 0 &&
      levelData.playerStart &&
      levelData.finishLine &&
      Array.isArray(levelData.platforms) &&
      Array.isArray(levelData.enemies) &&
      Array.isArray(levelData.projectileSpawners)
    );
  }

  // Nettoyer le nom de fichier
  private static sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 30);
  }

  // Obtenir les statistiques des niveaux
  static async getLevelStats(): Promise<{ total: number; totalSize: string }> {
    const levels = await this.getAllLevels();
    const total = Object.keys(levels).length;
    const jsonString = JSON.stringify(levels);
    const totalSize = `${(jsonString.length / 1024).toFixed(1)} Ko`;
    
    return { total, totalSize };
  }

  // Générer les instructions pour créer le fichier manuellement
  private static generateFileInstructions(levelData: LevelData, fileName: string): void {
    const content = JSON.stringify(levelData, null, 2);
    
    console.group(`📁 Instructions pour sauvegarder dans le projet:`);
    console.log(`1. Créer le fichier: src/Data/levels/custom/${fileName}`);
    console.log(`2. Copier ce contenu dans le fichier:`);
    console.log(content);
    console.log(`3. Le niveau sera disponible dans le gestionnaire de niveaux`);
    console.groupEnd();
    
    // Montrer également dans une alerte
    const instructions = `📁 Niveau sauvegardé!\n\nPour l'ajouter au projet:\n1. Créer: src/Data/levels/custom/${fileName}\n2. Coller le contenu du fichier téléchargé\n3. Recharger l'application`;
    alert(instructions);
  }

  // Créer un fichier dans src/Data/levels/custom/ (manuel pour l'instant)
  static generateFileForManualSave(levelData: LevelData): string {
    const cleanName = this.sanitizeFileName(levelData.name);
    const fileName = `${cleanName}_${Date.now()}.json`;
    const content = JSON.stringify(levelData, null, 2);
    
    console.log(`📋 Copier ce contenu dans src/Data/levels/custom/${fileName}:`);
    console.log(content);
    
    return content;
  }
}