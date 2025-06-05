import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";

export default class VinyleFurniture extends FurnitureItem {
  constructor() {
    const config: FurnitureConfig = {
      name: "Vinyle Furniture",
      modelPath: "/models/vinyleFurniture/scene.gltf",
      defaultParams: {
        positionX: -0.9,
        positionY: 0.01,
        positionZ: -3.6,
        rotation: 0,
        scale: 1.9,
      },
      guiRanges: {
        scale: [0.001, 3, 0.001],
      },
    };

    super(config);
  }
}
