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

export default class Room {
  experience: RoomExperience;
  scene: THREE.Scene;
  floor!: Floor;
  roof!: Roof;
  desk!: Desk;
  deskLamp!: DeskLamp;
  gui: GUI;
  screen: ComputerScreen;
  keyboard: ComputerKeyboard;
  vinyleFurniture: VinyleFurniture;
  vinylePlayer: VinylePlayer;
  walls: Walls;
  roomWindow: RoomWindow;
  chair: Chair;
  switch: Switch;

  constructor() {
    this.experience = new RoomExperience();
    this.scene = this.experience.scene;
    this.gui = this.experience.gui;

    this.floor = new Floor();
    this.roof = new Roof();
    this.desk = new Desk();
    this.vinylePlayer = new VinylePlayer();
    this.deskLamp = new DeskLamp();
    this.screen = new ComputerScreen();
    this.keyboard = new ComputerKeyboard();
    this.vinyleFurniture = new VinyleFurniture();
    this.walls = new Walls();
    this.roomWindow = new RoomWindow();
    this.chair = new Chair();
    this.switch = new Switch();
  }
}
