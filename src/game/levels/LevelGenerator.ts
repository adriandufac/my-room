import type { LevelData, PlatformData, EnemyData, ProjectileSpawnerData, Vector2D } from '../utils/Types';
import { PlatformType, EnemyType } from '../utils/Types';
import { GAME_CONFIG } from '../utils/Constants';

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
   * Génère un niveau tutoriel simple
   */
  static generateTutorialLevel(): LevelData {
    const platforms: PlatformData[] = [
      // Sol principal
      { id: 'ground', position: { x: 0, y: 580 }, size: { x: 400, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'ground2', position: { x: 600, y: 580 }, size: { x: 1800, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      
      // Plateformes tutoriel
      { id: 'tuto1', position: { x: 250, y: 480 }, size: { x: 120, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'tuto2', position: { x: 450, y: 420 }, size: { x: 120, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'tuto3', position: { x: 650, y: 360 }, size: { x: 120, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      
      // Saut plus difficile
      { id: 'jump1', position: { x: 900, y: 480 }, size: { x: 100, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'jump2', position: { x: 1100, y: 380 }, size: { x: 100, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'jump3', position: { x: 1300, y: 480 }, size: { x: 100, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      
      // Finale
      { id: 'final', position: { x: 1800, y: 400 }, size: { x: 200, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
    ];

    const enemies: EnemyData[] = [
      { id: 'enemy1', position: { x: 950, y: 450 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 80, speed: 50, direction: 1 } },
      { id: 'enemy2', position: { x: 1150, y: 350 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 80, speed: 50, direction: 1 } },
    ];

    return {
      id: 'tutorial_level',
      name: "Niveau Tutoriel",
      width: GAME_CONFIG.LEVEL.DEFAULT_WIDTH,
      height: GAME_CONFIG.LEVEL.DEFAULT_HEIGHT,
      playerStart: { x: 50, y: 500 },
      finishLine: { x: 2100, y: 0 },
      platforms,
      enemies,
      projectileSpawners: [],
      version: "1.0.0",
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };
  }

  /**
   * Génère un niveau de difficulté moyenne avec projectiles
   */
  static generateIntermediateLevel(): LevelData {
    const platforms: PlatformData[] = [
      // Sol avec trous
      { id: 'ground1', position: { x: 0, y: 580 }, size: { x: 300, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'ground2', position: { x: 500, y: 580 }, size: { x: 300, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'ground3', position: { x: 1000, y: 580 }, size: { x: 300, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'ground4', position: { x: 1500, y: 580 }, size: { x: 900, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      
      // Plateformes flottantes
      { id: 'float1', position: { x: 350, y: 450 }, size: { x: 100, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'float2', position: { x: 550, y: 380 }, size: { x: 100, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'float3', position: { x: 750, y: 320 }, size: { x: 100, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'float4', position: { x: 950, y: 380 }, size: { x: 100, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'float5', position: { x: 1150, y: 450 }, size: { x: 100, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      
      // Section finale difficile
      { id: 'final1', position: { x: 1600, y: 480 }, size: { x: 80, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'final2', position: { x: 1750, y: 380 }, size: { x: 80, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'final3', position: { x: 1900, y: 280 }, size: { x: 80, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'final4', position: { x: 2050, y: 380 }, size: { x: 100, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
    ];

    const enemies: EnemyData[] = [
      { id: 'patrol1', position: { x: 570, y: 350 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 80, speed: 60, direction: 1 } },
      { id: 'patrol2', position: { x: 770, y: 290 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 80, speed: 60, direction: -1 } },
      { id: 'patrol3', position: { x: 1170, y: 420 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 80, speed: 60, direction: 1 } },
      { id: 'guard1', position: { x: 1770, y: 350 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 60, speed: 40, direction: 1 } },
    ];

    const projectileSpawners: ProjectileSpawnerData[] = [
      { id: 'spawner1', position: { x: 400, y: 420 }, direction: 1, interval: 3000, color: '#FF9800', properties: { speed: 150, lifetime: 4000 } },
      { id: 'spawner2', position: { x: 1300, y: 300 }, direction: -1, interval: 2500, color: '#FF9800', properties: { speed: 180, lifetime: 3500 } },
      { id: 'spawner3', position: { x: 1850, y: 250 }, direction: -1, interval: 3500, color: '#FF9800', properties: { speed: 200, lifetime: 3000 } },
    ];

    return {
      id: 'intermediate_level',
      name: "Niveau Intermédiaire",
      width: GAME_CONFIG.LEVEL.DEFAULT_WIDTH,
      height: GAME_CONFIG.LEVEL.DEFAULT_HEIGHT,
      playerStart: { x: 50, y: 500 },
      finishLine: { x: 2200, y: 0 },
      platforms,
      enemies,
      projectileSpawners,
      version: "1.0.0",
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };
  }

  /**
   * Génère un niveau de défi difficile
   */
  static generateChallengeLevel(): LevelData {
    const platforms: PlatformData[] = [
      // Sol minimal
      { id: 'start', position: { x: 0, y: 580 }, size: { x: 200, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'end', position: { x: 2200, y: 580 }, size: { x: 200, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      
      // Parcours aérien difficile
      { id: 'air1', position: { x: 250, y: 500 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air2', position: { x: 400, y: 420 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air3', position: { x: 550, y: 340 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air4', position: { x: 700, y: 260 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air5', position: { x: 850, y: 180 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air6', position: { x: 1000, y: 260 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air7', position: { x: 1150, y: 340 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air8', position: { x: 1300, y: 420 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air9', position: { x: 1450, y: 340 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air10', position: { x: 1600, y: 260 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air11', position: { x: 1750, y: 180 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air12', position: { x: 1900, y: 260 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'air13', position: { x: 2050, y: 340 }, size: { x: 60, y: 20 }, type: PlatformType.SOLID, color: '#4CAF50' },
      
      // Murs de protection
      { id: 'wall1', position: { x: 0, y: 480 }, size: { x: 20, y: 100 }, type: PlatformType.SOLID, color: '#4CAF50' },
      { id: 'wall2', position: { x: 2380, y: 480 }, size: { x: 20, y: 100 }, type: PlatformType.SOLID, color: '#4CAF50' },
    ];

    const enemies: EnemyData[] = [
      { id: 'guard1', position: { x: 420, y: 390 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 40, speed: 80, direction: 1 } },
      { id: 'guard2', position: { x: 720, y: 230 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 40, speed: 80, direction: -1 } },
      { id: 'guard3', position: { x: 870, y: 150 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 40, speed: 80, direction: 1 } },
      { id: 'guard4', position: { x: 1170, y: 310 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 40, speed: 80, direction: -1 } },
      { id: 'guard5', position: { x: 1470, y: 310 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 40, speed: 80, direction: 1 } },
      { id: 'guard6', position: { x: 1770, y: 150 }, size: { x: 30, y: 30 }, type: EnemyType.BASIC, color: '#FF5722', properties: { patrolDistance: 40, speed: 80, direction: -1 } },
    ];

    const projectileSpawners: ProjectileSpawnerData[] = [
      { id: 'danger1', position: { x: 300, y: 550 }, direction: 1, interval: 2000, color: '#FF9800', properties: { speed: 200, lifetime: 5000 } },
      { id: 'danger2', position: { x: 600, y: 200 }, direction: -1, interval: 1800, color: '#FF9800', properties: { speed: 220, lifetime: 4000 } },
      { id: 'danger3', position: { x: 1000, y: 100 }, direction: 1, interval: 2200, color: '#FF9800', properties: { speed: 250, lifetime: 3500 } },
      { id: 'danger4', position: { x: 1400, y: 200 }, direction: -1, interval: 1600, color: '#FF9800', properties: { speed: 280, lifetime: 4500 } },
      { id: 'danger5', position: { x: 1800, y: 50 }, direction: 1, interval: 2500, color: '#FF9800', properties: { speed: 300, lifetime: 3000 } },
      { id: 'final_trap', position: { x: 2100, y: 500 }, direction: -1, interval: 1000, color: '#FF9800', properties: { speed: 350, lifetime: 2000 } },
    ];

    return {
      id: 'challenge_level',
      name: "Défi Extrême",
      width: GAME_CONFIG.LEVEL.DEFAULT_WIDTH,
      height: GAME_CONFIG.LEVEL.DEFAULT_HEIGHT,
      playerStart: { x: 50, y: 500 },
      finishLine: { x: 2300, y: 0 },
      platforms,
      enemies,
      projectileSpawners,
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
  static validateLevelJSON(jsonString: string): { valid: boolean; level?: LevelData; errors: string[] } {
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
      if (!Array.isArray(level.projectileSpawners)) errors.push("Spawners invalides");
      
      // Vérifications de cohérence
      if (level.playerStart && (level.playerStart.x < 0 || level.playerStart.x > level.width)) {
        errors.push("Position de spawn hors limites");
      }
      if (level.finishLine && (level.finishLine.x < 0 || level.finishLine.x > level.width)) {
        errors.push("Position d'arrivée hors limites");
      }
      
      return {
        valid: errors.length === 0,
        level: errors.length === 0 ? level : undefined,
        errors
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: ["JSON invalide: " + (error as Error).message]
      };
    }
  }

  /**
   * Crée tous les niveaux de démonstration
   */
  static createDemoLevels(): LevelData[] {
    return [
      this.generateTutorialLevel(),
      this.generateIntermediateLevel(),
      this.generateChallengeLevel(),
    ];
  }
}