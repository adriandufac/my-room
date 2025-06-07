// src/game/physics/Vector2D.ts

export class Vector2D {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  // Création d'un nouveau vecteur avec les mêmes coordonnées
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  // Addition de deux vecteurs
  add(vector: Vector2D): Vector2D {
    return new Vector2D(this.x + vector.x, this.y + vector.y);
  }

  // Soustraction de deux vecteurs
  subtract(vector: Vector2D): Vector2D {
    return new Vector2D(this.x - vector.x, this.y - vector.y);
  }

  // Multiplication par un scalaire
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  // Division par un scalaire
  divide(scalar: number): Vector2D {
    if (scalar === 0) {
      throw new Error("Division par zéro");
    }
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  // Calcul de la magnitude (longueur) du vecteur
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Normalisation du vecteur (vecteur unitaire)
  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector2D(0, 0);
    }
    return this.divide(mag);
  }

  // Produit scalaire
  dot(vector: Vector2D): number {
    return this.x * vector.x + this.y * vector.y;
  }

  // Distance entre deux vecteurs
  distanceTo(vector: Vector2D): number {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Modification du vecteur actuel (méthodes mutantes)
  addMutable(vector: Vector2D): Vector2D {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  subtractMutable(vector: Vector2D): Vector2D {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  multiplyMutable(scalar: number): Vector2D {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  // Remise à zéro du vecteur
  zero(): Vector2D {
    this.x = 0;
    this.y = 0;
    return this;
  }

  // Définition de nouvelles valeurs
  set(x: number, y: number): Vector2D {
    this.x = x;
    this.y = y;
    return this;
  }

  // Vérification si le vecteur est nul
  isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }

  // Conversion en chaîne pour le débogage
  toString(): string {
    return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  // Méthodes statiques utiles
  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  static up(): Vector2D {
    return new Vector2D(0, -1);
  }

  static down(): Vector2D {
    return new Vector2D(0, 1);
  }

  static left(): Vector2D {
    return new Vector2D(-1, 0);
  }

  static right(): Vector2D {
    return new Vector2D(1, 0);
  }
}
