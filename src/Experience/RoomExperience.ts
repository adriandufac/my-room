import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import Room from "./Room";
import SunCycle from "./SunCycle"; // Import de la nouvelle classe
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

  // Ajout du cycle du soleil
  sunLight!: THREE.DirectionalLight;
  ambientLight!: THREE.AmbientLight;
  sunCycle!: SunCycle;

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
    this.setupSunCycle(); // Nouveau : configuration du cycle du soleil
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
    // Le background sera géré par SunCycle
    this.scene.fog = new THREE.Fog(0x87ceeb, 1, 100); // Brouillard atmosphérique

    // Lumière ambiante douce (sera gérée par SunCycle)
    this.ambientLight = new THREE.AmbientLight(0xffe4b5, 0.3);
    this.scene.add(this.ambientLight);

    // Configuration du soleil (sera géré par SunCycle)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.sunLight.position.set(-3, 5, -8); // Position initiale (lever - derrière, légèrement à gauche)
    this.sunLight.castShadow = true;

    // Configuration des ombres avec une couverture plus large
    this.sunLight.shadow.mapSize.width = 4096;
    this.sunLight.shadow.mapSize.height = 4096;
    this.sunLight.shadow.bias = 0.003; // Valeur négative
    this.sunLight.shadow.normalBias = 0.2; // Bias basé sur les normales
    // Les paramètres de la caméra seront configurés par SunCycle

    this.scene.add(this.sunLight);
  }

  setupSunCycle(): void {
    // Initialiser le cycle du soleil après avoir créé la sunLight et ambientLight
    this.sunCycle = new SunCycle(
      this.sunLight,
      this.ambientLight,
      this.scene,
      this.gui
    );
  }

  setupCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      this.sizes.width / this.sizes.height, // Aspect ratio
      0.1, // Near
      1000 // Far
    );
    this.camera.position.set(-3, 2.3, 1.1);
    this.scene.add(this.camera);
  }

  setupCameraGUI(): void {
    const cameraFolder = this.gui.addFolder("Camera");

    // Camera position controls
    const positionFolder = cameraFolder.addFolder("Position");

    positionFolder
      .add(this.camera.position, "x", -20, 20, 0.1)
      .name("Position X")
      .onChange(() => {
        this.camera.updateProjectionMatrix();
      });

    positionFolder
      .add(this.camera.position, "y", -10, 15, 0.1)
      .name("Position Y")
      .onChange(() => {
        this.camera.updateProjectionMatrix();
      });

    positionFolder
      .add(this.camera.position, "z", -20, 20, 0.1)
      .name("Position Z")
      .onChange(() => {
        this.camera.updateProjectionMatrix();
      });

    // Camera settings
    const settingsFolder = cameraFolder.addFolder("Settings");

    settingsFolder
      .add(this.camera, "fov", 30, 120, 1)
      .name("Field of View")
      .onChange(() => {
        this.camera.updateProjectionMatrix();
      });

    // Controls toggle
    settingsFolder.add(this.controls, "enabled").name("Enable Controls");

    // Quick actions
    const actionsFolder = cameraFolder.addFolder("Quick Actions");

    actionsFolder.add(
      {
        "Reset Position": () => {
          this.camera.position.set(4, 3, 6);
          this.camera.fov = 75;
          this.camera.updateProjectionMatrix();
          cameraFolder.updateDisplay();
        },
      },
      "Reset Position"
    );

    actionsFolder.add(
      {
        "Print Position": () => {
          console.log(
            `Camera position: (${this.camera.position.x.toFixed(
              2
            )}, ${this.camera.position.y.toFixed(
              2
            )}, ${this.camera.position.z.toFixed(2)})`
          );
          console.log(`Camera FOV: ${this.camera.fov}`);
        },
      },
      "Print Position"
    );

    cameraFolder.open();
    positionFolder.open();
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
    this.controls.enabled = false; // Activer les contrôles
    
    // Setup camera GUI controls after controls are initialized
    this.setupCameraGUI();
  }

  resize(): void {
    console.log("resizing");
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.sizes.width, this.sizes.height);
  }

  update(): void {
    // Mettre à jour le cycle du soleil avec deltaTime
    if (this.sunCycle && this.time.delta) {
      this.sunCycle.update(this.time.delta / 1000); // Convertir ms en secondes
    }
    if (this.room.smoke && this.time.delta) {
      this.room.smoke.update(this.time.delta / 1000); // Mettre à jour la fumée
    }
    if (this.room.cat && this.time.delta) {
      this.room.cat.update(this.time.delta / 1000); // Mettre à jour le chat
      this.room.cat.updateFromSunCycle(
        this.sunCycle.currentPhase,
        this.sunCycle.cycleProgress
      ); // Mettre à jour le chat avec les paramètres du cycle du soleil
    }
    if (this.room.screen && this.time.delta) {
      this.room.screen.update(this.time.delta / 1000); // Mettre à jour l'écran
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // Méthode pour nettoyer les ressources
  dispose(): void {
    if (this.sunCycle) {
      this.sunCycle.dispose();
    }
  }
}
