import { GAME_CONFIG } from "../utils/Constants";

export class InputManager {
  private keys: Set<string> = new Set();
  private keysPressed: Set<string> = new Set(); // Touches pressées cette frame
  private keysReleased: Set<string> = new Set(); // Touches relâchées cette frame
  private previousKeys: Set<string> = new Set(); // État des touches la frame précédente
  private canvas: HTMLCanvasElement;
  
  // Références aux event listeners pour pouvoir les supprimer
  private boundKeyDown: (event: KeyboardEvent) => void;
  private boundKeyUp: (event: KeyboardEvent) => void;
  private boundPreventDefault: (event: KeyboardEvent) => void;
  private boundCanvasClick: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    // Créer les références aux event listeners
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundPreventDefault = this.handlePreventDefault.bind(this);
    this.boundCanvasClick = this.handleCanvasClick.bind(this);
    
    this.setupEventListeners();

    // S'assurer que le canvas peut recevoir le focus
    this.canvas.tabIndex = 0;
    this.canvas.focus();
  }

  private setupEventListeners(): void {
    // Écouter les événements sur le document pour capturer toutes les touches
    document.addEventListener("keydown", this.boundKeyDown);
    document.addEventListener("keyup", this.boundKeyUp);

    // Écouter le clic sur le canvas pour lui donner le focus
    this.canvas.addEventListener("click", this.boundCanvasClick);

    // Prévenir le comportement par défaut pour certaines touches
    document.addEventListener("keydown", this.boundPreventDefault);
  }

  private handleCanvasClick(): void {
    this.canvas.focus();
  }

  private handlePreventDefault(event: KeyboardEvent): void {
    // Empêcher le scroll avec les flèches et la barre d'espace
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "F1"].includes(
        event.key
      )
    ) {
      event.preventDefault();
    }
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

  /**
   * Vérifie si la touche debug (F1) vient d'être pressée
   */
  public isDebugToggleJustPressed(): boolean {
    return GAME_CONFIG.CONTROLS.DEBUG_TOGGLE.some((key) =>
      this.isKeyJustPressed(key)
    );
  }

  /**
   * Vérifie si une touche de debug est pressée
   */
  public isDebugTogglePressed(): boolean {
    return GAME_CONFIG.CONTROLS.DEBUG_TOGGLE.some((key) =>
      this.isKeyPressed(key)
    );
  }

  // Nettoyer les event listeners
  public destroy(): void {
    console.log('[INPUT] Cleaning up event listeners');
    document.removeEventListener("keydown", this.boundKeyDown);
    document.removeEventListener("keyup", this.boundKeyUp);
    document.removeEventListener("keydown", this.boundPreventDefault);
    this.canvas.removeEventListener("click", this.boundCanvasClick);
    
    // Nettoyer les sets
    this.keys.clear();
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.previousKeys.clear();
    
    console.log('[INPUT] InputManager destroyed');
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
