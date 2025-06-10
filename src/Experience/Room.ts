import type { GUI } from "dat.gui";
import RoomExperience from "./RoomExperience";

import * as THREE from "three";

import Floor from "./Floor";
import Desk from "./Objects/Desk";
import DeskLamp from "./Objects/DeskLamp";
import ComputerScreen from "./Objects/ComputerScreen";
import ComputerKeyboard from "./Objects/ComputerKeyboard";
import VinyleFurniture from "./Objects/VinyleFurniture";
import VinylePlayer from "./Objects/VinylePlayer";
import Walls from "./Walls";
import RoomWindow from "./Objects/RoomWindow";
import Chair from "./Objects/Chair";
import Switch from "./Objects/Switch";
import Roof from "./Roof";
import Painting from "./Objects/Painting";
import Smoke from "./Objects/smoke/Smoke";
import CoffeeCup from "./Objects/CoffeeCup";
import Carpet from "./Objects/Carpet";
import Cat from "./Objects/Cat";

export default class Room {
  experience: RoomExperience;
  scene: THREE.Scene;
  floor!: Floor;
  roof!: Roof;
  desk!: Desk;
  deskLamp!: DeskLamp;
  gui?: GUI;
  screen!: ComputerScreen;
  keyboard!: ComputerKeyboard;
  vinyleFurniture!: VinyleFurniture;
  vinylePlayer!: VinylePlayer;
  walls!: Walls;
  roomWindow!: RoomWindow;
  chair!: Chair;
  switch!: Switch;
  painting!: Painting;
  smoke!: Smoke;
  coffeeCup!: CoffeeCup;
  carpet!: Carpet;
  cat!: Cat;

  constructor() {
    this.experience = new RoomExperience();
    this.scene = this.experience.scene;
    this.gui = this.experience.gui;

    this.loadRoomElements();
  }

  private async loadRoomElements(): Promise<void> {
    const elementsToLoad = [
      { name: "Floor", create: () => new Floor() },
      { name: "Walls", create: () => new Walls() },
      { name: "Desk", create: () => new Desk() },
      { name: "VinylePlayer", create: () => new VinylePlayer() },
      { name: "DeskLamp", create: () => new DeskLamp() },
      { name: "ComputerScreen", create: () => new ComputerScreen() },
      { name: "ComputerKeyboard", create: () => new ComputerKeyboard() },
      { name: "VinyleFurniture", create: () => new VinyleFurniture() },
      { name: "RoomWindow", create: () => new RoomWindow() },
      { name: "Chair", create: () => new Chair() },
      { name: "Switch", create: () => new Switch() },
      { name: "Painting", create: () => new Painting() },
      { name: "Carpet", create: () => new Carpet() },
      { name: "Smoke", create: () => new Smoke() },
      { name: "CoffeeCup", create: () => new CoffeeCup() },
      { name: "Cat", create: () => new Cat() },
    ];

    const totalElements = elementsToLoad.length;
    let loadedCount = 0;

    const updateProgress = () => {
      loadedCount++;
      const progress = (loadedCount / totalElements) * 100;

      // Émettre l'événement de progression
      const progressEvent = new CustomEvent("roomLoadingProgress", {
        detail: { progress },
      });
      window.dispatchEvent(progressEvent);

      console.log(
        `[ROOM] Loading progress: ${Math.round(
          progress
        )}% (${loadedCount}/${totalElements})`
      );
    };

    // Charger tous les éléments en parallèle mais tracker la progression
    const loadPromises = elementsToLoad.map(async (elementInfo, index) => {
      console.log(`[ROOM] Starting to load ${elementInfo.name}...`);
      const element = elementInfo.create();

      // Attendre que l'élément soit chargé selon son type
      if (element && "model" in element) {
        // Pour les FurnitureItem, attendre que le modèle soit chargé
        await new Promise((resolve) => {
          const checkModel = () => {
            if (element.model !== undefined) {
              console.log(`[ROOM] ${elementInfo.name} model ready`);
              resolve(undefined);
            } else {
              setTimeout(checkModel, 50);
            }
          };
          checkModel();
        });
      } else {
        // Pour Smoke et autres éléments spéciaux, attendre leur initialisation
        console.log(
          `[ROOM] ${elementInfo.name} is a special element (no 3D model)`
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`[ROOM] ${elementInfo.name} loaded!`);
      updateProgress();
      return element;
    });

    // Attendre que tous les éléments soient chargés
    const roomElements = await Promise.all(loadPromises);

    // Assigner les éléments
    [
      this.floor,
      this.walls,
      this.desk,
      this.vinylePlayer,
      this.deskLamp,
      this.screen,
      this.keyboard,
      this.vinyleFurniture,
      this.roomWindow,
      this.chair,
      this.switch,
      this.painting,
      this.carpet,
      this.smoke,
      this.coffeeCup,
      this.cat,
    ] = roomElements;

    // Petit délai pour s'assurer que tout est rendu
    setTimeout(() => {
      const completeEvent = new CustomEvent("roomLoadingComplete");
      window.dispatchEvent(completeEvent);
      console.log("[ROOM] All elements loaded and rendered!");
    }, 300);
  }
}
