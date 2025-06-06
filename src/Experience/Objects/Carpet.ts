import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";

export default class Carpet extends FurnitureItem {
  constructor() {
    const config: FurnitureConfig = {
      name: "Carpet",
      modelPath: "/models/carpet/scene.gltf",
      defaultParams: {
        positionX: -1.5,
        positionY: 0.01,
        positionZ: -0.3,
        rotation: 0,
        scale: { x: 0.04, y: 0.04, z: 0.04 },
      },
      guiRanges: {
        scale: [0.001, 3, 0.001],
      },
    };

    super(config);
  }
}
