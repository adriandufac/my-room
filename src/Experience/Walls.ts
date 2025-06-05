import type { GUI } from "dat.gui";
import RoomExperience from "./RoomExperience";
import * as THREE from "three";
import MaterialFactory from "./Utils/MaterialFactory";

export default class Walls {
  experience: RoomExperience;
  scene: THREE.Scene;
  gui: GUI;

  // Murs
  backWall!: THREE.Mesh | THREE.Group;
  leftWall!: THREE.Mesh;

  // Matériaux
  wallMaterial!: THREE.MeshToonMaterial;

  wallParams = {
    color: "#F5F5DC", // Beige clair par défaut
    height: 4,
    backWallWidth: 8,
    leftWallWidth: 6,
  };

  constructor() {
    this.experience = new RoomExperience();
    this.scene = this.experience.scene;
    this.gui = this.experience.gui;

    this.setupWalls();
    this.setupDebugGUI();
  }

  setupWalls() {
    // ✅ Créer le matériau pour les murs
    this.wallMaterial = new THREE.MeshToonMaterial({
      color: new THREE.Color(this.wallParams.color),
      gradientMap: MaterialFactory.createToonGradient(),
    });

    const leftWallGeometry = new THREE.PlaneGeometry(
      this.wallParams.leftWallWidth,
      this.wallParams.height
    );
    this.leftWall = new THREE.Mesh(leftWallGeometry, this.wallMaterial);
    this.leftWall.position.set(0, this.wallParams.height / 2, -4); // Position Z négative = fond
    this.leftWall.receiveShadow = true;
    this.scene.add(this.leftWall);

    this.createBackWallWithWindow();
  }

  private createBackWallWithWindow(): void {
    const wallThickness = 0.2;
    const windowWidth = 3.0;
    const windowHeight = 2.2;
    const windowY = 2.75;
    const windowX = 0;

    // Position et rotation comme votre backwall original
    const wallX = 3;
    const wallZ = 0;
    const wallRotation = 0;

    // ✅ Partie HAUTE
    const topHeight = this.wallParams.height - (windowY + windowHeight / 2);
    if (topHeight > 0) {
      const topWall = new THREE.Mesh(
        new THREE.BoxGeometry(
          wallThickness,
          topHeight,
          this.wallParams.backWallWidth
        ),
        this.wallMaterial
      );
      topWall.position.set(
        wallX,
        windowY + windowHeight / 2 + topHeight / 2,
        wallZ
      );
      topWall.rotation.y = wallRotation;
      topWall.receiveShadow = true;
      this.scene.add(topWall);
    }

    // ✅ Partie BASSE
    const bottomHeight = windowY - windowHeight / 2;
    if (bottomHeight > 0) {
      const bottomWall = new THREE.Mesh(
        new THREE.BoxGeometry(
          wallThickness,
          bottomHeight,
          this.wallParams.backWallWidth
        ),
        this.wallMaterial
      );
      bottomWall.position.set(wallX, bottomHeight / 2, wallZ);
      bottomWall.rotation.y = wallRotation;
      bottomWall.receiveShadow = true;
      this.scene.add(bottomWall);
    }

    // ✅ Partie GAUCHE
    const leftWidth = this.wallParams.backWallWidth / 2 - windowWidth / 2;
    if (leftWidth > 0) {
      const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, windowHeight, leftWidth),
        this.wallMaterial
      );
      leftWall.position.set(
        wallX,
        windowY,
        wallZ - this.wallParams.backWallWidth / 2 + leftWidth / 2
      );
      leftWall.rotation.y = wallRotation;
      leftWall.receiveShadow = true;
      this.scene.add(leftWall);
    }

    // ✅ Partie DROITE
    const rightWidth = leftWidth;
    if (rightWidth > 0) {
      const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, windowHeight, rightWidth),
        this.wallMaterial
      );
      rightWall.position.set(
        wallX,
        windowY,
        wallZ + this.wallParams.backWallWidth / 2 - rightWidth / 2
      );
      rightWall.rotation.y = wallRotation;
      rightWall.receiveShadow = true;
      this.scene.add(rightWall);
    }

    // Stocker une référence (pour le GUI)
    this.backWall = new THREE.Group();
    this.backWall.position.set(wallX, this.wallParams.height / 2, wallZ);
  }

  setupDebugGUI() {
    // Folder pour les contrôles des murs
    const wallsFolder = this.gui.addFolder("Walls");

    // ✅ Contrôle de couleur
    wallsFolder
      .addColor(this.wallParams, "color")
      .name("Wall Color")
      .onChange((value: string) => {
        if (this.wallMaterial) {
          this.wallMaterial.color.setStyle(value);
          this.wallMaterial.needsUpdate = true;
        }
      });

    // ✅ Contrôle de hauteur
    wallsFolder
      .add(this.wallParams, "height", 2, 5, 0.1)
      .name("Height")
      .onChange((value: number) => {
        this.updateWallDimensions();
      });

    // ✅ Contrôle largeur mur du fond
    wallsFolder
      .add(this.wallParams, "backWallWidth", 4, 10, 0.1)
      .name("Back Wall Width")
      .onChange((value: number) => {
        this.updateWallDimensions();
      });

    // ✅ Contrôle largeur mur de gauche
    wallsFolder
      .add(this.wallParams, "leftWallWidth", 6, 12, 0.1)
      .name("Left Wall Width")
      .onChange((value: number) => {
        this.updateWallDimensions();
      });

    // ✅ Boutons pour différentes ambiances
    const presetColors = {
      "Warm Beige": () => this.setWallColor("#F5F5DC"),
      "Cool Gray": () => this.setWallColor("#E5E5E5"),
      "Soft Pink": () => this.setWallColor("#FFE4E1"),
      "Light Blue": () => this.setWallColor("#E6F3FF"),
    };

    Object.keys(presetColors).forEach((name) => {
      wallsFolder.add(presetColors, name as keyof typeof presetColors);
    });

    // Ouvrir le folder par défaut
    wallsFolder.open();
  }

  // ✅ Mettre à jour les dimensions des murs
  private updateWallDimensions(): void {
    // Supprimer les anciens murs
    this.scene.remove(this.backWall);
    this.scene.remove(this.leftWall);

    // Recréer avec nouvelles dimensions
    this.setupWalls();
  }

  // ✅ Changer la couleur des murs
  private setWallColor(color: string): void {
    this.wallParams.color = color;
    if (this.wallMaterial) {
      this.wallMaterial.color.setStyle(color);
      this.wallMaterial.needsUpdate = true;
    }
  }

  // ✅ Méthodes publiques pour interaction avec d'autres classes
  public getBackWall(): THREE.Mesh | THREE.Group {
    return this.backWall;
  }

  public getLeftWall(): THREE.Mesh {
    return this.leftWall;
  }

  public getWallMaterial(): THREE.MeshToonMaterial {
    return this.wallMaterial;
  }

  // ✅ Cleanup
  public dispose(): void {
    if (this.backWall) {
      this.scene.remove(this.backWall);
    }
    if (this.leftWall) {
      this.scene.remove(this.leftWall);
    }
  }
}
