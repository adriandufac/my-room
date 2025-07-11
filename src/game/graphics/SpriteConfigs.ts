import type { SpriteConfig } from "./SpriteRenderer";

export const SPRITE_CONFIGS: Record<string, SpriteConfig> = {
  player_idle: {
    imagePath: "/textures/sprites/player_idle_spritesheet.png",
    frameWidth: 32,
    frameHeight: 48,
    animations: {
      idle: {
        name: "idle",
        frameCount: 8, // 8 frames d'animation idle
        frameWidth: 32,
        frameHeight: 48,
        startFrame: 0,
        duration: 2000, // 2s pour 8 frames = animation lente
        loop: true,
      },
    },
  },

  player_run: {
    imagePath: "/textures/sprites/player_run_spritesheet.png",
    frameWidth: 32,
    frameHeight: 48,
    animations: {
      run: {
        name: "run",
        frameCount: 8, // 8 frames d'animation de course
        frameWidth: 32,
        frameHeight: 48,
        startFrame: 0,
        duration: 800, // Animation rapide pour la course
        loop: true,
      },
    },
  },

  player_jump: {
    imagePath: "/textures/sprites/player_jump_spritesheet.png",
    frameWidth: 32,
    frameHeight: 48,
    animations: {
      jump: {
        name: "jump",
        frameCount: 8, // 8 frames de saut
        frameWidth: 32,
        frameHeight: 48,
        startFrame: 0,
        duration: 600,
        loop: true, // Boucle maintenant
      },
    },
  },

  player_fall: {
    imagePath: "/textures/sprites/player_fall_spritesheet.png",
    frameWidth: 32,
    frameHeight: 48,
    animations: {
      fall: {
        name: "fall",
        frameCount: 8, // 8 frames de chute
        frameWidth: 32,
        frameHeight: 48,
        startFrame: 0,
        duration: 600,
        loop: true, // Boucle maintenant
      },
    },
  },

  // Configuration pour les ennemis
  enemy: {
    imagePath: "/textures/sprites/ennemie.png",
    frameWidth: 191, // 383px / 2 frames = 191.5px par frame (arrondi à 191)
    frameHeight: 197,
    animations: {
      walk: {
        name: "walk",
        frameCount: 2,
        frameWidth: 191,
        frameHeight: 197,
        startFrame: 0,
        duration: 800, // 800ms pour 2 frames = 400ms par frame
        loop: true,
      },
    },
  },

  // Configuration pour les projectiles
  projectile: {
    imagePath: "/textures/sprites/projectile.png",
    frameWidth: 684,
    frameHeight: 332,
    animations: {
      default: {
        name: "default",
        frameCount: 1,
        frameWidth: 684,
        frameHeight: 332,
        startFrame: 0,
        duration: 1000,
        loop: true,
      },
    },
  },

  // Configuration pour les plateformes
  platform: {
    imagePath: "/textures/sprites/platform.png",
    frameWidth: 200,
    frameHeight: 20,
    animations: {
      default: {
        name: "default",
        frameCount: 1,
        frameWidth: 200,
        frameHeight: 20,
        startFrame: 0,
        duration: 1000,
        loop: true,
      },
    },
  },

  // Configuration pour le background
  background: {
    imagePath: "/textures/sprites/background.png",
    frameWidth: 600,
    frameHeight: 600,
    animations: {
      default: {
        name: "default",
        frameCount: 1,
        frameWidth: 600,
        frameHeight: 600,
        startFrame: 0,
        duration: 1000,
        loop: true,
      },
    },
  },
};

// Fonction utilitaire pour obtenir une configuration
export function getSpriteConfig(entityType: string): SpriteConfig | null {
  return SPRITE_CONFIGS[entityType] || null;
}

// Fonction pour lister tous les chemins de sprites
export function getAllSpritePaths(): string[] {
  return Object.values(SPRITE_CONFIGS).map((config) => config.imagePath);
}

// Fonction pour valider une configuration de sprite
export function validateSpriteConfig(config: SpriteConfig): boolean {
  if (!config.imagePath || !config.frameWidth || !config.frameHeight) {
    return false;
  }

  if (!config.animations || Object.keys(config.animations).length === 0) {
    return false;
  }

  for (const animation of Object.values(config.animations)) {
    if (
      !animation.name ||
      animation.frameCount <= 0 ||
      animation.duration <= 0
    ) {
      return false;
    }
  }

  return true;
}
