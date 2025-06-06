import type { GUI } from "dat.gui";
import RoomExperience from "./RoomExperience";
import * as THREE from "three";
import MaterialFactory from "./Utils/MaterialFactory";

export default class Roof {
  experience: RoomExperience;
  scene: THREE.Scene;
  gui: GUI;
  roof!: THREE.Mesh;
  roofMaterial!: THREE.MeshToonMaterial;

  roofParams = {
    color: "#F5F5DC", // Couleur par défaut (beige clair)
  };

  constructor() {
    this.experience = new RoomExperience();
    this.scene = this.experience.scene;
    this.gui = this.experience.gui;

    this.setupRoof();
    this.setupDebugGUI();
  }

  setupRoof() {
    // ✅ MeshToonMaterial sans texture, juste une couleur unie
    this.roofMaterial = new THREE.MeshToonMaterial({
      gradientMap: MaterialFactory.createToonGradient(),
      color: new THREE.Color(this.roofParams.color),
    });

    // Même taille que le floor
    const roofGeometry = new THREE.BoxGeometry(0.1, 8, 6);
    this.roof = new THREE.Mesh(roofGeometry, this.roofMaterial);

    // Positionner le toit à 4 unités de hauteur (hauteur des murs)
    this.roof.position.y = 4;
    this.roof.rotation.x = Math.PI / 2; // Rotation opposée au floor
    this.roof.rotation.y = Math.PI / 2;
    this.roof.receiveShadow = false;
    this.roof.castShadow = true;

    this.scene.add(this.roof);
  }

  setupDebugGUI() {
    // Folder pour les contrôles du toit
    const roofFolder = this.gui.addFolder("Roof");

    // Contrôle de couleur
    roofFolder
      .addColor(this.roofParams, "color")
      .name("Color")
      .onChange((value: string) => {
        if (this.roofMaterial) {
          this.roofMaterial.color.setStyle(value);
          this.roofMaterial.needsUpdate = true; // Forcer la mise à jour
        }
      });

    // Contrôle de hauteur
    roofFolder
      .add(this.roof.position, "y", 3, 6, 0.1)
      .name("Height")
      .onChange(() => {
        // La position se met à jour automatiquement
      });

    // Ouvrir le folder par défaut
    roofFolder.open();
  }
}
