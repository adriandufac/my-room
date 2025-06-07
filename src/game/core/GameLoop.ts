export class GameLoop {
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  // Statistiques FPS
  private fps: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;

  // Callbacks
  private updateCallback: ((deltaTime: number) => void) | null = null;
  private renderCallback: (() => void) | null = null;

  constructor() {
    this.lastTime = performance.now();
  }

  /**
   * Démarre la boucle de jeu
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.fpsUpdateTime = this.lastTime;
    this.frameCount = 0;

    console.log("🎮 Boucle de jeu démarrée");
    this.gameLoop();
  }

  /**
   * Arrête la boucle de jeu
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    console.log("⏸️ Boucle de jeu arrêtée");
  }

  /**
   * Met en pause ou reprend la boucle
   */
  toggle(): void {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Définit la fonction de mise à jour
   */
  setUpdateCallback(callback: (deltaTime: number) => void): void {
    this.updateCallback = callback;
  }

  /**
   * Définit la fonction de rendu
   */
  setRenderCallback(callback: () => void): void {
    this.renderCallback = callback;
  }

  /**
   * Obtient les FPS actuels
   */
  getFPS(): number {
    return Math.round(this.fps);
  }

  /**
   * Obtient le deltaTime actuel
   */
  getDeltaTime(): number {
    return this.deltaTime;
  }

  /**
   * Vérifie si la boucle est en cours
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Boucle principale du jeu
   */
  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastTime) / 1000; // Convertir en secondes
    this.lastTime = currentTime;

    // Limiter le deltaTime pour éviter les sauts temporels
    this.deltaTime = Math.min(this.deltaTime, 1 / 30); // Max 30 FPS minimum

    // Calculer les FPS
    this.frameCount++;
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = (this.frameCount * 1000) / (currentTime - this.fpsUpdateTime);
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }

    // Appeler les callbacks
    if (this.updateCallback) {
      this.updateCallback(this.deltaTime);
    }

    if (this.renderCallback) {
      this.renderCallback();
    }

    // Programmer la prochaine frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
}
