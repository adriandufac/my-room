import { GAME_CONFIG } from "../utils/Constants";

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Impossible d'obtenir le contexte 2D du canvas");
    }

    this.ctx = context;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Configuration du canvas pour un rendu optimal
    this.ctx.imageSmoothingEnabled = false;

    // Style par défaut
    this.ctx.textBaseline = "top";
    this.ctx.font = "16px Arial";
  }

  public clear(): void {
    // Effacer tout le canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Optionnel : remplir avec la couleur de fond
    this.ctx.fillStyle = GAME_CONFIG.CANVAS.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(y), width, height);
  }

  public drawRectOutline(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    lineWidth: number = 1
  ): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(Math.round(x), Math.round(y), width, height);
  }

  public drawCircle(x: number, y: number, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(Math.round(x), Math.round(y), radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    color: string = "black",
    font: string = "16px Arial"
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.fillText(text, Math.round(x), Math.round(y));
  }

  public drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    lineWidth: number = 1
  ): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(Math.round(x1), Math.round(y1));
    this.ctx.lineTo(Math.round(x2), Math.round(y2));
    this.ctx.stroke();
  }

  // Méthodes utilitaires pour les transformations
  public save(): void {
    this.ctx.save();
  }

  public restore(): void {
    this.ctx.restore();
  }

  public translate(x: number, y: number): void {
    this.ctx.translate(x, y);
  }

  public scale(x: number, y: number): void {
    this.ctx.scale(x, y);
  }

  public rotate(angle: number): void {
    this.ctx.rotate(angle);
  }

  // Getters pour accéder au contexte si nécessaire
  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  // Méthode pour mettre à jour la taille du canvas
  public updateCanvasSize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Reconfigurer le canvas après le redimensionnement
    this.setupCanvas();
  }

  // Méthodes pour les debug visuals
  public drawDebugGrid(gridSize: number = 32, color: string = "#ddd"): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;

    // Lignes verticales
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // Lignes horizontales
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  public drawDebugPoint(
    x: number,
    y: number,
    color: string = "red",
    size: number = 4
  ): void {
    this.drawCircle(x, y, size, color);
  }

  public drawDebugVector(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string = "blue"
  ): void {
    this.drawLine(startX, startY, endX, endY, color, 2);

    // Dessiner une flèche à la fin
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowLength = 8;
    const arrowAngle = Math.PI / 6;

    this.drawLine(
      endX,
      endY,
      endX - arrowLength * Math.cos(angle - arrowAngle),
      endY - arrowLength * Math.sin(angle - arrowAngle),
      color,
      2
    );

    this.drawLine(
      endX,
      endY,
      endX - arrowLength * Math.cos(angle + arrowAngle),
      endY - arrowLength * Math.sin(angle + arrowAngle),
      color,
      2
    );
  }
}
