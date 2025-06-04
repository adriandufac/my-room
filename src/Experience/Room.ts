import type { GUI } from "dat.gui";
import RoomExperience from "./RoomExperience";
import MaterialFactory from "./Utils/MaterialFactory";
import * as THREE from "three";

export default class Room {
  experience: RoomExperience;
  scene: THREE.Scene;
  floor!: THREE.Mesh;
  floorMaterial!: THREE.MeshToonMaterial;
  gui: GUI;

  floorParams = {
    color: "#FFE4B5", // Couleur par défaut (beige chaud)
    textureRepeatX: 4,
    textureRepeatY: 6,
  };

  constructor() {
    this.experience = new RoomExperience();
    this.scene = this.experience.scene;
    this.gui = this.experience.gui;

    this.setupRoom();
    this.setupDebugGUI();
  }

  setupDebugGUI(): void {
    // Créer l'interface dat.GUI

    // Folder pour les contrôles du sol
    const floorFolder = this.gui.addFolder("Floor");

    // Contrôle de couleur
    floorFolder
      .addColor(this.floorParams, "color")
      .name("Tint Color")
      .onChange((value: string) => {
        if (this.floorMaterial) {
          this.floorMaterial.color.setStyle(value);
          this.floorMaterial.needsUpdate = true; // Forcer la mise à jour
        }
      });

    // Contrôles de répétition de texture
    floorFolder
      .add(this.floorParams, "textureRepeatX", 1, 10, 1)
      .name("Repeat X")
      .onChange((value: number) => {
        if (this.floorMaterial && this.floorMaterial.map) {
          this.floorMaterial.map.repeat.x = value;
          this.floorMaterial.map.needsUpdate = true;
        }
      });

    floorFolder
      .add(this.floorParams, "textureRepeatY", 1, 10, 1)
      .name("Repeat Y")
      .onChange((value: number) => {
        if (this.floorMaterial && this.floorMaterial.map) {
          this.floorMaterial.map.repeat.y = value;
          this.floorMaterial.map.needsUpdate = true;
        }
      });

    // Ouvrir le folder par défaut
    floorFolder.open();
  }

  async setupRoom() {
    // Créer les murs, sol, plafond
    this.createFloor();
    //this.createWalls();

    // Charger et placer tous les meubles
    //await this.furniture.loadAll();

    console.log("Chambre entièrement chargée !");
  }
  createFloor() {
    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load(
      "/textures/floor/wood_cabinet_worn_long_diff_4k.jpg"
    );

    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(
      this.floorParams.textureRepeatX,
      this.floorParams.textureRepeatY
    );

    // ✅ MeshToonMaterial avec juste la map
    this.floorMaterial = new THREE.MeshToonMaterial({
      map: woodTexture,
      gradientMap: MaterialFactory.createToonGradient(),
      color: new THREE.Color(this.floorParams.color), // Teinte chaude optionnelle
    });

    const floorGeometry = new THREE.PlaneGeometry(6, 8);
    this.floor = new THREE.Mesh(floorGeometry, this.floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;

    this.scene.add(this.floor);
  }

  /*   createWalls() {
    const { width, length, height } = FURNITURE_LAYOUT.room.size;

    // Mur nord (avec fenêtre)
    const wallNorth = this.createWall(width, height);
    wallNorth.position.set(0, height / 2, -length / 2);

    // Découper la fenêtre
    if (FURNITURE_LAYOUT.room.walls.north.hasWindow) {
      this.createWindow(wallNorth);
    }

    this.scene.add(wallNorth);
  }

  createWall(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = MaterialFactory.createMiyazakiMaterial(0xf5f5dc); // Beige
    return new THREE.Mesh(geometry, material);
  }

  createWindow(wall) {
    const windowConfig = FURNITURE_LAYOUT.room.walls.north;
    const windowGeometry = new THREE.PlaneGeometry(
      windowConfig.windowSize.width,
      windowConfig.windowSize.height
    );

    // Matériau transparent pour simuler la vitre
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
      roughness: 0,
      metalness: 0,
      transmission: 0.9,
    });

    const windowPane = new THREE.Mesh(windowGeometry, glassMaterial);
    windowPane.position.set(0, 0, 0.01); // Légèrement devant le mur
    wall.add(windowPane);
  } */
}
