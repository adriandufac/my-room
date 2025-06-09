// src/game/core/Game.ts

import { GameLoop } from "./GameLoop";
import { InputManager } from "./InputManager";
import { Renderer } from "../renderer/Renderer";
import { Camera } from "../renderer/Camera";
import { Player } from "../entities/Player";
import { Platform } from "../entities/Platform";
import { FallingPlatform } from "../entities/FallingPlatform";
import { UppingPlatform } from "../entities/UppingPlatform";
import { Enemy } from "../entities/Enemy";
import { Projectile } from "../entities/Projectile";
import { CollisionDetector } from "./CollisionDetector";
import { GAME_CONFIG } from "../utils/Constants";
import type { LevelData, PlatformData, EnemyData, ProjectileSpawnerData } from "../utils/Types";
import { PlatformType } from "../utils/Types";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameLoop!: GameLoop;
  private inputManager!: InputManager;
  private renderer!: Renderer;
  private camera!: Camera;
  private player!: Player;
  private platforms: Platform[] = [];
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private currentFPS: number = 0;

  // Propriétés de gameplay
  private playerLives: number = 3;
  private invulnerabilityTime: number = 0;
  private readonly INVULNERABILITY_DURATION = 2.0; // 2 secondes
  private isPlayerInvulnerable: boolean = false;

  // Dimensions du niveau étendu
  private levelWidth: number = GAME_CONFIG.LEVEL.DEFAULT_WIDTH;
  private levelHeight: number = GAME_CONFIG.LEVEL.DEFAULT_HEIGHT;

  // Zones spéciales
  private startZone = { x: 0, y: 0, width: 200, height: 600 };
  private finishZone = { x: 2200, y: 0, width: 200, height: 600 };
  private levelCompleted: boolean = false;

  // Niveau personnalisé
  private customLevel: LevelData | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Impossible d'obtenir le contexte 2D du canvas");
    }

    this.ctx = context;
    this.setupCanvas();
    this.initializeGame();
  }

  private setupCanvas(): void {
    this.canvas.width = GAME_CONFIG.CANVAS.WIDTH;
    this.canvas.height = GAME_CONFIG.CANVAS.HEIGHT;
    this.ctx.imageSmoothingEnabled = false;
    this.canvas.style.border = "2px solid #333";
    this.canvas.style.backgroundColor = GAME_CONFIG.CANVAS.BACKGROUND_COLOR;
  }

  private initializeGame(): void {
    // Initialiser les systèmes de base
    this.inputManager = new InputManager(this.canvas);
    this.renderer = new Renderer(this.canvas);
    this.camera = new Camera(
      GAME_CONFIG.CANVAS.WIDTH,
      GAME_CONFIG.CANVAS.HEIGHT,
      this.levelWidth,
      this.levelHeight
    );

    // Créer le joueur
    this.player = new Player(
      GAME_CONFIG.PLAYER.STARTING_X,
      GAME_CONFIG.PLAYER.STARTING_Y
    );

    // Créer le niveau étendu avec ennemis et projectiles
    this.createExtendedLevel();
    this.createEnemies();
    this.createProjectileSpawners();

    // Initialiser la boucle de jeu
    this.gameLoop = new GameLoop();
    this.setupGameLoop();

    // Centrer la caméra sur le joueur
    this.camera.snapToPlayer(this.player);

    console.log(
      `[GAME] Niveau étendu initialisé : ${this.levelWidth}x${this.levelHeight}`
    );
    console.log(`[GAME] ${this.enemies.length} ennemis créés`);
  }

  private createExtendedLevel(): void {
    this.platforms = [];

    // Sol principal
    this.platforms.push(
      new Platform(0, this.levelHeight - 50, this.levelWidth, 50)
    );

    // Section de départ (0-400px) - Tutoriel facile
    this.platforms.push(new Platform(250, 420, 120, 20));
    this.platforms.push(new Platform(400, 360, 100, 20));
    this.platforms.push(new Platform(550, 300, 120, 20));

    // Première section principale (400-800px)
    this.platforms.push(new Platform(700, 400, 150, 20));
    this.platforms.push(new Platform(600, 240, 200, 20));
    this.platforms.push(new Platform(850, 320, 100, 20));

    // Section intermédiaire (800-1200px)
    this.platforms.push(new Platform(1000, 260, 120, 20));
    this.platforms.push(new Platform(1180, 190, 100, 20));
    this.platforms.push(new Platform(1320, 340, 150, 20));
    this.platforms.push(new Platform(1100, 120, 180, 20));

    // Section avancée (1200-1600px)
    this.platforms.push(new Platform(1500, 290, 80, 20));
    this.platforms.push(new Platform(1620, 220, 80, 20));
    this.platforms.push(new Platform(1740, 140, 100, 20));
    this.platforms.push(new Platform(1880, 290, 80, 20));

    // Section finale (1600-2200px)
    this.platforms.push(new Platform(2000, 220, 120, 20));
    this.platforms.push(new Platform(2160, 140, 100, 20));
    this.platforms.push(new Platform(1850, 390, 200, 20));

    // Plateformes hautes - Chemins alternatifs
    this.platforms.push(new Platform(450, 90, 200, 15));
    this.platforms.push(new Platform(750, 60, 150, 15));
    this.platforms.push(new Platform(1050, 20, 180, 15));
    this.platforms.push(new Platform(1400, 10, 250, 15));
    this.platforms.push(new Platform(1750, 30, 200, 15));

    // Murs verticaux
    this.platforms.push(new Platform(150, 340, 20, 130));
    this.platforms.push(new Platform(900, 220, 20, 170));
    this.platforms.push(new Platform(1300, 90, 20, 200));
    this.platforms.push(new Platform(1950, 140, 20, 150));

    // Plateformes de récupération
    this.platforms.push(new Platform(650, 440, 100, 15));
    this.platforms.push(new Platform(1250, 420, 120, 15));
    this.platforms.push(new Platform(1700, 410, 150, 15));

    console.log(`[SUCCESS] Niveau créé avec ${this.platforms.length} plateformes`);
  }

  private createEnemies(): void {
    this.enemies = [];

    // Ennemis dans la première section (400-800px)
    this.enemies.push(new Enemy(750, 380, 120)); // Sur la plateforme longue
    this.enemies.push(new Enemy(650, 220, 150)); // Sur la plateforme du milieu

    // Ennemis dans la section intermédiaire (800-1200px)
    this.enemies.push(new Enemy(1050, 240, 100)); // Plateforme courte
    this.enemies.push(new Enemy(1200, 170, 80)); // Plateforme haute
    this.enemies.push(new Enemy(1400, 320, 120)); // Plateforme large

    // Ennemis dans la section avancée (1200-1600px)
    this.enemies.push(new Enemy(1540, 270, 60)); // Plateforme étroite
    this.enemies.push(new Enemy(1660, 200, 60)); // Saut difficile
    this.enemies.push(new Enemy(1780, 120, 80)); // Plateforme haute

    // Ennemis au sol pour plus de difficulté
    this.enemies.push(
      new Enemy(500, this.levelHeight - 50 - GAME_CONFIG.ENEMIES.HEIGHT, 200)
    );
    this.enemies.push(
      new Enemy(1000, this.levelHeight - 50 - GAME_CONFIG.ENEMIES.HEIGHT, 180)
    );
    this.enemies.push(
      new Enemy(1600, this.levelHeight - 50 - GAME_CONFIG.ENEMIES.HEIGHT, 220)
    );

    // Ennemi de fin pour corser la finalisation
    this.enemies.push(new Enemy(1900, 370, 140)); // Avant la zone finale

    console.log(`[GAME] ${this.enemies.length} ennemis placés dans le niveau`);
  }

  private createProjectileSpawners(): void {
    // Initialiser les projectiles (ils seront créés dynamiquement)
    this.projectiles = [];
    
    // Configurer les spawners par défaut pour le niveau original
    this.projectileSpawners = [
      { id: 'spawner_1', position: { x: 800, y: 380 }, direction: -1, angle: 0, interval: 4000, color: '#FF9800', properties: { speed: 250, lifetime: 3000 } },
      { id: 'spawner_2', position: { x: 1200, y: 200 }, direction: 1, angle: 0, interval: 4000, color: '#FF9800', properties: { speed: 250, lifetime: 3000 } },
      { id: 'spawner_3', position: { x: 1600, y: 320 }, direction: -1, angle: -Math.PI/6, interval: 4000, color: '#FF9800', properties: { speed: 250, lifetime: 3000 } },
      { id: 'spawner_4', position: { x: 500, y: this.levelHeight - 100 }, direction: 1, angle: -Math.PI/4, interval: 4000, color: '#FF9800', properties: { speed: 250, lifetime: 3000 } },
      { id: 'spawner_5', position: { x: 1800, y: 250 }, direction: -1, angle: Math.PI/6, interval: 4000, color: '#FF9800', properties: { speed: 250, lifetime: 3000 } }
    ];
    
    // Reset des timers
    this.spawnerTimers.clear();

    console.log(`[LEVEL] ${this.projectileSpawners.length} spawners de projectiles configurés`);
  }

  private spawnProjectile(x: number, y: number, direction: number, angle: number = 0): void {
    const projectile = new Projectile(x, y, direction, angle);
    this.projectiles.push(projectile);
  }

  private setupGameLoop(): void {
    this.gameLoop.setUpdateCallback((deltaTime: number) => {
      this.update(deltaTime);
    });

    this.gameLoop.setRenderCallback(() => {
      this.render();
      this.currentFPS = this.gameLoop.getFPS();
    });
  }

  private update(deltaTime: number): void {
    // Traiter les inputs
    this.handleInput();

    if (this.isPaused) return;

    const wasOnGround = this.player.isOnGround;

    // NE PAS réinitialiser isOnGround ici - laissez les collisions s'en charger

    // Mise à jour du joueur avec SA physique originale
    this.updatePlayerPhysics(deltaTime);

    // Mise à jour des ennemis
    this.updateEnemies(deltaTime);

    // Mise à jour des projectiles
    this.updateProjectiles(deltaTime);

    // Mise à jour des plateformes spéciales
    this.updateSpecialPlatforms(deltaTime);

    // Gérer les collisions (qui gèrera isOnGround correctement)
    this.handleCollisions();

    // Gérer l'invulnérabilité
    this.updateInvulnerability(deltaTime);

    // Gérer les collisions avec les ennemis
    this.handleEnemyCollisions();

    // Gérer les collisions avec les projectiles
    this.handleProjectileCollisions();

    // Mise à jour de la caméra
    this.camera.update(this.player, deltaTime);

    // Vérifications du niveau
    this.checkLevelBounds();
    this.checkLevelCompletion();

    // Détection d'atterrissage
    if (!wasOnGround && this.player.isOnGround) {
      console.log("[GAME] Atterrissage détecté");
    }
  }

  private updatePlayerPhysics(deltaTime: number): void {
    // Utiliser la méthode update() originale du Player
    this.player.update(deltaTime);
  }

  private updateEnemies(deltaTime: number): void {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      // Mise à jour physique de base
      enemy.update(deltaTime);

      // Vérifier les bords de plateforme
      enemy.checkPlatformEdge(this.platforms);

      // Gérer les collisions ennemi-plateforme
      this.handleEnemyPlatformCollisions(enemy);
    }
  }

  private updateProjectiles(deltaTime: number): void {
    // Mettre à jour tous les projectiles actifs
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      if (!projectile.isActive) {
        // Supprimer les projectiles inactifs
        this.projectiles.splice(i, 1);
        continue;
      }

      // Mise à jour physique du projectile
      projectile.update(deltaTime);

      // Vérifier si le projectile est hors des limites
      if (projectile.isOutOfBounds(this.levelWidth, this.levelHeight)) {
        projectile.destroy();
        continue;
      }

      // Vérifier les collisions avec les plateformes
      projectile.checkPlatformCollision(this.platforms);
    }

    // Spawner périodiquement de nouveaux projectiles
    this.handleProjectileSpawning(deltaTime);
  }

  private projectileSpawners: ProjectileSpawnerData[] = [];
  private spawnerTimers: Map<string, number> = new Map();

  private handleProjectileSpawning(deltaTime: number): void {
    // Ne spawn que si on a des spawners configurés
    if (this.projectileSpawners.length === 0) {
      return;
    }

    // Traiter chaque spawner individuellement avec son propre timer
    for (const spawner of this.projectileSpawners) {
      // Initialiser le timer s'il n'existe pas
      if (!this.spawnerTimers.has(spawner.id)) {
        this.spawnerTimers.set(spawner.id, 0);
      }

      // Mettre à jour le timer du spawner
      const currentTimer = this.spawnerTimers.get(spawner.id)! + deltaTime * 1000; // Convertir en millisecondes
      this.spawnerTimers.set(spawner.id, currentTimer);

      // Vérifier si il est temps de spawn
      if (currentTimer >= spawner.interval) {
        this.spawnerTimers.set(spawner.id, 0); // Reset du timer
        console.log(`[PROJECTILE] Spawning projectile with angle: ${spawner.angle} radians (${(spawner.angle * 180 / Math.PI).toFixed(1)} degrees)`);
        this.spawnProjectile(
          spawner.position.x,
          spawner.position.y,
          spawner.direction,
          spawner.angle
        );
      }
    }
  }

  private updateSpecialPlatforms(deltaTime: number): void {
    for (const platform of this.platforms) {
      if (platform instanceof FallingPlatform || platform instanceof UppingPlatform) {
        platform.update(deltaTime);
      }
    }
  }

  private updateInvulnerability(deltaTime: number): void {
    if (this.isPlayerInvulnerable) {
      this.invulnerabilityTime -= deltaTime;
      if (this.invulnerabilityTime <= 0) {
        this.isPlayerInvulnerable = false;
        console.log("[GAME] Invulnérabilité terminée");
      }
    }
  }

  private handleEnemyPlatformCollisions(enemy: Enemy): void {
    const collision = CollisionDetector.checkPlayerPlatformCollision(
      enemy as any, // Cast temporaire pour réutiliser la fonction
      this.platforms
    );

    if (collision.hasCollision && collision.side) {
      enemy.resolveCollision(collision.side, collision.penetration);
    }
  }

  private handleEnemyCollisions(): void {
    if (this.isPlayerInvulnerable) return;

    const playerBounds = this.player.getBounds();

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      const enemyBounds = enemy.getBounds();

      // Vérifier collision joueur-ennemi
      if (this.aabbIntersect(playerBounds, enemyBounds)) {
        // Vérifier si le joueur saute sur l'ennemi
        if (
          this.player.velocity.y > 0 &&
          playerBounds.y + playerBounds.height - 10 < enemyBounds.y
        ) {
          // Joueur élimine l'ennemi en sautant dessus
          enemy.eliminate();
          this.player.setVelocity(
            this.player.velocity.x,
            -GAME_CONFIG.PLAYER.JUMP_POWER * 1.0
          ); // Petit rebond
          console.log("[GAME] Ennemi éliminé en sautant dessus!");
        } else {
          // Joueur prend des dégâts
          this.playerTakesDamage();
        }
      }
    }
  }

  private playerTakesDamage(): void {
    if (this.isPlayerInvulnerable) return;

    this.playerLives--;
    this.isPlayerInvulnerable = true;
    this.invulnerabilityTime = this.INVULNERABILITY_DURATION;

    console.log(`[GAME] Joueur touché! Vies restantes: ${this.playerLives}`);

    // Effet de recul
    this.player.velocity.x *= -0.5; // Recul horizontal
    this.player.velocity.y = -200; // Petit saut

    if (this.playerLives <= 0) {
      console.log("[GAME] Game Over!");
      this.respawnPlayer();
    }
  }

  private handleProjectileCollisions(): void {
    if (this.isPlayerInvulnerable) return;

    const playerBounds = this.player.getBounds();

    for (const projectile of this.projectiles) {
      if (!projectile.isActive || !projectile.canDealDamage) continue;

      const projectileBounds = projectile.getBounds();

      // Vérifier collision joueur-projectile
      if (this.aabbIntersect(playerBounds, projectileBounds)) {
        // Le projectile touche le joueur
        if (projectile.dealDamage()) {
          console.log("[GAME] Joueur touché par un projectile!");
          this.playerTakesDamage();
          
          // Détruire le projectile après impact
          projectile.destroy();
        }
      }
    }
  }

  private aabbIntersect(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect2.x + rect2.width <= rect1.x ||
      rect1.y + rect1.height <= rect2.y ||
      rect2.y + rect2.height <= rect1.y
    );
  }

  private handleInput(): void {
    this.inputManager.update();

    // Toggle debug avec F1
    if (this.inputManager.isDebugToggleJustPressed()) {
      this.toggleDebugMode();
    }

    if (this.inputManager.isPauseJustPressed()) {
      this.togglePause();
    }

    if (this.isPaused) return;

    // Gérer les mouvements du joueur
    this.handlePlayerMovement();

    // Reset du joueur
    if (
      this.inputManager.isKeyPressed("r") ||
      this.inputManager.isKeyPressed("R")
    ) {
      this.respawnPlayer();
    }
  }
  private toggleDebugMode(): void {
    // Créer une copie modifiable de GAME_CONFIG.DEBUG
    const debug = GAME_CONFIG.DEBUG as any;

    // Basculer les options de debug principales
    debug.SHOW_COLLISION_BOXES = !debug.SHOW_COLLISION_BOXES;
    debug.SHOW_FPS = !debug.SHOW_FPS;
    debug.SHOW_VELOCITY_VECTORS = !debug.SHOW_VELOCITY_VECTORS;

    console.log(
      `[DEBUG] Debug ${debug.SHOW_COLLISION_BOXES ? "ACTIVÉ" : "DÉSACTIVÉ"}`
    );
    console.log(`   - Boîtes de collision: ${debug.SHOW_COLLISION_BOXES}`);
    console.log(`   - FPS et infos: ${debug.SHOW_FPS}`);
    console.log(`   - Vecteurs de vitesse: ${debug.SHOW_VELOCITY_VECTORS}`);
  }

  private handlePlayerMovement(): void {
    // Récupérer l'état des touches
    const leftPressed = this.inputManager.isLeftPressed();
    const rightPressed = this.inputManager.isRightPressed();
    const jumpJustPressed = this.inputManager.isJumpJustPressed();

    // Déterminer la direction horizontale pour le saut
    let horizontalInput = 0;
    if (leftPressed && !rightPressed) {
      horizontalInput = -1;
    } else if (rightPressed && !leftPressed) {
      horizontalInput = 1;
    }

    // Gestion du saut EN PREMIER
    if (jumpJustPressed) {
      console.log(`[GAME] Tentative de saut avec direction: ${horizontalInput}`);
      this.player.jump(horizontalInput);
    }

    // Gestion du mouvement horizontal
    if (leftPressed && !rightPressed) {
      this.player.moveLeft();
    } else if (rightPressed && !leftPressed) {
      this.player.moveRight();
    } else {
      // Aucune touche directionnelle pressée
      this.player.stopHorizontalMovement();
    }
  }

  private handleCollisions(): void {
    // Check for collision to notify special platforms of player contact
    const collision = CollisionDetector.checkPlayerPlatformCollision(this.player, this.platforms);
    if (collision.hasCollision && collision.platform && collision.side === "top") {
      // Player is standing on a platform - notify if it's a special platform
      if (collision.platform instanceof FallingPlatform) {
        collision.platform.onPlayerContact();
      } else if (collision.platform instanceof UppingPlatform) {
        collision.platform.onPlayerContact();
      }
    }

    // Utiliser la résolution de collision séparée par axes
    CollisionDetector.resolveCollisionsSeparated(this.player, this.platforms);

    // Vérification supplémentaire de l'état au sol pour éviter les bugs
    const wasOnGround = this.player.isOnGround;

    // Vérifier si le joueur est vraiment au sol avec la méthode du CollisionDetector
    this.player.isOnGround = CollisionDetector.isPlayerOnGround(
      this.player,
      this.platforms
    );

    // Si le joueur vient d'atterrir, réinitialiser isJumping
    if (!wasOnGround && this.player.isOnGround) {
      this.player.isJumping = false;
      console.log("[GAME] Atterrissage confirmé par collision");
    }

    // Debug pour voir les changements d'état
    if (!wasOnGround && this.player.isOnGround) {
      console.log("[GAME] Joueur a atterri");
    } else if (wasOnGround && !this.player.isOnGround) {
      console.log("[GAME] Joueur a quitté le sol");
    }
  }

  private checkLevelBounds(): void {
    // Limites horizontales
    if (this.player.position.x < 0) {
      this.player.position.x = 0;
      this.player.velocity.x = 0;
    } else if (this.player.position.x + this.player.size.x > this.levelWidth) {
      this.player.position.x = this.levelWidth - this.player.size.x;
      this.player.velocity.x = 0;
    }

    // Chute dans le vide (bas)
    if (this.player.position.y > this.levelHeight + 100) {
      console.log("[GAME] Joueur tombé dans le vide");
      this.respawnPlayer();
    }
    
    // Sortie par le haut (plateformes pièges)
    if (this.player.position.y + this.player.size.y < -50) {
      console.log("[GAME] Joueur emmené hors du niveau par une plateforme piège");
      this.respawnPlayer();
    }
  }

  private checkLevelCompletion(): void {
    const playerX = this.player.position.x + this.player.size.x / 2;
    const playerY = this.player.position.y + this.player.size.y / 2;

    if (
      playerX >= this.finishZone.x &&
      playerX <= this.finishZone.x + this.finishZone.width &&
      playerY >= this.finishZone.y &&
      playerY <= this.finishZone.y + this.finishZone.height &&
      !this.levelCompleted
    ) {
      this.levelCompleted = true;
      console.log("[SUCCESS] NIVEAU TERMINÉ ! Félicitations !");
    }
  }

  private respawnPlayer(): void {
    // Utiliser la position de spawn du niveau actuel
    if (this.customLevel) {
      this.player.position.x = this.customLevel.playerStart.x;
      this.player.position.y = this.customLevel.playerStart.y;
    } else {
      this.player.position.x = GAME_CONFIG.PLAYER.STARTING_X;
      this.player.position.y = GAME_CONFIG.PLAYER.STARTING_Y;
    }
    this.player.velocity.x = 0;
    this.player.velocity.y = 0;
    this.player.isOnGround = false;
    this.player.isJumping = false;
    this.levelCompleted = false;

    // Réinitialiser les propriétés de gameplay
    this.playerLives = 3;
    this.isPlayerInvulnerable = false;
    this.invulnerabilityTime = 0;

    // Réinitialiser les ennemis et projectiles
    this.resetEnemies();
    this.resetProjectiles();

    this.camera.snapToPlayer(this.player);
    console.log("[GAME] Joueur respawné au point de départ");
  }

  private resetEnemies(): void {
    // Recréer les ennemis selon le niveau actuel
    if (this.customLevel) {
      this.loadEnemiesFromLevel(this.customLevel.enemies);
      console.log("[GAME] Ennemis du niveau personnalisé réinitialisés");
    } else {
      this.createEnemies();
      console.log("[GAME] Ennemis du niveau par défaut réinitialisés");
    }
  }

  private resetProjectiles(): void {
    // Détruire tous les projectiles existants
    for (const projectile of this.projectiles) {
      projectile.destroy();
    }
    this.projectiles = [];
    
    // Réinitialiser les timers de spawn
    this.spawnerTimers.clear();
    
    // Reconfigurer les spawners selon le niveau actuel
    if (this.customLevel) {
      this.loadProjectileSpawnersFromLevel(this.customLevel.projectileSpawners);
      console.log("[GAME] Spawners du niveau personnalisé réinitialisés");
    } else {
      this.createProjectileSpawners();
      console.log("[GAME] Spawners du niveau par défaut réinitialisés");
    }
  }

  private render(): void {
    this.renderer.clear();

    // Appliquer la transformation de la caméra
    this.camera.applyTransform(this.ctx);

    // Dessiner le monde
    this.renderWorld();

    // Retirer la transformation
    this.camera.removeTransform(this.ctx);

    // Dessiner l'UI
    this.renderUI();
  }

  private renderWorld(): void {
    this.renderBackground();
    this.renderSpecialZones();
    this.renderPlatforms();
    this.renderProjectiles();
    this.renderEnemies();
    this.renderPlayer();

    if (GAME_CONFIG.DEBUG.SHOW_CAMERA_BOUNDS) {
      this.camera.renderDebug(this.ctx);
    }
  }

  private renderPlayer(): void {
    // Effet de clignotement quand invulnérable
    if (this.isPlayerInvulnerable) {
      const blinkSpeed = 10; // Vitesse de clignotement
      const show = Math.floor(Date.now() / (1000 / blinkSpeed)) % 2 === 0;
      if (show) {
        this.player.render(this.ctx);
      }
    } else {
      this.player.render(this.ctx);
    }
  }

  private renderProjectiles(): void {
    for (const projectile of this.projectiles) {
      if (
        projectile.isActive &&
        this.camera.isVisible(
          projectile.position.x,
          projectile.position.y,
          projectile.size.x,
          projectile.size.y
        )
      ) {
        projectile.render(this.ctx);
      }
    }
  }

  private renderEnemies(): void {
    for (const enemy of this.enemies) {
      if (
        enemy.isAlive &&
        this.camera.isVisible(
          enemy.position.x,
          enemy.position.y,
          enemy.size.x,
          enemy.size.y
        )
      ) {
        enemy.render(this.ctx);
      }
    }
  }

  private renderBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.levelHeight);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(0.7, "#98D8E8");
    gradient.addColorStop(1, "#B0E0E6");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.levelWidth, this.levelHeight);

    if (GAME_CONFIG.DEBUG.SHOW_GRID) {
      this.renderDebugGrid();
    }
  }

  private renderSpecialZones(): void {
    // Zone de départ
    this.ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
    this.ctx.fillRect(
      this.startZone.x,
      this.startZone.y,
      this.startZone.width,
      this.startZone.height
    );
    this.ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(
      this.startZone.x,
      this.startZone.y,
      this.startZone.width,
      this.startZone.height
    );

    // Zone d'arrivée
    this.ctx.fillStyle = this.levelCompleted
      ? "rgba(255, 215, 0, 0.5)"
      : "rgba(255, 215, 0, 0.2)";
    this.ctx.fillRect(
      this.finishZone.x,
      this.finishZone.y,
      this.finishZone.width,
      this.finishZone.height
    );
    this.ctx.strokeStyle = this.levelCompleted
      ? "rgba(255, 215, 0, 1)"
      : "rgba(255, 215, 0, 0.8)";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(
      this.finishZone.x,
      this.finishZone.y,
      this.finishZone.width,
      this.finishZone.height
    );

    // Texte des zones
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.font = "bold 24px Arial";
    this.ctx.textAlign = "center";

    this.ctx.fillText(
      "DÉPART",
      this.startZone.x + this.startZone.width / 2,
      this.startZone.y + 40
    );
    this.ctx.fillText(
      this.levelCompleted ? "VICTOIRE!" : "ARRIVÉE",
      this.finishZone.x + this.finishZone.width / 2,
      this.finishZone.y + 40
    );

    this.renderProgressIndicator();
    this.ctx.textAlign = "left";
  }

  private renderProgressIndicator(): void {
    const progressBarWidth = this.levelWidth;
    const progressBarHeight = 8;
    const progressBarY = 20;

    // Fond de la barre
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    this.ctx.fillRect(0, progressBarY, progressBarWidth, progressBarHeight);

    // Progression actuelle
    const playerProgress = Math.max(
      0,
      Math.min(
        1,
        (this.player.position.x + this.player.size.x / 2) / this.levelWidth
      )
    );

    this.ctx.fillStyle = this.levelCompleted ? "#FFD700" : "#4CAF50";
    this.ctx.fillRect(
      0,
      progressBarY,
      progressBarWidth * playerProgress,
      progressBarHeight
    );

    // Bordure
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, progressBarY, progressBarWidth, progressBarHeight);
  }

  private renderPlatforms(): void {
    for (const platform of this.platforms) {
      if (
        this.camera.isVisible(
          platform.position.x,
          platform.position.y,
          platform.size.x,
          platform.size.y
        )
      ) {
        platform.render(this.ctx);
      }
    }
  }

  private renderDebugGrid(): void {
    const gridSize = GAME_CONFIG.LEVEL.GRID_SIZE;
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.levelWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.levelHeight);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.levelHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.levelWidth, y);
      this.ctx.stroke();
    }
  }

  private renderUI(): void {
    if (GAME_CONFIG.DEBUG.SHOW_FPS) {
      this.renderDebugInfo();
    }

    this.renderGameInfo();
    this.renderInstructions();

    if (this.isPaused) {
      this.renderPauseScreen();
    }

    if (this.levelCompleted) {
      this.renderVictoryOverlay();
    }
  }

  private renderDebugInfo(): void {
    const playerPos = this.player.position;
    const playerVel = this.player.velocity;
    const cameraPos = this.camera.position;
    const progressPercent =
      ((playerPos.x + this.player.size.x / 2) / this.levelWidth) * 100;
    const aliveEnemies = this.enemies.filter((e) => e.isAlive).length;
    const activeProjectiles = this.projectiles.filter((p) => p.isActive).length;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(5, 5, 350, 200);

    this.ctx.fillStyle = "white";
    this.ctx.font = "12px Arial";

    let y = 20;
    const lineHeight = 16;

    this.ctx.fillText(`FPS: ${Math.round(this.currentFPS)}`, 10, y);
    y += lineHeight;
    this.ctx.fillText(
      `Position: (${playerPos.x.toFixed(0)}, ${playerPos.y.toFixed(0)})`,
      10,
      y
    );
    y += lineHeight;
    this.ctx.fillText(
      `Vitesse: (${playerVel.x.toFixed(1)}, ${playerVel.y.toFixed(1)})`,
      10,
      y
    );
    y += lineHeight;
    this.ctx.fillText(
      `Caméra: (${cameraPos.x.toFixed(0)}, ${cameraPos.y.toFixed(0)})`,
      10,
      y
    );
    y += lineHeight;
    this.ctx.fillText(`Progression: ${progressPercent.toFixed(1)}%`, 10, y);
    y += lineHeight;
    this.ctx.fillText(
      `Au sol: ${this.player.isOnGround ? "Oui" : "Non"}`,
      10,
      y
    );
    y += lineHeight;
    this.ctx.fillText(`Plateformes: ${this.platforms.length}`, 10, y);
    y += lineHeight;
    this.ctx.fillText(
      `Ennemis vivants: ${aliveEnemies}/${this.enemies.length}`,
      10,
      y
    );
    y += lineHeight;
    this.ctx.fillText(`Vies: ${this.playerLives}`, 10, y);
    y += lineHeight;
    this.ctx.fillText(
      `Invulnérable: ${this.isPlayerInvulnerable ? "Oui" : "Non"}`,
      10,
      y
    );
    y += lineHeight;
    this.ctx.fillText(
      `Projectiles actifs: ${activeProjectiles}`,
      10,
      y
    );
    y += lineHeight;
    this.ctx.fillText(`Niveau: ${this.levelWidth}x${this.levelHeight}`, 10, y);
  }

  private renderGameInfo(): void {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(GAME_CONFIG.CANVAS.WIDTH - 220, 5, 215, 80);

    this.ctx.fillStyle = "white";
    this.ctx.font = "14px Arial";

    const progressPercent =
      ((this.player.position.x + this.player.size.x / 2) / this.levelWidth) *
      100;
    const aliveEnemies = this.enemies.filter((e) => e.isAlive).length;
    const activeProjectiles = this.projectiles.filter((p) => p.isActive).length;

    let y = 25;
    this.ctx.fillText("Niveau avec Dangers", GAME_CONFIG.CANVAS.WIDTH - 210, y);
    y += 18;
    this.ctx.fillText(
      `Progression: ${progressPercent.toFixed(0)}%`,
      GAME_CONFIG.CANVAS.WIDTH - 210,
      y
    );
    y += 18;
    this.ctx.fillText(
      `Vies: ${this.playerLives}`,
      GAME_CONFIG.CANVAS.WIDTH - 210,
      y
    );
    y += 18;
    this.ctx.fillText(
      `[GAME] Ennemis: ${aliveEnemies} | Projectiles: ${activeProjectiles}`,
      GAME_CONFIG.CANVAS.WIDTH - 210,
      y
    );
  }

  private renderInstructions(): void {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(5, GAME_CONFIG.CANVAS.HEIGHT - 110, 500, 105);

    this.ctx.fillStyle = "white";
    this.ctx.font = "14px Arial";

    let y = GAME_CONFIG.CANVAS.HEIGHT - 90;
    const lineHeight = 18;

    this.ctx.fillText("Flèches : Déplacer | Espace : Sauter", 10, y);
    y += lineHeight;
    this.ctx.fillText("R : Respawn | Échap : Pause", 10, y);
    y += lineHeight;
    this.ctx.fillText("Sautez sur les ennemis pour les éliminer", 10, y);
    y += lineHeight;
    this.ctx.fillText("[WARNING] Évitez ennemis et projectiles orange", 10, y);
    y += lineHeight;
    this.ctx.fillText("[LEVEL] Objectif : Atteindre la zone dorée (arrivée)", 10, y);
  }

  private renderPauseScreen(): void {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(
      0,
      0,
      GAME_CONFIG.CANVAS.WIDTH,
      GAME_CONFIG.CANVAS.HEIGHT
    );

    this.ctx.fillStyle = "white";
    this.ctx.font = "48px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "PAUSE",
      GAME_CONFIG.CANVAS.WIDTH / 2,
      GAME_CONFIG.CANVAS.HEIGHT / 2
    );

    this.ctx.font = "24px Arial";
    this.ctx.fillText(
      "Appuyez sur Échap pour reprendre",
      GAME_CONFIG.CANVAS.WIDTH / 2,
      GAME_CONFIG.CANVAS.HEIGHT / 2 + 50
    );

    this.ctx.textAlign = "left";
  }

  private renderVictoryOverlay(): void {
    this.ctx.fillStyle = "rgba(255, 215, 0, 0.9)";
    this.ctx.fillRect(
      0,
      0,
      GAME_CONFIG.CANVAS.WIDTH,
      GAME_CONFIG.CANVAS.HEIGHT
    );

    this.ctx.fillStyle = "#333";
    this.ctx.font = "bold 64px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "VICTOIRE!",
      GAME_CONFIG.CANVAS.WIDTH / 2,
      GAME_CONFIG.CANVAS.HEIGHT / 2 - 50
    );

    this.ctx.font = "32px Arial";
    this.ctx.fillText(
      "Niveau Terminé!",
      GAME_CONFIG.CANVAS.WIDTH / 2,
      GAME_CONFIG.CANVAS.HEIGHT / 2 + 20
    );

    const aliveEnemies = this.enemies.filter((e) => e.isAlive).length;
    const eliminatedEnemies = this.enemies.length - aliveEnemies;

    this.ctx.font = "18px Arial";
    this.ctx.fillText(
      `Ennemis éliminés: ${eliminatedEnemies}/${this.enemies.length}`,
      GAME_CONFIG.CANVAS.WIDTH / 2,
      GAME_CONFIG.CANVAS.HEIGHT / 2 + 60
    );

    this.ctx.fillText(
      "Appuyez sur R pour recommencer",
      GAME_CONFIG.CANVAS.WIDTH / 2,
      GAME_CONFIG.CANVAS.HEIGHT / 2 + 100
    );

    this.ctx.textAlign = "left";
  }

  // Méthodes publiques
  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.gameLoop.start();
      console.log(
        `[LAUNCH] Jeu démarré - Niveau avec ennemis et projectiles ${this.levelWidth}x${this.levelHeight}`
      );
    }
  }

  public stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      this.gameLoop.stop();
      console.log("[GAME] Jeu arrêté");
    }
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;
    console.log(this.isPaused ? "[GAME] Jeu en pause" : "[GAME] Jeu repris");
  }

  public destroy(): void {
    this.stop();
    this.inputManager.destroy();
  }

  // Getters
  public getPlayer(): Player {
    return this.player;
  }
  public getCamera(): Camera {
    return this.camera;
  }
  public getPlatforms(): Platform[] {
    return this.platforms;
  }
  public getEnemies(): Enemy[] {
    return this.enemies;
  }
  public getProjectiles(): Projectile[] {
    return this.projectiles;
  }
  public getIsRunning(): boolean {
    return this.isRunning;
  }
  public getIsPaused(): boolean {
    return this.isPaused;
  }
  public getLevelDimensions(): { width: number; height: number } {
    return { width: this.levelWidth, height: this.levelHeight };
  }
  public isLevelCompleted(): boolean {
    return this.levelCompleted;
  }
  public getPlayerProgress(): number {
    return (this.player.position.x + this.player.size.x / 2) / this.levelWidth;
  }
  public getPlayerLives(): number {
    return this.playerLives;
  }
  public getAliveEnemiesCount(): number {
    return this.enemies.filter((e) => e.isAlive).length;
  }
  public getActiveProjectilesCount(): number {
    return this.projectiles.filter((p) => p.isActive).length;
  }

  // Charger un niveau personnalisé depuis LevelData
  public loadCustomLevel(levelData: LevelData): void {
    console.log(`[GAME] Chargement du niveau personnalisé: ${levelData.name}`);
    
    this.customLevel = levelData;
    
    // Mettre à jour les dimensions du niveau
    this.levelWidth = levelData.width;
    this.levelHeight = levelData.height;
    
    // Mettre à jour les zones spéciales
    this.startZone = { 
      x: levelData.playerStart.x - 50, 
      y: levelData.playerStart.y - 50, 
      width: 100, 
      height: 100 
    };
    this.finishZone = { 
      x: levelData.finishLine.x - 50, 
      y: levelData.finishLine.y, 
      width: 100, 
      height: levelData.height 
    };
    
    // Repositionner le joueur au point de spawn
    this.player.position.x = levelData.playerStart.x;
    this.player.position.y = levelData.playerStart.y;
    this.player.velocity.x = 0;
    this.player.velocity.y = 0;
    
    // Charger les plateformes depuis le niveau
    this.loadPlatformsFromLevel(levelData.platforms);
    
    // Charger les ennemis depuis le niveau
    this.loadEnemiesFromLevel(levelData.enemies);
    
    // Charger les spawners de projectiles depuis le niveau
    this.loadProjectileSpawnersFromLevel(levelData.projectileSpawners);
    
    // Mettre à jour la caméra
    this.camera.updateLevelBounds(this.levelWidth, this.levelHeight);
    this.camera.snapToPlayer(this.player);
    
    // Reset du statut du niveau
    this.levelCompleted = false;
    this.playerLives = 3;
    this.isPlayerInvulnerable = false;
    this.invulnerabilityTime = 0;
    
    console.log(`[SUCCESS] Niveau "${levelData.name}" chargé avec succès!`);
    console.log(`[LEVEL] Dimensions: ${this.levelWidth}x${this.levelHeight}`);
    console.log(`[LEVEL] ${this.platforms.length} plateformes`);
    console.log(`[LEVEL] ${this.enemies.length} ennemis`);
    console.log(`[LEVEL] Spawners de projectiles configurés`);
  }

  private loadPlatformsFromLevel(platformsData: PlatformData[]): void {
    this.platforms = [];
    
    for (const platData of platformsData) {
      // Create appropriate platform type based on data
      if (platData.type === PlatformType.FALLING) {
        const platform = new FallingPlatform(
          platData.position.x,
          platData.position.y,
          platData.size.x,
          platData.size.y
        );
        this.platforms.push(platform);
        console.log(`[LEVEL] Created falling platform at (${platData.position.x}, ${platData.position.y})`);
      } else if (platData.type === PlatformType.UPPING) {
        const platform = new UppingPlatform(
          platData.position.x,
          platData.position.y,
          platData.size.x,
          platData.size.y
        );
        this.platforms.push(platform);
        console.log(`[LEVEL] Created upping platform at (${platData.position.x}, ${platData.position.y})`);
      } else {
        // Default to regular platform for any other type (including undefined)
        const platform = new Platform(
          platData.position.x,
          platData.position.y,
          platData.size.x,
          platData.size.y
        );
        this.platforms.push(platform);
      }
    }
    
    console.log(`[LEVEL] ${this.platforms.length} platforms loaded (${this.platforms.filter(p => p instanceof FallingPlatform).length} falling, ${this.platforms.filter(p => p instanceof UppingPlatform).length} upping)`);
  }

  private loadEnemiesFromLevel(enemiesData: EnemyData[]): void {
    this.enemies = [];
    
    for (const enemyData of enemiesData) {
      const enemy = new Enemy(
        enemyData.position.x,
        enemyData.position.y,
        enemyData.properties.patrolDistance
      );
      this.enemies.push(enemy);
    }
  }

  private loadProjectileSpawnersFromLevel(spawnersData: ProjectileSpawnerData[]): void {
    // Reset des projectiles existants
    this.projectiles = [];
    
    // Sauvegarder les spawners pour le système périodique
    this.projectileSpawners = [...spawnersData];
    
    // Reset des timers
    this.spawnerTimers.clear();
    
    console.log(`[LEVEL] ${spawnersData.length} spawners de projectiles configurés`);
    spawnersData.forEach((spawner, index) => {
      // Ensure angle exists for backward compatibility
      if (spawner.angle === undefined) {
        spawner.angle = 0;
        console.log(`[LEVEL] Warning: Spawner ${index} missing angle, defaulting to 0`);
      }
      console.log(`[LEVEL] Spawner ${index}: direction=${spawner.direction}, angle=${spawner.angle} (${(spawner.angle * 180 / Math.PI).toFixed(1)}°), interval=${spawner.interval}`);
    });
  }

  // Restaurer le niveau par défaut
  public loadDefaultLevel(): void {
    console.log(`[GAME] Retour au niveau par défaut`);
    
    this.customLevel = null;
    
    // Restaurer les dimensions par défaut
    this.levelWidth = GAME_CONFIG.LEVEL.DEFAULT_WIDTH;
    this.levelHeight = GAME_CONFIG.LEVEL.DEFAULT_HEIGHT;
    
    // Restaurer les zones par défaut
    this.startZone = { x: 0, y: 0, width: 200, height: 600 };
    this.finishZone = { x: 2200, y: 0, width: 200, height: 600 };
    
    // Repositionner le joueur
    this.player.position.x = GAME_CONFIG.PLAYER.STARTING_X;
    this.player.position.y = GAME_CONFIG.PLAYER.STARTING_Y;
    this.player.velocity.x = 0;
    this.player.velocity.y = 0;
    
    // Recharger le niveau par défaut
    this.createExtendedLevel();
    this.createEnemies();
    this.createProjectileSpawners();
    
    // Mettre à jour la caméra
    this.camera.updateLevelBounds(this.levelWidth, this.levelHeight);
    this.camera.snapToPlayer(this.player);
    
    // Reset du statut
    this.levelCompleted = false;
    this.playerLives = 3;
    this.isPlayerInvulnerable = false;
    this.invulnerabilityTime = 0;
    
    console.log(`[SUCCESS] Niveau par défaut restauré`);
  }
}
