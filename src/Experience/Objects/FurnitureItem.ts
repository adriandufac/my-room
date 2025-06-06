// Objects/Base/FurnitureItem.ts - Classe de base
import type { GUI } from "dat.gui";

import * as THREE from "three";
import RoomExperience from "../RoomExperience";
import ModelLoader from "../Utils/ModelLoader";
import MaterialFactory from "../Utils/MaterialFactory";

export interface FurnitureParams {
  positionX: number;
  positionY: number;
  positionZ: number;
  rotation: number;
  scale: { x: number; y: number; z: number };
}

export interface FurnitureConfig {
  name: string;
  modelPath: string;
  defaultParams: FurnitureParams;
  clickable?: boolean;
  hoverable?: boolean;
  clickType?: string;
  guiRanges?: {
    positionX?: [number, number, number]; // [min, max, step]
    positionY?: [number, number, number];
    positionZ?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  };
}

export default abstract class FurnitureItem {
  protected experience: RoomExperience;
  protected scene: THREE.Scene;
  protected gui: GUI;
  protected model?: THREE.Group;
  protected params: FurnitureParams;
  protected config: FurnitureConfig;

  // Raycaster pour la détection de clics
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private clickHandler?: (event: MouseEvent) => void;

  // Gestion des événements de survol
  private mouseMoveHandler?: (event: MouseEvent) => void;
  private isHovered: boolean = false;
  private originalMaterials: Map<
    THREE.Mesh,
    THREE.Material | THREE.Material[]
  > = new Map();

  constructor(config: FurnitureConfig) {
    this.experience = new RoomExperience();
    this.scene = this.experience.scene;
    this.gui = this.experience.gui;
    this.config = config;
    this.params = { ...config.defaultParams };

    this.init();
  }

  private async init() {
    await this.loadModel();
    this.setupModel();
    this.addToScene();

    if (this.config.clickable && this.model) {
      this.setupClickable(this.model);
    }

    if (this.config.hoverable && this.model) {
      this.setupHoverable(this.model);
    }

    this.setupGUI();
  }

  private async loadModel() {
    try {
      this.model = await ModelLoader.load(this.config.modelPath);
    } catch (error) {
      console.error(`Error loading ${this.config.name}:`, error);
      throw error;
    }
  }

