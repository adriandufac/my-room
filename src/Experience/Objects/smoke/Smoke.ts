import type { GUI } from "dat.gui";
import RoomExperience from "../../RoomExperience";
import * as THREE from "three";
import coffeeSmokeVertexShader from "./shaders/vertex.glsl";
import coffeeSmokeFragmentShader from "./shaders/fragment.glsl";

export default class Smoke {
  experience: RoomExperience;
  scene: THREE.Scene;
  gui: GUI;
  textureLoader: THREE.TextureLoader;
  smokeMaterial: THREE.ShaderMaterial | undefined;
  smoke!: THREE.Mesh;

  // Paramètres de position
  smokeParams = {
    x: 1.55,
    y: 1.68,
    z: 1.22,
  };

  constructor() {
    this.experience = new RoomExperience();
    this.scene = this.experience.scene;
    this.gui = this.experience.gui;
    this.textureLoader = new THREE.TextureLoader();

    this.initSmoke();
    this.setupGUI();
  }

  initSmoke() {
    const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
    smokeGeometry.translate(0, 0.5, 0);
    smokeGeometry.scale(0.15, 0.6, 0.15);

    const perlinTexture = this.textureLoader.load(
      "/textures/perlin/perlin.png"
    );
    perlinTexture.wrapS = THREE.RepeatWrapping;
    perlinTexture.wrapT = THREE.RepeatWrapping;

    console.log("Perlin texture loaded:", perlinTexture);

    this.smokeMaterial = new THREE.ShaderMaterial({
      vertexShader: coffeeSmokeVertexShader,
      fragmentShader: coffeeSmokeFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture),
      },
      /* wireframe: true, */
      side: THREE.DoubleSide,
      depthWrite: false,
      transparent: true,
    });

    this.smoke = new THREE.Mesh(smokeGeometry, this.smokeMaterial);
    this.smoke.position.set(
      this.smokeParams.x,
      this.smokeParams.y,
      this.smokeParams.z
    );
    this.scene.add(this.smoke);
  }

  setupGUI() {
    const smokeFolder = this.gui.addFolder("Smoke");

    // Contrôles de position
    smokeFolder
      .add(this.smokeParams, "x", -5, 5, 0.01)
      .name("Position X")
      .onChange((value: number) => {
        this.smoke.position.x = value;
      });

    smokeFolder
      .add(this.smokeParams, "y", 0, 5, 0.01)
      .name("Position Y")
      .onChange((value: number) => {
        this.smoke.position.y = value;
      });

    smokeFolder
      .add(this.smokeParams, "z", -5, 5, 0.01)
      .name("Position Z")
      .onChange((value: number) => {
        this.smoke.position.z = value;
      });

    smokeFolder.open();
  }

  update(deltaTime: number) {
    this.smokeMaterial!.uniforms.uTime.value += deltaTime;
  }
}
