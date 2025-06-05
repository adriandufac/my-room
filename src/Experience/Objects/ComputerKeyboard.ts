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
        scale: { x: 0.4, y: 0.4, z: 0.4 },
      },
      guiRanges: {
        positionX: [-5, 10, 0.1],
        positionY: [-2, 3, 0.01],
        scale: [0.1, 1.5, 0.001],
      },
    };

    super(config);
  }
}