  private setupModel() {
    if (!this.model) return;

    // Position, rotation, scale
    this.model.position.set(
      this.params.positionX,
      this.params.positionY,
      this.params.positionZ
    );
    this.model.rotation.y = this.params.rotation;
    this.model.scale.set(
      this.params.scale.x,
      this.params.scale.y,
      this.params.scale.z
    );

    // Ombres et matériaux
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Style Miyazaki
        if (child.material instanceof THREE.MeshStandardMaterial) {
          const toonMaterial = new THREE.MeshToonMaterial({
            map: child.material.map,
            gradientMap: MaterialFactory.createToonGradient(),
            color: child.material.color,
          });
          child.material = toonMaterial;
        }
      }
    });
    this.onModelSetup(this.model);
    // Hook pour personnalisation
  }

  private setupHoverable(model: THREE.Group): void {
    // Sauvegarder les matériaux originaux
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.originalMaterials.set(child, child.material);
      }
    });

    // Créer le handler de mousemove
    this.mouseMoveHandler = this.onCanvasMouseMove.bind(this);
    this.experience.canvas.addEventListener("mousemove", this.mouseMoveHandler);

    // Changer le curseur
    this.experience.canvas.style.cursor = "default";
  }

  private onCanvasMouseMove(event: MouseEvent): void {
    // Calculer la position de la souris
    const rect = this.experience.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycasting
    this.raycaster.setFromCamera(this.mouse, this.experience.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    // Vérifier si on survole cet objet
    let isHoveringThis = false;
    for (const intersect of intersects) {
      if (intersect.object.userData.furnitureInstance === this) {
        isHoveringThis = true;
        break;
      }
    }

    // Gérer les changements d'état de hover
    if (isHoveringThis && !this.isHovered) {
      this.onHoverEnter();
    } else if (!isHoveringThis && this.isHovered) {
      this.onHoverExit();
    }
  }
  private onHoverEnter(): void {
    this.isHovered = true;
    this.experience.canvas.style.cursor = "pointer";

    // Appliquer l'effet de brightness
    if (this.model) {
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          this.applyBrightEffect(child);
        }
      });
    }

    // Hook pour personnalisation
    this.onHover(true);
  }

  private onHoverExit(): void {
    this.isHovered = false;
    this.experience.canvas.style.cursor = "default";

    // Restaurer les matériaux originaux
    if (this.model) {
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          this.restoreOriginalMaterial(child);
        }
      });
    }

    // Hook pour personnalisation
    this.onHover(false);
  }

  private applyBrightEffect(mesh: THREE.Mesh): void {
    const glowValue = 0.1;
    const originalMaterial = this.originalMaterials.get(mesh);
    if (!originalMaterial) return;

    // Créer un matériau plus bright
    let brightMaterial: THREE.Material;

    if (originalMaterial instanceof THREE.MeshToonMaterial) {
      brightMaterial = originalMaterial.clone();
      const toonMat = brightMaterial as THREE.MeshToonMaterial;

      // ✅ EFFET ÉMISSIF au lieu de multiplier la couleur
      toonMat.emissive = originalMaterial.color.clone();
      toonMat.emissiveIntensity = glowValue; // Glow subtil
    } else if (originalMaterial instanceof THREE.MeshStandardMaterial) {
      brightMaterial = originalMaterial.clone();
      const stdMat = brightMaterial as THREE.MeshStandardMaterial;

      stdMat.emissive = originalMaterial.color.clone();
      stdMat.emissiveIntensity = glowValue;
    } else if (originalMaterial instanceof THREE.MeshBasicMaterial) {
      brightMaterial = originalMaterial.clone();
      const brightColor = originalMaterial.color.clone();
      brightColor.multiplyScalar(1.5);
      (brightMaterial as THREE.MeshBasicMaterial).color = brightColor;
    } else {
      // Fallback plus visible
      brightMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00, // Jaune vif
        transparent: true,
        opacity: 0.7,
      });
    }

    console.log(`Applying bright effect to ${mesh.name}`);
    mesh.material = brightMaterial;
    mesh.material.needsUpdate = true;
  }

  private restoreOriginalMaterial(mesh: THREE.Mesh): void {
    const originalMaterial = this.originalMaterials.get(mesh);
    if (originalMaterial) {
      mesh.material = originalMaterial;
    }
  }

  private setupClickable(model: THREE.Group): void {
    // Créer le handler de clic
    this.clickHandler = this.onCanvasClick.bind(this);
    this.experience.canvas.addEventListener("click", this.clickHandler);

    // Marquer tous les meshes comme cliquables
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData.clickable = true;
        child.userData.type =
          this.config.clickType ||
          this.config.name.toLowerCase().replace(" ", "-");
        child.userData.furnitureInstance = this; // Référence vers l'instance
      }
    });
  }
  private onCanvasClick(event: MouseEvent): void {
    // Calculer la position de la souris
    const rect = this.experience.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycasting
    this.raycaster.setFromCamera(this.mouse, this.experience.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    // Vérifier si on a cliqué sur cet objet
    for (const intersect of intersects) {
      if (intersect.object.userData.furnitureInstance === this) {
        this.onClick(intersect);
        break;
      }
    }
  }

  private addToScene() {
    if (this.model) {
      this.scene.add(this.model);
    }
  }

  private setupGUI() {
    if (!this.model) return;

    const folder = this.gui.addFolder(this.config.name);
    const ranges = this.config.guiRanges || {};

    // Position X
    const posXRange = ranges.positionX || [-5, 5, 0.1];
    folder
      .add(this.params, "positionX", ...posXRange)
      .onChange((value: number) => {
        if (this.model) this.model.position.x = value;
      });

    // Position Y
    const posYRange = ranges.positionY || [-2, 3, 0.01];
    folder
      .add(this.params, "positionY", ...posYRange)
      .onChange((value: number) => {
        if (this.model) this.model.position.y = value;
      });

    // Position Z
    const posZRange = ranges.positionZ || [-5, 5, 0.1];
    folder
      .add(this.params, "positionZ", ...posZRange)
      .onChange((value: number) => {
        if (this.model) this.model.position.z = value;
      });

    // Rotation
    const rotRange = ranges.rotation || [0, Math.PI * 2, 0.01];
    folder
      .add(this.params, "rotation", ...rotRange)
      .onChange((value: number) => {
        if (this.model) this.model.rotation.y = value;
      });

    // Scale
    const scaleRange = ranges.scale || [0.001, 1.5, 0.001];
    folder
      .add(this.params.scale, "x", ...scaleRange)
      .onChange((value: number) => {
        if (this.model) this.model.scale.x = value;
      });
    folder
      .add(this.params.scale, "y", ...scaleRange)
      .onChange((value: number) => {
        if (this.model) this.model.scale.y = value;
      });
    folder
      .add(this.params.scale, "z", ...scaleRange)
      .onChange((value: number) => {
        if (this.model) this.model.scale.z = value;
      });

    // Visibility
    folder.add(this.model, "visible");

    //folder.open();

    // Hook pour GUI personnalisé
    this.onGUISetup(folder);
  }

  // Hooks pour personnalisation dans les classes filles
  protected onModelSetup(model: THREE.Group): void {
    // Override dans les classes filles si nécessaire
  }

  protected onGUISetup(folder: GUI): void {
    // Override dans les classes filles pour ajouter des contrôles
  }

  protected onClick(intersect: THREE.Intersection): void {
    console.log(`Clicked on ${this.config.name}`);
    // Override dans les classes filles pour logique spécifique
  }

  protected onHover(isHovered: boolean): void {
    // Override dans les classes filles pour logique spécifique de hover
    console.log(`${this.config.name} ${isHovered ? "hovered" : "unhovered"}`);
  }

  // Méthodes publiques
  public getModel(): THREE.Group | undefined {
    return this.model;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.params.positionX = x;
    this.params.positionY = y;
    this.params.positionZ = z;
    if (this.model) {
      this.model.position.set(x, y, z);
      this.model.updateMatrixWorld();
    }
  }

  protected emitEvent(eventName: string, detail: any): void {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  protected listenToEvent(
    eventName: string,
    handler: (event: CustomEvent) => void
  ): void {
    window.addEventListener(eventName, handler as EventListener);
  }

  public dispose(): void {
    if (this.clickHandler) {
      this.experience.canvas.removeEventListener("click", this.clickHandler);
    }
    if (this.mouseMoveHandler) {
      this.experience.canvas.removeEventListener(
        "mousemove",
        this.mouseMoveHandler
      );
    }
    // Restaurer le curseur
    this.experience.canvas.style.cursor = "default";

    // Clear les matériaux sauvegardés
    this.originalMaterials.clear();
    if (this.model) {
      this.scene.remove(this.model);
    }
  }
}
