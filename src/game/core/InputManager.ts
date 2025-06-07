import { GAME_CONFIG } from "../utils/Constants";

export class InputManager {
  private keys: Set<string> = new Set();
  private keysPressed: Set<string> = new Set(); // Touches pressées cette frame
  private keysReleased: Set<string> = new Set(); // Touches relâchées cette frame
  private previousKeys: Set<string> = new Set(); // État des touches la frame précédente
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();

    // S'assurer que le canvas peut recevoir le focus
    this.canvas.tabIndex = 0;
    this.canvas.focus();
  }

  private setupEventListeners(): void {
    // Écouter les événements sur le document pour capturer toutes les touches
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));

    // Écouter le clic sur le canvas pour lui donner le focus
    this.canvas.addEventListener("click", () => {
      this.canvas.focus();
    });

    // Prévenir le comportement par défaut pour certaines touches
    document.addEventListener("keydown", (event) => {
      // Empêcher le scroll avec les flèches et la barre d'espace
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
          event.key
        )
      ) {
        event.preventDefault();
      }
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keys.add(event.key);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.key);
  }

  /**
   * Met à jour l'état des touches pressées/relâchées
   * À appeler une fois par frame
   */
  public update(): void {
    // Nettoyer les événements de la frame précédente
    this.keysPressed.clear();
    this.keysReleased.clear();

    // Détecter les nouvelles touches pressées
    for (const key of this.keys) {
      if (!this.previousKeys.has(key)) {
        this.keysPressed.add(key);
      }
    }

    // Détecter les touches relâchées
    for (const key of this.previousKeys) {
      if (!this.keys.has(key)) {
        this.keysReleased.add(key);
      }
    }

    // Sauvegarder l'état actuel pour la frame suivante
    this.previousKeys.clear();
    for (const key of this.keys) {
      this.previousKeys.add(key);
    }
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }

  /**
   * Vérifie si une touche vient d'être pressée cette frame
   */
  public isKeyJustPressed(key: string): boolean {
    return this.keysPressed.has(key);
  }

  /**
   * Vérifie si une touche vient d'être relâchée cette frame
   */
  public isKeyJustReleased(key: string): boolean {
    return this.keysReleased.has(key);
  }

  // Méthodes de commodité pour les contrôles du joueur
  public isLeftPressed(): boolean {
    return GAME_CONFIG.CONTROLS.MOVE_LEFT.some((key) => this.isKeyPressed(key));
  }

  public isRightPressed(): boolean {
    return GAME_CONFIG.CONTROLS.MOVE_RIGHT.some((key) =>
      this.isKeyPressed(key)
    );
  }

  public isJumpPressed(): boolean {
    return GAME_CONFIG.CONTROLS.JUMP.some((key) => this.isKeyPressed(key));
  }

  public isPausePressed(): boolean {
    return (
      this.isKeyPressed("Escape") ||
      this.isKeyPressed("p") ||
      this.isKeyPressed("P")
    );
  }

  /**
   * Vérifie si la touche pause vient d'être pressée
   */
  public isPauseJustPressed(): boolean {
    return (
      this.isKeyJustPressed("Escape") ||
      this.isKeyJustPressed("p") ||
      this.isKeyJustPressed("P")
    );
  }

  /**
   * Vérifie si une touche de saut vient d'être pressée
   */
  public isJumpJustPressed(): boolean {
    return GAME_CONFIG.CONTROLS.JUMP.some((key) => this.isKeyJustPressed(key));
  }

  // Nettoyer les event listeners
  public destroy(): void {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    document.removeEventListener("keyup", this.handleKeyUp.bind(this));
  }

  // Debug : obtenir toutes les touches pressées
  public getPressedKeys(): string[] {
    return Array.from(this.keys);
  }

  public getJustPressedKeys(): string[] {
    return Array.from(this.keysPressed);
  }

  public getJustReleasedKeys(): string[] {
    return Array.from(this.keysReleased);
  }
}
//   }
