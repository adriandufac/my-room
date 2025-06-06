import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";

export default class CofeeCup extends FurnitureItem {
  constructor() {
    const config: FurnitureConfig = {
      name: "Coffee Cup",
      modelPath: "/models/coffeeCup/scene.gltf",
      defaultParams: {
        positionX: 1.6,
        positionY: 1.43,
        positionZ: 1.3,
        rotation: 4.05,
        scale: { x: 0.26, y: 0.26, z: 0.26 },
      },
      guiRanges: {
        scale: [0.001, 3, 0.001],
      },
    };

    super(config);
  }
}
