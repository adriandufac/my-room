import type { GUI } from "dat.gui";
import RoomExperience from "../RoomExperience";
import * as THREE from "three";
import MaterialFactory from "../Utils/MaterialFactory";
import ModelLoader from "../Utils/ModelLoader";
import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";
import { createRoot } from 'react-dom/client';
import React from 'react';
import { WindowsOverlay } from '../../components/WindowsOverlay';

export default class ComputerScreen extends FurnitureItem {
  // Références pour le halo
  private haloMesh?: THREE.Mesh;
  private screenLight?: THREE.PointLight;

  // Windows overlay
  private overlayContainer?: HTMLDivElement;
  private overlayRoot?: any;
  private isWindowsOverlayVisible: boolean = false;

  // Paramètres du halo
  private haloParams = {
    enabled: true,
    color: 0x1760cf, // Bleu écran typique
    intensity: 0,
    // Taille du halo
    width: 1.86,
    height: 1.11,
    opacity: 1,
    // Position absolue du halo
    positionX: 2.44,
    positionY: 2.12,
    positionZ: 0.29,
    rotationX: -0.08,
    rotationY: 1.61,
    rotationZ: -0.19,
    pulseSpeed: 2.3, // Vitesse de pulsation
    enablePulse: true,
  };

  constructor() {
    const config: FurnitureConfig = {
      name: "Screen",
      modelPath: "/models/computerScreen/scene.gltf",
      defaultParams: {
        positionX: 1.5,
        positionY: -1.3,
        positionZ: -0.9,
        rotation: 2.04,
        scale: { x: 1, y: 1, z: 1 },
      },
      clickable: true,
      hoverable: true,
      clickType: "screen",
    };

    super(config);
    
    // Setup Windows overlay
    this.setupWindowsOverlay();
  }

  // Override de la méthode onModelSetup de la classe parent
  protected onModelSetup(model: THREE.Group): void {
    super.onModelSetup(model);

    // Créer le halo lumineux après que le modèle soit configuré
    this.createScreenHalo();
    // Ajouter une lumière pour simuler l'éclairage de l'écran
    this.createScreenLight();
  }

  private updateHaloGeometry() {
    if (!this.haloMesh) return;

    // Sauvegarder les transformations actuelles
    const currentPosition = this.haloMesh.position.clone();
    const currentRotation = this.haloMesh.rotation.clone();
    const currentOrder = this.haloMesh.rotation.order;

    // Recréer la géométrie avec les nouvelles dimensions
    this.haloMesh.geometry.dispose();
    this.haloMesh.geometry = new THREE.PlaneGeometry(
      this.haloParams.width,
      this.haloParams.height,
      16,
      16
    );

    // Restaurer les transformations
    this.haloMesh.position.copy(currentPosition);
    this.haloMesh.rotation.copy(currentRotation);
    this.haloMesh.rotation.order = currentOrder;

    // Réappliquer le scale correctement
    this.updateHaloScale();
  }

  // Override de la méthode onGUISetup pour ajouter les contrôles du halo
  protected onGUISetup(folder: any): void {
    super.onGUISetup(folder);
    this.setupHaloGUI(folder);
  }

