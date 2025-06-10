import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";
import * as THREE from "three";

export default class DeskLamp extends FurnitureItem {
  private light?: THREE.SpotLight;
  private lightHelper?: THREE.SpotLightHelper;
  private isLightOn: boolean = false;

  constructor() {
    const config: FurnitureConfig = {
      name: "Desk Lamp",
      modelPath: "/models/deskLamp/scene.gltf",
      defaultParams: {
        positionX: 2.5,
        positionY: 2.05,
        positionZ: 1.8,
        rotation: 5.5,
        scale: { x: 1.2, y: 1.2, z: 1.2 },
      },
      clickable: true,
      hoverable: true,
      clickType: "desk-lamp",
    };

    super(config);
  }

  protected onModelSetup(model: THREE.Group): void {
    // Ajouter une vraie lumière à la lampe
    this.light = new THREE.SpotLight(0xffffff, 0, 10, Math.PI / 6);
    this.light.position.set(-0.4, 0.2, 0);
    this.light.castShadow = true;

    model.add(this.light);

    this.lightHelper = new THREE.SpotLightHelper(this.light);
    this.lightHelper.visible = false;
    model.add(this.lightHelper);
  }

  protected onClick(): void {
    console.log("Lamp clicked!");
    this.toggleLight();
  }

  public toggleLight(): void {
    this.isLightOn = !this.isLightOn;

    if (this.light) {
      this.light.intensity = this.isLightOn ? 10 : 0;
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
        targetX: this.light.target.position.x,
        targetY: this.light.target.position.y,
        targetZ: this.light.target.position.z,
      };

      folder
        .add(lightParams, "intensity", 0, 10, 0.1)
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

      const directionFolder = folder.addFolder("Light Direction");

      directionFolder
        .add(lightParams, "targetX", -5, 5, 0.1)
        .name("Target X")
        .onChange((value: number) => {
          if (this.light) {
            this.light.target.position.x = value;
            if (this.lightHelper) this.lightHelper.update();
          }
        });

      directionFolder
        .add(lightParams, "targetY", -5, 5, 0.1)
        .name("Target Y")
        .onChange((value: number) => {
          if (this.light) {
            this.light.target.position.y = value;
            if (this.lightHelper) this.lightHelper.update();
          }
        });

      directionFolder
        .add(lightParams, "targetZ", -5, 5, 0.1)
        .name("Target Z")
        .onChange((value: number) => {
          if (this.light) {
            this.light.target.position.z = value;
            if (this.lightHelper) this.lightHelper.update();
          }
        });

      directionFolder.open();
    }
  }

  public dispose(): void {
    if (this.lightHelper) {
      this.scene.remove(this.lightHelper);
    }
    super.dispose();
  }
}
