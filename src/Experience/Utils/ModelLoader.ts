import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

export interface ModelWithAnimations {
  model: THREE.Group;
  animations: THREE.AnimationClip[];
  gltf: GLTF;
}

export default class ModelLoader {
  private static loader = new GLTFLoader();

  static async load(path: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          console.log("Model loaded:", path);
          resolve(gltf.scene);
        },
        (progress) => {
          console.log(
            "Loading progress:",
            (progress.loaded / progress.total) * 100 + "%"
          );
        },
        (error) => {
          console.error("Error loading model:", error);
          reject(error);
        }
      );
    });
  }

  static async loadWithAnimations(path: string): Promise<ModelWithAnimations> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          console.log("Model with animations loaded:", path);
          console.log("Animations found:", gltf.animations?.length || 0);

          // Log des noms d'animations
          if (gltf.animations && gltf.animations.length > 0) {
            console.log(
              "Animation names:",
              gltf.animations.map((clip) => clip.name)
            );
          }

          resolve({
            model: gltf.scene,
            animations: gltf.animations || [],
            gltf: gltf,
          });
        },
        (progress) => {
          console.log(
            "Loading progress (with animations):",
            (progress.loaded / progress.total) * 100 + "%"
          );
        },
        (error) => {
          console.error("Error loading model with animations:", error);
          reject(error);
        }
      );
    });
  }
}
