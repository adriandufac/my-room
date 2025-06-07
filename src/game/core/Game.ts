import { GameLoop } from "./GameLoop";
import { Renderer } from "../renderer/Renderer";

export class Game {
  private gameLoop: GameLoop;
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;

  // État du jeu
  private isInitialized: boolean = false;

  // Variables de test pour la phase 2.1
  private testRect = {
    x: 100,
    y: 100,
    width: 50,
    height: 50,
    color: "#FF4500",
    velocityX: 100, // pixels par seconde
    velocityY: 80,
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.gameLoop = new GameLoop();

    // Configurer les callbacks de la boucle de jeu
    this.gameLoop.setUpdateCallback(this.update.bind(this));
    this.gameLoop.setRenderCallback(this.render.bind(this));

    console.log("🎮 Jeu initialisé");
  }

  /**
   * Initialise et démarre le jeu
   */
  start(): void {
    if (this.isInitialized) {
      this.gameLoop.start();
      return;
    }

    this.initialize();
    this.gameLoop.start();
    this.isInitialized = true;

    console.log("🚀 Jeu démarré");
  }

  /**
   * Arrête le jeu
   */
  stop(): void {
    this.gameLoop.stop();
    console.log("⏹️ Jeu arrêté");
  }

  /**
   * Met en pause/reprend le jeu
   */
  toggle(): void {
    this.gameLoop.toggle();
  }

  /**
   * Initialisation du jeu
   */
  private initialize(): void {
    const { width, height } = this.renderer.getSize();

    // Position initiale du rectangle de test au centre
    this.testRect.x = width / 2 - this.testRect.width / 2;
    this.testRect.y = height / 2 - this.testRect.height / 2;

    console.log("🔧 Jeu initialisé avec succès");
  }

  /**
   * Mise à jour de la logique du jeu
   */
  private update(deltaTime: number): void {
    // Test : faire bouger le rectangle
    const { width, height } = this.renderer.getSize();

    // Déplacer le rectangle
    this.testRect.x += this.testRect.velocityX * deltaTime;
    this.testRect.y += this.testRect.velocityY * deltaTime;

    // Rebondir sur les bords
    if (
      this.testRect.x <= 0 ||
      this.testRect.x + this.testRect.width >= width
    ) {
      this.testRect.velocityX = -this.testRect.velocityX;
      this.testRect.x = Math.max(
        0,
        Math.min(width - this.testRect.width, this.testRect.x)
      );
    }

    if (
      this.testRect.y <= 0 ||
      this.testRect.y + this.testRect.height >= height
    ) {
      this.testRect.velocityY = -this.testRect.velocityY;
      this.testRect.y = Math.max(
        0,
        Math.min(height - this.testRect.height, this.testRect.y)
      );
    }
  }

  /**
   * Rendu du jeu
   */
  private render(): void {
    // Effacer l'écran
    this.renderer.clear();
    this.renderer.fillBackground("#87CEEB");

    // Dessiner le rectangle de test
    this.renderer.drawRect(
      this.testRect.x,
      this.testRect.y,
      this.testRect.width,
      this.testRect.height,
      this.testRect.color
    );

    // Afficher les informations de debug
    this.renderDebugInfo();
  }

  /**
   * Affiche les informations de debug
   */
  private renderDebugInfo(): void {
    const fps = this.gameLoop.getFPS();
    const deltaTime = this.gameLoop.getDeltaTime();
    const isRunning = this.gameLoop.getIsRunning();

    // FPS et informations
    this.renderer.drawText(`FPS: ${fps}`, 10, 25, "#000000", "18px Arial");
    this.renderer.drawText(
      `Delta: ${(deltaTime * 1000).toFixed(1)}ms`,
      10,
      50,
      "#000000",
      "16px Arial"
    );
    this.renderer.drawText(
      `État: ${isRunning ? "En cours" : "Arrêté"}`,
      10,
      75,
      "#000000",
      "16px Arial"
    );
    this.renderer.drawText(
      `Position: (${Math.round(this.testRect.x)}, ${Math.round(
        this.testRect.y
      )})`,
      10,
      100,
      "#000000",
      "16px Arial"
    );
  }

  /**
   * Obtient les statistiques actuelles
   */
  getStats(): { fps: number; deltaTime: number; isRunning: boolean } {
    return {
      fps: this.gameLoop.getFPS(),
      deltaTime: this.gameLoop.getDeltaTime(),
      isRunning: this.gameLoop.getIsRunning(),
    };
  }

  /**
   * Nettoyage des ressources
   */
  destroy(): void {
    this.gameLoop.stop();
    console.log("🧹 Jeu détruit");
  }
}
