import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";

export default class Chair extends FurnitureItem {
  constructor() {
    const config: FurnitureConfig = {
      name: "Chair",
      modelPath: "/models/chair/scene.gltf",
      defaultParams: {
        positionX: 0.6,
        positionY: 0.0,
        positionZ: 0.2,
        rotation: 1.55,
        scale: 1.9,
      },
      guiRanges: {
        scale: [0.001, 3, 0.001],
      },
    };

    super(config);
  }
}
