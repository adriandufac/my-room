import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";

export default class CofeeCup extends FurnitureItem {
  constructor() {
    const config: FurnitureConfig = {
      name: "Coffee Cup",
      modelPath: "/models/coffeeCup/scene.gltf",
      defaultParams: {
        positionX: 1.6,
        positionY: 1.43,
        positionZ: 1.2,
        rotation: 4.05,
        scale: { x: 1.5, y: 1.5, z: 1.5 },
      },
      guiRanges: {
        scale: [0.001, 3, 0.001],
      },
    };

    super(config);
  }
}
