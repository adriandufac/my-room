import type { GUI } from "dat.gui";
import RoomExperience from "./RoomExperience";
import * as THREE from "three";
import MaterialFactory from "./Utils/MaterialFactory";

export default class Floor {
  experience: RoomExperience;
  scene: THREE.Scene;
  gui: GUI;
  floor!: THREE.Mesh;
  floorMaterial!: THREE.MeshToonMaterial;

  floorParams = {
    color: "#FFE4B5", // Couleur par défaut (beige chaud)
    textureRepeatX: 4,
    textureRepeatY: 6,
  };

  constructor() {
    this.experience = new RoomExperience();
    this.scene = this.experience.scene;
    this.gui = this.experience.gui;

    this.setupFloor();
    this.setupDebugGUI();
  }

  setupFloor() {
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

  setupDebugGUI() {
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
}
