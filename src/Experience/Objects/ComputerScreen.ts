import type { GUI } from "dat.gui";
import RoomExperience from "../RoomExperience";
import * as THREE from "three";
import MaterialFactory from "../Utils/MaterialFactory";
import ModelLoader from "../Utils/ModelLoader";

export default class ComputerScreen {
  experience: RoomExperience;
  scene: THREE.Scene;
  gui: GUI;

  computerScreenParams = {
    positionX: 1.5,
    positionY: -1.3,
    positionZ: -0.9,
    rotation: 2.04, // En radians
    scale: 1, // Taille normale
  };

  constructor() {
    this.experience = new RoomExperience();
    this.scene = this.experience.scene;
    this.gui = this.experience.gui;

    this.setupScreen();
  }

  async setupScreen() {
    try {
      // Charger le modèle de la lampe
      const screenModel = await ModelLoader.load(
        "/models/computerScreen/scene.gltf"
      );

      // Positionner la lampe
      screenModel.position.set(
        this.computerScreenParams.positionX,
        this.computerScreenParams.positionY,
        this.computerScreenParams.positionZ
      ); // x, y, z
      screenModel.scale.setScalar(this.computerScreenParams.scale); // Taille normale
      screenModel.rotation.y = this.computerScreenParams.rotation; // Rotation si nécessaire

      // Activer les ombres sur tous les enfants
      screenModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // ✅ STYLE MIYAZAKI : Convertir en MeshToonMaterial
          if (child.material instanceof THREE.MeshStandardMaterial) {
            const toonMaterial = new THREE.MeshToonMaterial({
              map: child.material.map,
              gradientMap: MaterialFactory.createToonGradient(),
              color: child.material.color,
            });
            child.material = toonMaterial;
          }
        }
      });

      // Ajouter à la scène
      this.scene.add(screenModel);

      // Optionnel : Ajouter aux contrôles GUI
      this.addScreenControls(screenModel);
    } catch (error) {
      console.error("Error loading desk lamp:", error);
    }
  }

  addScreenControls(screenModel: THREE.Group) {
    const screenFolder = this.gui.addFolder("Computer Screen");

    const screenParams = {
      positionX: screenModel.position.x,
      positionY: screenModel.position.y,
      positionZ: screenModel.position.z,
      rotation: screenModel.rotation.y,
      scale: screenModel.scale.x,
      visible: screenModel.visible,
    };

    screenFolder
      .add(screenParams, "positionX", -5, 10, 0.1)
      .onChange((value) => {
        screenModel.position.x = value;
      });

    screenFolder
      .add(screenParams, "positionY", -2, 3, 0.01)
      .onChange((value) => {
        screenModel.position.y = value;
      });

    screenFolder
      .add(screenParams, "positionZ", -5, 5, 0.1)
      .onChange((value) => {
        screenModel.position.z = value;
      });

    screenFolder
      .add(screenParams, "rotation", 0, Math.PI * 2, 0.01)
      .onChange((value) => {
        screenModel.rotation.y = value;
      });

    screenFolder
      .add(screenParams, "scale", 0.5, 1.5, 0.001)
      .onChange((value) => {
        screenModel.scale.setScalar(value);
      });

    screenFolder.add(screenParams, "visible").onChange((value) => {
      screenModel.visible = value;
    });

    screenFolder.open();
  }
}
