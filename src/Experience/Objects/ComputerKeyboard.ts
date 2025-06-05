import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";
import * as THREE from "three";

export default class ComputerKeyboard extends FurnitureItem {
  constructor() {
    const config: FurnitureConfig = {
      name: "Computer Keyboard",
      modelPath: "/models/computerKeyboard/scene.gltf",
      defaultParams: {
        positionX: 1.5,
        positionY: 1.5,
        positionZ: 0.8,
        rotation: 4.7,
        scale: 0.4,
      },
      guiRanges: {
        positionX: [-5, 10, 0.1],
        positionY: [-2, 3, 0.01],
        scale: [0.1, 1.5, 0.001],
      },
    };

    super(config);
  }

  // Personnalisations spécifiques au clavier (optionnel)
  protected onModelSetup(model: THREE.Group): void {
    // Logique spécifique au clavier si nécessaire
    console.log("Keyboard loaded and setup complete");
  }

  protected onGUISetup(folder: any): void {
    // Contrôles spécifiques au clavier
    folder
      .add(
        {
          reset: () => this.resetPosition(),
        },
        "reset"
      )
      .name("Reset Position");
  }

  private resetPosition(): void {
    this.setPosition(1.5, 1.5, 0.8);
  }
}
