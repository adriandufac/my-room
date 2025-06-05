import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";
import * as THREE from "three";

export default class RoomWindow extends FurnitureItem {
  constructor() {
    const config: FurnitureConfig = {
      name: "Window",
      modelPath: "/models/window/scene.gltf",
      defaultParams: {
        positionX: 3.05,
        positionY: 2.75,
        positionZ: 0,
        rotation: 1.57,
        scale: 0.9,
      },
      guiRanges: {
        scale: [0.001, 3, 0.001],
      },
    };

    super(config);
  }

  protected onModelSetup(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // ✅ Cibler spécifiquement la vitre
        if (child.name.includes("glass")) {
          console.log(`🎯 Applying glass material to: ${child.name}`);

          const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15, // Très transparent comme une vraie vitre
            transmission: 0.95, // Transmission élevée
            roughness: 0.02, // Très lisse
            metalness: 0.0,
            ior: 1.5, // Indice de réfraction du verre
            thickness: 0.01,
          });

          child.material = glassMaterial;
        }
      }
    });
  }
}
