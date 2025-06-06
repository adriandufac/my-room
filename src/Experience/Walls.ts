import type { GUI } from "dat.gui";
import RoomExperience from "./RoomExperience";
import * as THREE from "three";
import MaterialFactory from "./Utils/MaterialFactory";
// Note: Vous devez installer three-csg-ts avec: npm install three-csg-ts
import { CSG } from "three-csg-ts";

export default class Walls {
  experience: RoomExperience;
  scene: THREE.Scene;
  gui: GUI;

  // Structure unifiée (3 murs + toit avec fenêtre)
  roomStructure!: THREE.Mesh;
  wallMaterial!: THREE.MeshToonMaterial;

  wallParams = {
    color: "#F5F5DC", // Beige clair par défaut
    height: 4,
    roomWidth: 6, // Largeur de votre Floor (axe X : -3 à +3)
    roomDepth: 8, // Profondeur de votre Floor (axe Z : -4 à +4)
    wallThickness: 0.2,

    // Fenêtre dans le mur arrière
    windowWidth: 5,
    windowHeight: 2.2,
    windowY: 2.75,
    hasWindow: true,

    // Toit
    hasRoof: true,
    roofThickness: 0.1,
  };

  constructor() {
    this.experience = new RoomExperience();
    this.scene = this.experience.scene;
    this.gui = this.experience.gui;

    this.setupRoomStructure();
    this.setupDebugGUI();
  }

  setupRoomStructure() {
    // Créer le matériau
    this.wallMaterial = new THREE.MeshToonMaterial({
      color: new THREE.Color(this.wallParams.color),
      gradientMap: MaterialFactory.createToonGradient(),
    });

    // Créer la géométrie avec CSG
    const geometry = this.createCSGRoomGeometry();

    this.roomStructure = new THREE.Mesh(geometry, this.wallMaterial);
    this.roomStructure.receiveShadow = true;
    this.roomStructure.castShadow = true;

    this.scene.add(this.roomStructure);
  }

  private createCSGRoomGeometry(): THREE.BufferGeometry {
    const {
      roomWidth,
      roomDepth,
      height,
      wallThickness,
      windowWidth,
      windowHeight,
      windowY,
      hasWindow,
      hasRoof,
      roofThickness,
    } = this.wallParams;

    // ==========================================
    // 1. Créer la GROSSE boîte (murs + intérieur)
    // ==========================================

    const outerWidth = roomWidth + wallThickness; // Pas de mur devant, donc juste +1 épaisseur
    const outerDepth = roomDepth + wallThickness * 2; // Murs gauche et droit
    const totalHeight = height + (hasRoof ? roofThickness : 0);

    const outerGeometry = new THREE.BoxGeometry(
      outerWidth,
      totalHeight,
      outerDepth
    );
    const outerMesh = new THREE.Mesh(outerGeometry);
    // Décaler vers l'arrière pour coller à votre layout (pas de mur devant)
    outerMesh.position.set(wallThickness / 2, totalHeight / 2, 0);
    outerMesh.updateMatrixWorld();
    outerGeometry.applyMatrix4(outerMesh.matrixWorld);

    // ==========================================
    // 2. Créer la PETITE boîte (intérieur vide)
    // ==========================================

    const innerGeometry = new THREE.BoxGeometry(
      roomWidth,
      height + 0.1,
      roomDepth
    );
    const innerMesh = new THREE.Mesh(innerGeometry);
    innerMesh.position.set(0, height / 2, 0); // Centré sur votre floor
    innerMesh.updateMatrixWorld();
    innerGeometry.applyMatrix4(innerMesh.matrixWorld);

    // ==========================================
    // 3. CSG : Grosse boîte - Petite boîte = Murs creux !
    // ==========================================

    const outerCSG = CSG.fromMesh(new THREE.Mesh(outerGeometry));
    const innerCSG = CSG.fromMesh(new THREE.Mesh(innerGeometry));
    let roomCSG = outerCSG.subtract(innerCSG);

    // ==========================================
    // 4. Découper la fenêtre si nécessaire
    // ==========================================

    if (hasWindow) {
      const windowGeometry = new THREE.BoxGeometry(
        wallThickness + 0.1, // Un peu plus épais pour percer complètement
        windowHeight,
        windowWidth
      );
      const windowMesh = new THREE.Mesh(windowGeometry);
      windowMesh.position.set(
        roomWidth / 2 + wallThickness / 2, // Position du mur arrière
        windowY,
        0 // Centré
      );
      windowMesh.updateMatrixWorld();
      windowGeometry.applyMatrix4(windowMesh.matrixWorld);

      const windowCSG = CSG.fromMesh(new THREE.Mesh(windowGeometry));
      roomCSG = roomCSG.subtract(windowCSG);
    }

    // ==========================================
    // 5. Convertir en géométrie Three.js
    // ==========================================

    const finalMesh = CSG.toMesh(roomCSG, new THREE.Matrix4());
    const geometry = finalMesh.geometry;

    // Calculer les normales et UV
    geometry.computeVertexNormals();

    // UV simples
    const positionAttribute = geometry.getAttribute("position");
    const uvs = [];
    const positions = positionAttribute.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      const u = (x + outerWidth / 2) / outerWidth;
      const v = y / totalHeight;

      uvs.push(u, v);
    }

    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();

