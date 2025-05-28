import * as THREE from "three";
import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";

// Déclaration pour window.experience
declare global {
  interface Window {
    experience: RoomExperience;
  }
}

let instance: RoomExperience | null = null;

export default class RoomExperience {
  canvas!: HTMLCanvasElement;
  sizes!: Sizes;
  time!: Time;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;

  constructor(canvas?: HTMLCanvasElement) {
    // Singleton
    if (instance) {
      return instance;
    }
    instance = this;
    // Le canvas est requis seulement pour la première initialisation
    if (!canvas) {
      throw new Error("Canvas is required for first initialization");
    }
    // Global access
    window.experience = this;
    this.canvas = canvas;

    // Setup
    this.sizes = new Sizes();
    this.time = new Time();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer({ canvas });

    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  resize(): void {
    console.log("resizing");
  }

  update(): void {}
}
