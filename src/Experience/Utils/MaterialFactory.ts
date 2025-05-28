import * as THREE from "three";

export default class MaterialFactory {
  static createGlowMaterial(color = 0x00ff88) {
    return new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
    });
  }

  static createCartoonMaterial(baseColor: THREE.Color, options = {}) {
    return new THREE.MeshToonMaterial({
      color: baseColor,
      gradientMap: this.createToonGradient(),
      ...options,
    });
  }

  static createToonGradient() {
    // Gradient texture pour l'effet cartoon
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context for toon gradient");
    }
    const gradient = ctx.createLinearGradient(0, 0, 4, 0);
    gradient.addColorStop(0, "#000");
    gradient.addColorStop(0.7, "#555");
    gradient.addColorStop(1, "#fff");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 4, 1);

    return new THREE.CanvasTexture(canvas);
  }

  static createCoffeeSteamMaterial() {
    return new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
  }

  // Matériau pour l'effet Miyazaki
  static createMiyazakiMaterial(baseColor: THREE.Color, roughness = 0.7) {
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: roughness,
      metalness: 0.1,
      // Légère subsurface scattering simulée
      transparent: true,
      opacity: 0.95,
    });
  }
}
