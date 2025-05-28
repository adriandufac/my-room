import RoomExperience from "./RoomExperience";
import FURNITURE_LAYOUT from "./furniture-layout.json";
import * as THREE from "three";

export default class Room {
  experience: RoomExperience;
  scene: THREE.Scene;
  constructor() {
    this.experience = new RoomExperience();
    this.scene = this.experience.scene;

    this.setupRoom();
  }

  async setupRoom() {
    // Créer les murs, sol, plafond
    this.createFloor();
    this.createWalls();

    // Charger et placer tous les meubles
    //await this.furniture.loadAll();

    console.log("Chambre entièrement chargée !");
  }
  createFloor() {}
  createWalls() {
    const { width, length, height } = FURNITURE_LAYOUT.room.size;

    // Mur nord (avec fenêtre)
    const wallNorth = this.createWall(width, height);
    wallNorth.position.set(0, height / 2, -length / 2);

    // Découper la fenêtre
    if (FURNITURE_LAYOUT.room.walls.north.hasWindow) {
      this.createWindow(wallNorth);
    }

    this.scene.add(wallNorth);
  }

  createWall(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = MaterialFactory.createMiyazakiMaterial(0xf5f5dc); // Beige
    return new THREE.Mesh(geometry, material);
  }

  createWindow(wall) {
    const windowConfig = FURNITURE_LAYOUT.room.walls.north;
    const windowGeometry = new THREE.PlaneGeometry(
      windowConfig.windowSize.width,
      windowConfig.windowSize.height
    );

    // Matériau transparent pour simuler la vitre
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
      roughness: 0,
      metalness: 0,
      transmission: 0.9,
    });

    const windowPane = new THREE.Mesh(windowGeometry, glassMaterial);
    windowPane.position.set(0, 0, 0.01); // Légèrement devant le mur
    wall.add(windowPane);
  }
}

export { Furniture, FURNITURE_LAYOUT };
