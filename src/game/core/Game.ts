// src/game/core/Game.ts

import { GameLoop } from "./GameLoop";
import { InputManager } from "./InputManager";
import { Renderer } from "../renderer/Renderer";
import { Camera } from "../renderer/Camera";
import { Player } from "../entities/Player";
import { Platform } from "../entities/Platform";
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
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private currentFPS: number = 0;

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

    // Créer le niveau étendu
    this.createExtendedLevel();

    // Initialiser la boucle de jeu
    this.gameLoop = new GameLoop();
    this.setupGameLoop();

    // Centrer la caméra sur le joueur
    this.camera.snapToPlayer(this.player);

    console.log(
      `🎮 Niveau étendu initialisé : ${this.levelWidth}x${this.levelHeight}`
    );
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

    // Réinitialiser l'état
    this.player.isOnGround = false;

    // Mise à jour du joueur avec SA physique originale
    this.updatePlayerPhysics(deltaTime);

    // Gérer les collisions
    this.handleCollisions();

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
    // qui applique exactement la même physique qu'avant
    this.player.update(deltaTime);
  }

  private handleInput(): void {
    this.inputManager.update();

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

  private handlePlayerMovement(): void {
    let isMoving = false;

    if (this.inputManager.isLeftPressed()) {
      this.player.moveLeft();
      isMoving = true;
    }

    if (this.inputManager.isRightPressed()) {
      this.player.moveRight();
      isMoving = true;
    }

    if (this.inputManager.isJumpPressed()) {
      this.player.jump();
    }

    if (!isMoving) {
      this.player.stopHorizontalMovement();
    }
  }

  private handleCollisions(): void {
    // Utiliser la résolution de collision séparée par axes pour éviter le forçage
    CollisionDetector.resolveCollisionsSeparated(this.player, this.platforms);
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

    this.camera.snapToPlayer(this.player);
    console.log("🔄 Joueur respawné au point de départ");
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
    this.player.render(this.ctx);

    if (GAME_CONFIG.DEBUG.SHOW_CAMERA_BOUNDS) {
      this.camera.renderDebug(this.ctx);
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

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(5, 5, 320, 140);

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
    this.ctx.fillText(`Niveau: ${this.levelWidth}x${this.levelHeight}`, 10, y);
  }

  private renderGameInfo(): void {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(GAME_CONFIG.CANVAS.WIDTH - 200, 5, 195, 60);

    this.ctx.fillStyle = "white";
    this.ctx.font = "14px Arial";

    const progressPercent =
      ((this.player.position.x + this.player.size.x / 2) / this.levelWidth) *
      100;

    this.ctx.fillText("Niveau Étendu", GAME_CONFIG.CANVAS.WIDTH - 190, 25);
    this.ctx.fillText(
      `Progression: ${progressPercent.toFixed(0)}%`,
      GAME_CONFIG.CANVAS.WIDTH - 190,
      45
    );
  }

  private renderInstructions(): void {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(5, GAME_CONFIG.CANVAS.HEIGHT - 90, 450, 85);

    this.ctx.fillStyle = "white";
    this.ctx.font = "14px Arial";

    let y = GAME_CONFIG.CANVAS.HEIGHT - 70;
    const lineHeight = 18;

    this.ctx.fillText("🏃 Flèches : Déplacer | Espace : Sauter", 10, y);
    y += lineHeight;
    this.ctx.fillText("🔄 R : Respawn | Échap : Pause", 10, y);
    y += lineHeight;
    this.ctx.fillText("🎯 Objectif : Atteindre la zone dorée (arrivée)", 10, y);
    y += lineHeight;
    this.ctx.fillText(`📏 Niveau : ${this.levelWidth}px de large`, 10, y);
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

    this.ctx.font = "18px Arial";
    this.ctx.fillText(
      "Appuyez sur R pour recommencer",
      GAME_CONFIG.CANVAS.WIDTH / 2,
      GAME_CONFIG.CANVAS.HEIGHT / 2 + 80
    );

    this.ctx.textAlign = "left";
  }

  // Méthodes publiques
  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.gameLoop.start();
      console.log(
        `🎮 Jeu démarré - Niveau étendu ${this.levelWidth}x${this.levelHeight}`
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
}