  private createScreenHalo() {
    if (!this.model) return;

    // Géométrie du halo (plan rectangulaire)
    const haloGeometry = new THREE.PlaneGeometry(
      this.haloParams.width,
      this.haloParams.height,
      16,
      16
    );

    // Matériau du halo avec effet lumineux
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: this.haloParams.color,
      transparent: true,
      opacity: this.haloParams.opacity,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, // Effet lumineux additif
      depthWrite: false, // Évite les problèmes de z-fighting
    });

    // Créer le mesh du halo
    this.haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);

    // Positionner le halo
    this.updateHaloPosition();

    // Ajouter le halo à la scène
    this.scene.add(this.haloMesh);
  }

  private createScreenLight() {
    if (!this.model) return;

    // Lumière ponctuelle pour simuler l'éclairage de l'écran
    this.screenLight = new THREE.PointLight(
      this.haloParams.color,
      this.haloParams.intensity,
      3, // Distance
      2 // Decay
    );

    // Positionner la lumière devant l'écran
    this.updateLightPosition();

    // Ajouter la lumière à la scène
    this.scene.add(this.screenLight);
  }

  private updateHaloPosition() {
    if (!this.haloMesh) return;

    // Position absolue manuelle
    this.haloMesh.position.set(
      this.haloParams.positionX,
      this.haloParams.positionY,
      this.haloParams.positionZ
    );

    // Rotations LOCALES (intrinsèques) - ordre ZYX pour des rotations plus intuitives
    this.haloMesh.rotation.order = "ZYX";
    this.haloMesh.rotation.set(
      this.haloParams.rotationX, // Pitch local
      this.haloParams.rotationY, // Yaw local
      this.haloParams.rotationZ // Roll local
    );

    // Ajuster la taille (largeur et hauteur séparément)
    // Utiliser directement la géométrie au lieu du scale pour éviter les conflits
    this.updateHaloScale();
  }

  private updateHaloScale() {
    if (!this.haloMesh) return;

    // Reset du scale puis application des nouvelles valeurs
    this.haloMesh.scale.set(1, 1, 1);
    this.haloMesh.scale.set(
      this.haloParams.width / 2, // Normaliser par rapport à la géométrie de base
      this.haloParams.height / 1.5, // Normaliser par rapport à la géométrie de base
      1
    );
  }

  private updateLightPosition() {
    if (!this.screenLight) return;

    // La lumière suit la position du halo
    this.screenLight.position.set(
      this.haloParams.positionX,
      this.haloParams.positionY,
      this.haloParams.positionZ
    );
  }

  private setupHaloGUI(folder: any): void {
    // Créer un sous-dossier pour les contrôles du halo
    const haloFolder = folder.addFolder("Screen Halo");

    haloFolder.add(this.haloParams, "enabled").onChange((value: boolean) => {
      if (this.haloMesh) this.haloMesh.visible = value;
      if (this.screenLight) this.screenLight.visible = value;
    });

    // Position
    const positionFolder = haloFolder.addFolder("Position");
    positionFolder
      .add(this.haloParams, "positionX", -10, 10, 0.01)
      .name("Position X")
      .onChange(() => {
        this.updateHaloPosition();
        this.updateLightPosition();
      });

    positionFolder
      .add(this.haloParams, "positionY", -5, 5, 0.01)
      .name("Position Y")
      .onChange(() => {
        this.updateHaloPosition();
        this.updateLightPosition();
      });

    positionFolder
      .add(this.haloParams, "positionZ", -10, 10, 0.01)
      .name("Position Z")
      .onChange(() => {
        this.updateHaloPosition();
        this.updateLightPosition();
      });

    // Rotation (avec des noms plus clairs pour les rotations locales)
    const rotationFolder = haloFolder.addFolder("Rotation (Local Axes)");
    rotationFolder
      .add(this.haloParams, "rotationX", -Math.PI, Math.PI, 0.01)
      .name("Pitch (Local X)")
      .onChange(() => {
        this.updateHaloPosition();
      });

    rotationFolder
      .add(this.haloParams, "rotationY", -Math.PI, Math.PI, 0.01)
      .name("Yaw (Local Y)")
      .onChange(() => {
        this.updateHaloPosition();
      });

    rotationFolder
      .add(this.haloParams, "rotationZ", -Math.PI, Math.PI, 0.01)
      .name("Roll (Local Z)")
      .onChange(() => {
        this.updateHaloPosition();
      });

    // Taille
    const sizeFolder = haloFolder.addFolder("Size");
    sizeFolder
      .add(this.haloParams, "width", 0.1, 5, 0.01)
      .name("Width")
      .onChange(() => {
        this.updateHaloGeometry();
      });

    sizeFolder
      .add(this.haloParams, "height", 0.1, 5, 0.01)
      .name("Height")
      .onChange(() => {
        this.updateHaloGeometry();
      });

    // Apparence
    const appearanceFolder = haloFolder.addFolder("Appearance");
    appearanceFolder
      .addColor(this.haloParams, "color")
      .onChange((value: number) => {
        if (
          this.haloMesh &&
          this.haloMesh.material instanceof THREE.MeshBasicMaterial
        ) {
          this.haloMesh.material.color.setHex(value);
        }
        if (this.screenLight) {
          this.screenLight.color.setHex(value);
        }
      });

    appearanceFolder
      .add(this.haloParams, "intensity", 0, 2, 0.1)
      .name("Light Intensity")
      .onChange((value: number) => {
        if (this.screenLight) this.screenLight.intensity = value;
      });

    appearanceFolder
      .add(this.haloParams, "opacity", 0, 1, 0.05)
      .name("Halo Opacity")
      .onChange((value: number) => {
        if (
          this.haloMesh &&
          this.haloMesh.material instanceof THREE.MeshBasicMaterial
        ) {
          this.haloMesh.material.opacity = value;
        }
      });

    // Animation
    const animationFolder = haloFolder.addFolder("Animation");
    animationFolder.add(this.haloParams, "enablePulse").name("Enable Pulse");
    animationFolder
      .add(this.haloParams, "pulseSpeed", 0.1, 3, 0.1)
      .name("Pulse Speed");

    // Boutons utiles
    const actionsFolder = haloFolder.addFolder("Quick Actions");
    actionsFolder.add(
      {
        "Copy Screen Transform": () => {
          if (this.model) {
            this.haloParams.positionX = this.model.position.x;
            this.haloParams.positionY = this.model.position.y;
            this.haloParams.positionZ = this.model.position.z;
            this.haloParams.rotationY = this.model.rotation.y;
            this.updateHaloPosition();
            this.updateLightPosition();
            haloFolder.updateDisplay();
          }
        },
      },
      "Copy Screen Transform"
    );

    actionsFolder.add(
      {
        "Reset Rotation": () => {
          this.haloParams.rotationX = 0;
          this.haloParams.rotationY = 0;
          this.haloParams.rotationZ = 0;
          this.updateHaloPosition();
          haloFolder.updateDisplay();
        },
      },
      "Reset Rotation"
    );

    haloFolder.open();
    positionFolder.open();
    rotationFolder.open();
    sizeFolder.open();
  }

  // Méthode d'update pour l'animation de pulsation
  public update(deltaTime: number): void {
    if (!this.haloParams.enablePulse || !this.haloMesh) return;

    // Effet de pulsation
    const time = Date.now() * 0.001 * this.haloParams.pulseSpeed;
    const pulse = Math.sin(time) * 0.1 + 0.9; // Oscillation entre 0.8 et 1.0

    if (this.haloMesh.material instanceof THREE.MeshBasicMaterial) {
      this.haloMesh.material.opacity = this.haloParams.opacity * pulse;
    }

    if (this.screenLight) {
      this.screenLight.intensity = this.haloParams.intensity * pulse;
    }
  }

  // Setup Windows overlay container
  private setupWindowsOverlay(): void {
    // Create overlay container
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'computer-screen-overlay';
    document.body.appendChild(this.overlayContainer);
    
    // Create React root
    this.overlayRoot = createRoot(this.overlayContainer);
    
    // Initial render (hidden)
    this.renderWindowsOverlay();
  }

  private showWindowsOverlay(): void {
    console.log('[COMPUTER] Showing Windows overlay');
    this.isWindowsOverlayVisible = true;
    this.renderWindowsOverlay();
  }

  private hideWindowsOverlay(): void {
    console.log('[COMPUTER] Hiding Windows overlay');
    this.isWindowsOverlayVisible = false;
    this.renderWindowsOverlay();
  }

  private renderWindowsOverlay(): void {
    if (this.overlayRoot) {
      this.overlayRoot.render(
        React.createElement(WindowsOverlay, {
          isVisible: this.isWindowsOverlayVisible,
          onClose: () => this.hideWindowsOverlay()
        })
      );
    }
  }

  // Override onClick method from FurnitureItem
  protected onClick(intersect: THREE.Intersection): void {
    console.log('[COMPUTER] Computer screen clicked!');
    this.showWindowsOverlay();
    super.onClick(intersect);
  }

  // Override de la méthode dispose pour nettoyer les ressources du halo
  public dispose(): void {
    if (this.haloMesh) {
      this.scene.remove(this.haloMesh);
      this.haloMesh.geometry.dispose();
      if (this.haloMesh.material instanceof THREE.Material) {
        this.haloMesh.material.dispose();
      }
    }

    if (this.screenLight) {
      this.scene.remove(this.screenLight);
    }

    // Clean up Windows overlay
    if (this.overlayRoot) {
      this.overlayRoot.unmount();
    }
    if (this.overlayContainer && this.overlayContainer.parentNode) {
      this.overlayContainer.parentNode.removeChild(this.overlayContainer);
    }

    // Appeler le dispose de la classe parent
    super.dispose();
  }
}
