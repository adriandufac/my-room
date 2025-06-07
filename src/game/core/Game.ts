// src/game/core/Game.ts

import { GameLoop } from "./GameLoop";
import { InputManager } from "./InputManager";
import { Renderer } from "../renderer/Renderer";
import { Camera } from "../renderer/Camera";
import { Player } from "../entities/Player";
import { Platform } from "../entities/Platform";
import { Enemy } from "../entities/Enemy";
import { CollisionDetector } from "./CollisionDetector";
import { GAME_CONFIG } from "../utils/Constants";

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

    // Créer le niveau étendu avec ennemis
    this.createExtendedLevel();
    this.createEnemies();

    // Initialiser la boucle de jeu
    this.gameLoop = new GameLoop();
    this.setupGameLoop();

    // Centrer la caméra sur le joueur
    this.camera.snapToPlayer(this.player);

    console.log(
      `🎮 Niveau étendu initialisé : ${this.levelWidth}x${this.levelHeight}`
    );
    console.log(`👾 ${this.enemies.length} ennemis créés`);
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

    console.log(`✅ Niveau créé avec ${this.platforms.length} plateformes`);
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

    console.log(`👾 ${this.enemies.length} ennemis placés dans le niveau`);
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

    // Gérer les collisions (qui gèrera isOnGround correctement)
    this.handleCollisions();

    // Gérer l'invulnérabilité
    this.updateInvulnerability(deltaTime);

    // Gérer les collisions avec les ennemis
    this.handleEnemyCollisions();

    // Mise à jour de la caméra
    this.camera.update(this.player, deltaTime);

    // Vérifications du niveau
    this.checkLevelBounds();
    this.checkLevelCompletion();

    // Détection d'atterrissage
    if (!wasOnGround && this.player.isOnGround) {
      console.log("🦶 Atterrissage détecté");
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

  private updateInvulnerability(deltaTime: number): void {
    if (this.isPlayerInvulnerable) {
      this.invulnerabilityTime -= deltaTime;
      if (this.invulnerabilityTime <= 0) {
        this.isPlayerInvulnerable = false;
        console.log("🛡️ Invulnérabilité terminée");
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
          console.log("💥 Ennemi éliminé en sautant dessus!");
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

    console.log(`💔 Joueur touché! Vies restantes: ${this.playerLives}`);

    // Effet de recul
    this.player.velocity.x *= -0.5; // Recul horizontal
    this.player.velocity.y = -200; // Petit saut

    if (this.playerLives <= 0) {
      console.log("💀 Game Over!");
      this.respawnPlayer();
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
      `🔧 Debug ${debug.SHOW_COLLISION_BOXES ? "ACTIVÉ" : "DÉSACTIVÉ"}`
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
      console.log(`🎮 Tentative de saut avec direction: ${horizontalInput}`);
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
      console.log("🦶 Atterrissage confirmé par collision");
    }

    // Debug pour voir les changements d'état
    if (!wasOnGround && this.player.isOnGround) {
      console.log("🦶 Joueur a atterri");
    } else if (wasOnGround && !this.player.isOnGround) {
      console.log("🚀 Joueur a quitté le sol");
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

    // Chute dans le vide
    if (this.player.position.y > this.levelHeight + 100) {
      console.log("💀 Joueur tombé dans le vide");
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
      console.log("🎉 NIVEAU TERMINÉ ! Félicitations !");
    }
  }

  private respawnPlayer(): void {
    this.player.position.x = GAME_CONFIG.PLAYER.STARTING_X;
    this.player.position.y = GAME_CONFIG.PLAYER.STARTING_Y;
    this.player.velocity.x = 0;
    this.player.velocity.y = 0;
    this.player.isOnGround = false;
    this.player.isJumping = false;
    this.levelCompleted = false;

    // Réinitialiser les propriétés de gameplay
    this.playerLives = 3;
    this.isPlayerInvulnerable = false;
    this.invulnerabilityTime = 0;

    // Réinitialiser les ennemis
    this.resetEnemies();

    this.camera.snapToPlayer(this.player);
    console.log("🔄 Joueur respawné au point de départ");
  }

  private resetEnemies(): void {
    // Recréer tous les ennemis
    this.createEnemies();
    console.log("👾 Ennemis réinitialisés");
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

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(5, 5, 350, 180);

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

    let y = 25;
    this.ctx.fillText("Niveau avec Ennemis", GAME_CONFIG.CANVAS.WIDTH - 210, y);
    y += 18;
    this.ctx.fillText(
      `Progression: ${progressPercent.toFixed(0)}%`,
      GAME_CONFIG.CANVAS.WIDTH - 210,
      y
    );
    y += 18;
    this.ctx.fillText(
      `❤️ Vies: ${this.playerLives}`,
      GAME_CONFIG.CANVAS.WIDTH - 210,
      y
    );
    y += 18;
    this.ctx.fillText(
      `👾 Ennemis: ${aliveEnemies}`,
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

    this.ctx.fillText("🏃 Flèches : Déplacer | Espace : Sauter", 10, y);
    y += lineHeight;
    this.ctx.fillText("🔄 R : Respawn | Échap : Pause", 10, y);
    y += lineHeight;
    this.ctx.fillText("💥 Sautez sur les ennemis pour les éliminer", 10, y);
    y += lineHeight;
    this.ctx.fillText("⚠️ Évitez le contact latéral avec les ennemis", 10, y);
    y += lineHeight;
    this.ctx.fillText("🎯 Objectif : Atteindre la zone dorée (arrivée)", 10, y);
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
      "🎉 VICTOIRE! 🎉",
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
        `🎮 Jeu démarré - Niveau avec ennemis ${this.levelWidth}x${this.levelHeight}`
      );
    }
  }

  public stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      this.gameLoop.stop();
      console.log("⏹️ Jeu arrêté");
    }
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;
    console.log(this.isPaused ? "⏸️ Jeu en pause" : "▶️ Jeu repris");
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
}
