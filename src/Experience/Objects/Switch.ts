import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";
import * as THREE from "three";

export default class Switch extends FurnitureItem {
  private light?: THREE.SpotLight;
  private lightHelper?: THREE.SpotLightHelper;
  private isLightOn: boolean = false;

  constructor() {
    const config: FurnitureConfig = {
      name: "Switch",
      modelPath: "/models/switch/scene.gltf",
      defaultParams: {
        positionX: 2.9,
        positionY: 3,
        positionZ: 3.2,
        rotation: 3.22,
        scale: { x: 3, y: 3, z: 3 },
      },
      guiRanges: {
        scale: [0.001, 3, 0.001],
      },
      clickable: true,
      hoverable: true,
      clickType: "switch",
    };

    super(config);
  }

  protected onModelSetup(model: THREE.Group): void {
    // Ajouter une vraie lumière au switch
    this.light = new THREE.SpotLight(0xf0f0ea, 0, 20, Math.PI / 2.5);
    this.light.position.set(0.9, 0.3, 1);
    this.light.castShadow = true;

    model.add(this.light);

    this.lightHelper = new THREE.SpotLightHelper(this.light, 0.2);
    this.lightHelper.visible = false; // Par défaut, l'aide n'est pas visible
    model.add(this.lightHelper); // ✅ EXACTEMENT comme DeskLamp
  }

  protected onClick(): void {
    console.log("Switch clicked!");
    this.toggleLight();
  }

  public toggleLight(): void {
    this.isLightOn = !this.isLightOn;

    if (this.light) {
      this.light.intensity = this.isLightOn ? 20 : 0;
      if (this.lightHelper) this.lightHelper.update();
    }
  }

  public getLightState(): boolean {
    return this.isLightOn;
  }

  protected onGUISetup(folder: any): void {
    if (this.light) {
      const lightParams = {
        intensity: this.light.intensity,
        color: this.light.color.getHex(),
        on: true,
        lightPosX: this.light.position.x,
        lightPosY: this.light.position.y,
        lightPosZ: this.light.position.z,
        showHelper: true,
      };

      folder
        .add(lightParams, "intensity", 0, 20, 0.1)
        .onChange((value: number) => {
          if (this.light) {
            this.light.intensity = value;
            if (this.lightHelper) this.lightHelper.update();
          }
        });
      folder
        .add(lightParams, "lightPosX", -2, 2, 0.1)
        .name("Light X")
        .onChange((value: number) => {
          if (this.light) {
            this.light.position.x = value;
            if (this.lightHelper) this.lightHelper.update();
          }
        });

      folder
        .add(lightParams, "lightPosY", -1, 3, 0.1)
        .name("Light Y")
        .onChange((value: number) => {
          if (this.light) {
            this.light.position.y = value;
            if (this.lightHelper) this.lightHelper.update();
          }
        });

      folder
        .add(lightParams, "lightPosZ", -2, 2, 0.1)
        .name("Light Z")
        .onChange((value: number) => {
          if (this.light) {
            this.light.position.z = value;
            if (this.lightHelper) this.lightHelper.update();
          }
        });

      folder
        .add(lightParams, "showHelper")
        .name("Show Helper")
        .onChange((value: boolean) => {
          if (this.lightHelper) {
            this.lightHelper.visible = value;
          }
        });

      folder.addColor(lightParams, "color").onChange((value: number) => {
        if (this.light) {
          this.light.color.setHex(value);
          if (this.lightHelper) this.lightHelper.update();
        }
      });

      folder.add(lightParams, "on").onChange((value: boolean) => {
        if (this.light) {
          this.light.intensity = value ? lightParams.intensity : 0;
          if (this.lightHelper) this.lightHelper.update();
        }
      });
    }
  }

  public dispose(): void {
    if (this.lightHelper) {
      this.scene.remove(this.lightHelper);
    }
    super.dispose();
  }
}
