import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import Room from "./Room";
import { GUI } from "dat.gui";

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
  controls!: OrbitControls;
  renderer!: THREE.WebGLRenderer;
  room!: Room;
  gui!: GUI;

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

    this.gui = new GUI();

    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.room = new Room();

    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }
  setupScene(): void {
    this.scene.background = new THREE.Color(0x87ceeb); // Bleu ciel
    this.scene.fog = new THREE.Fog(0x87ceeb, 1, 100); // Brouillard atmosphérique

    const lightFolder = this.gui.addFolder("Lights");
    // Lumière ambiante douce
    const ambientLight = new THREE.AmbientLight(0xffe4b5, 1);
    lightFolder
      .add(ambientLight, "intensity", 0, 1, 0.01)
      .name("Ambient Light Intensity");
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(5, 10, 5);
    sunLight.castShadow = true;
    this.scene.add(sunLight);
    lightFolder
      .add(sunLight, "intensity", 0, 1, 0.01)
      .name("Sun Light Intensity");
    lightFolder
      .add(sunLight.position, "x", -10, 10, 0.1)
      .name("Sun X Position");
    lightFolder.add(sunLight.position, "y", 0, 20, 0.1).name("Sun Y Position");
    lightFolder
      .add(sunLight.position, "z", -10, 10, 0.1)
      .name("Sun Z Position");
  }

  setupCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      this.sizes.width / this.sizes.height, // Aspect ratio
      0.1, // Near
      1000 // Far
    );
    this.camera.position.set(4, 3, 6);
    this.scene.add(this.camera);
  }

  setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));

    // Ombres
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Color management
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
  }

  setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI / 2; // Empêche de passer sous le sol
    this.controls.target.set(0, 1, 0); // Point de focus au centre de la chambre
  }
  resize(): void {
    console.log("resizing");
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.sizes.width, this.sizes.height);
  }

  update(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
