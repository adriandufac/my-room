import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";

export default class Desk extends FurnitureItem {
  constructor() {
    const config: FurnitureConfig = {
      name: "Desk",
      modelPath: "/models/desk/scene.gltf",
      defaultParams: {
        positionX: 2.1,
        positionY: 0.71,
        positionZ: 2,
        rotation: 1.57,
        scale: { x: 0.02, y: 0.02, z: 0.02 },
      },
      guiRanges: {
        scale: [0.001, 0.5, 0.001],
      },
    };

    super(config);
  }
}
