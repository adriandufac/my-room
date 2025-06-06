import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";

export default class Painting extends FurnitureItem {
  constructor() {
    const config: FurnitureConfig = {
      name: "Painting",
      modelPath: "/models/painting/scene.gltf",
      defaultParams: {
        positionX: -0.5,
        positionY: 2.38,
        positionZ: -4,
        rotation: 0,
        scale: { x: 0.008, y: 0.008, z: 0.008 },
      },
      guiRanges: {
        scale: [0.001, 0.05, 0.001],
      },
    };

    super(config);
  }
}
