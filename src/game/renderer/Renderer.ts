export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Impossible d'obtenir le contexte 2D du canvas");
    }

    this.ctx = context;
    this.width = canvas.width;
    this.height = canvas.height;

    console.log("🎨 Renderer initialisé");
  }

  /**
   * Efface tout le canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Remplit le canvas avec une couleur de fond
   */
  fillBackground(color: string = "#87CEEB"): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Dessine un rectangle
   */
  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Dessine un rectangle avec bordure
   */
  drawRectWithBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: string,
    borderColor: string = "#000000",
    borderWidth: number = 1
  ): void {
    // Remplissage
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x, y, width, height);

    // Bordure
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = borderWidth;
    this.ctx.strokeRect(x, y, width, height);
  }

  /**
   * Dessine du texte
   */
  drawText(
    text: string,
    x: number,
    y: number,
    color: string = "#000000",
    font: string = "16px Arial",
    align: CanvasTextAlign = "left"
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  /**
   * Dessine un cercle
   */
  drawCircle(x: number, y: number, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Obtient le contexte pour des opérations avancées
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Met à jour les dimensions si le canvas change
   */
  updateSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * Obtient les dimensions actuelles
   */
  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }
}