    return geometry;
  }

  setupDebugGUI() {
    const wallsFolder = this.gui.addFolder("Room Structure");

    // Contrôle de couleur
    wallsFolder
      .addColor(this.wallParams, "color")
      .name("Wall Color")
      .onChange((value: string) => {
        if (this.wallMaterial) {
          this.wallMaterial.color.setStyle(value);
          this.wallMaterial.needsUpdate = true;
        }
      });

    // Dimensions de la pièce
    wallsFolder
      .add(this.wallParams, "height", 2, 6, 0.1)
      .name("Height")
      .onChange(() => this.updateRoomStructure());

    wallsFolder
      .add(this.wallParams, "roomWidth", 4, 10, 0.1)
      .name("Room Width")
      .onChange(() => this.updateRoomStructure());

    wallsFolder
      .add(this.wallParams, "roomDepth", 6, 12, 0.1)
      .name("Room Depth")
      .onChange(() => this.updateRoomStructure());

    wallsFolder
      .add(this.wallParams, "wallThickness", 0.1, 0.5, 0.01)
      .name("Wall Thickness")
      .onChange(() => this.updateRoomStructure());

    // Toit
    const roofFolder = wallsFolder.addFolder("Roof");
    roofFolder
      .add(this.wallParams, "hasRoof")
      .name("Has Roof")
      .onChange(() => this.updateRoomStructure());

    roofFolder
      .add(this.wallParams, "roofThickness", 0.05, 0.3, 0.01)
      .name("Roof Thickness")
      .onChange(() => this.updateRoomStructure());

    // Fenêtre
    const windowFolder = wallsFolder.addFolder("Window");
    windowFolder
      .add(this.wallParams, "hasWindow")
      .name("Has Window")
      .onChange(() => this.updateRoomStructure());

    windowFolder
      .add(this.wallParams, "windowWidth", 2, 8, 0.1)
      .name("Window Width")
      .onChange(() => this.updateRoomStructure());

    windowFolder
      .add(this.wallParams, "windowHeight", 1, 3, 0.1)
      .name("Window Height")
      .onChange(() => this.updateRoomStructure());

    windowFolder
      .add(this.wallParams, "windowY", 1, 4, 0.1)
      .name("Window Y Position")
      .onChange(() => this.updateRoomStructure());

    // Presets de couleurs
    const presetColors = {
      "Warm Beige": () => this.setWallColor("#F5F5DC"),
      "Cool Gray": () => this.setWallColor("#E5E5E5"),
      "Soft Pink": () => this.setWallColor("#FFE4E1"),
      "Light Blue": () => this.setWallColor("#E6F3FF"),
    };

    Object.keys(presetColors).forEach((name) => {
      wallsFolder.add(presetColors, name as keyof typeof presetColors);
    });

    wallsFolder.open();
  }

  private updateRoomStructure(): void {
    this.scene.remove(this.roomStructure);
    this.setupRoomStructure();
  }

  private setWallColor(color: string): void {
    this.wallParams.color = color;
    if (this.wallMaterial) {
      this.wallMaterial.color.setStyle(color);
      this.wallMaterial.needsUpdate = true;
    }
  }

  public dispose(): void {
    if (this.roomStructure) {
      this.scene.remove(this.roomStructure);
    }
  }
}
