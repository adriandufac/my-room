import * as THREE from "three";
import { GUI } from "dat.gui";

export default class SunCycle {
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private scene: THREE.Scene;
  private gui: GUI;

  // Helpers pour visualiser la lumière
  lightHelper!: THREE.DirectionalLightHelper;
  cameraHelper!: THREE.CameraHelper;

  // Paramètres du cycle
  private cycleSettings = {
    dayDuration: 120, // 2 minutes en secondes
    nightDuration: 120, // 2 minutes en secondes
    enabled: true,
    speed: 1, // Multiplicateur de vitesse
    showHelper: false, // Afficher les helpers
    showShadowCamera: false, // Afficher la caméra des ombres
    resetCycle: () => this.resetCycle(),
  };

  // État du cycle
  private elapsedTime: number = 0;
  private isDay: boolean = true;

  // Paramètres du soleil
  private sunSettings = {
    maxIntensity: 10,
    minIntensity: 0,
    startPosition: { x: 5, y: 1, z: -8 }, // Position de lever (derrière)
    endPosition: { x: 5, y: 1, z: 8 }, // Position de coucher (devant)
    peakPosition: { x: 5, y: 4, z: 0 }, // Position de midi (au-dessus)

    // AJOUT: Couleurs du soleil selon l'heure
    sunriseColor: "#FF6B47", // Orange du lever
    noonColor: "#FFF8DC", // Blanc chaud du midi
    sunsetColor: "#FF4500", // Rouge orangé du coucher
    nightColor: "#0B1426", // Bleu très sombre de la nuit

    // AJOUT: Paramètres de la caméra d'ombres
    shadowCameraSize: 15, // Taille de la zone d'ombres
    shadowCameraNear: 0.1, // Distance proche
    shadowCameraFar: 50, // Distance lointaine

    // AJOUT: Paramètres de la lumière ambiante
    ambientNightIntensity: 0.3, // Intensité la nuit
    ambientDayIntensity: 0.7, // Intensité à midi
    enableAmbientCycle: true, // Activer le cycle ambiant

    // AJOUT: Couleurs du background selon l'heure (simplifié)
    backgroundDayColor: "#87CEEB", // Bleu ciel du jour
    backgroundNightColor: "#0B1426", // Bleu très sombre de la nuit
    enableBackgroundCycle: true, // Activer le cycle de background
  };

  constructor(
    sunLight: THREE.DirectionalLight,
    ambientLight: THREE.AmbientLight,
    scene: THREE.Scene,
    gui: GUI
  ) {
    this.sunLight = sunLight;
    this.ambientLight = ambientLight;
    this.scene = scene;
    this.gui = gui;

    this.setupShadowCamera();
    this.setupHelpers(scene);
    this.setupGUI();
    this.initializeSun();
  }

  private setupShadowCamera(): void {
    // Configuration de la caméra d'ombres pour une meilleure couverture
    this.sunLight.shadow.camera.left = -this.sunSettings.shadowCameraSize;
    this.sunLight.shadow.camera.right = this.sunSettings.shadowCameraSize;
    this.sunLight.shadow.camera.top = this.sunSettings.shadowCameraSize;
    this.sunLight.shadow.camera.bottom = -this.sunSettings.shadowCameraSize;
    this.sunLight.shadow.camera.near = this.sunSettings.shadowCameraNear;
    this.sunLight.shadow.camera.far = this.sunSettings.shadowCameraFar;

    // Mise à jour de la matrice de projection
    this.sunLight.shadow.camera.updateProjectionMatrix();
  }

  private setupHelpers(scene: THREE.Scene): void {
    // Helper pour visualiser la direction de la lumière
    this.lightHelper = new THREE.DirectionalLightHelper(
      this.sunLight,
      2,
      0xffff00
    );
    scene.add(this.lightHelper);

    // Helper pour visualiser la caméra des ombres
    this.cameraHelper = new THREE.CameraHelper(this.sunLight.shadow.camera);
    scene.add(this.cameraHelper);

    // Appliquer les valeurs par défaut des paramètres
    this.lightHelper.visible = this.cycleSettings.showHelper;
    this.cameraHelper.visible = this.cycleSettings.showShadowCamera;
  }

  private setupGUI(): void {
    const folder = this.gui.addFolder("Sun Cycle");

    folder.add(this.cycleSettings, "enabled").name("Enable Cycle");
    folder
      .add(this.cycleSettings, "dayDuration", 30, 300, 10)
      .name("Day Duration (s)");
    folder
      .add(this.cycleSettings, "nightDuration", 30, 300, 10)
      .name("Night Duration (s)");
    folder
      .add(this.cycleSettings, "speed", 0.1, 5, 0.1)
      .name("Speed Multiplier");
    folder.add(this.cycleSettings, "resetCycle").name("Reset Cycle");

    // Contrôles pour les helpers
    folder
      .add(this.cycleSettings, "showHelper")
      .name("Show Light Helper")
      .onChange((value: boolean) => {
        this.lightHelper.visible = value;
      });

    folder
      .add(this.cycleSettings, "showShadowCamera")
      .name("Show Shadow Camera")
      .onChange((value: boolean) => {
        this.cameraHelper.visible = value;
      });

    // Paramètres du soleil
    const sunFolder = folder.addFolder("Sun Settings");
    sunFolder
      .add(this.sunSettings, "maxIntensity", 0, 8, 0.01)
      .name("Max Intensity");
    sunFolder
      .add(this.sunSettings, "minIntensity", 0, 0.5, 0.01)
      .name("Min Intensity");

    // Positions
    const posFolder = sunFolder.addFolder("Positions");
    posFolder
      .add(this.sunSettings.startPosition, "z", -20, 20, 0.5)
      .name("Start Z (Behind)");
    posFolder
      .add(this.sunSettings.peakPosition, "y", 5, 20, 0.5)
      .name("Peak Height");
    posFolder
      .add(this.sunSettings.endPosition, "z", -20, 20, 0.5)
      .name("End Z (Front)");

    // AJOUT: Couleurs du soleil
    const colorFolder = sunFolder.addFolder("Sun Colors");
    colorFolder
      .addColor(this.sunSettings, "sunriseColor")
      .name("Sunrise Color")
      .onChange(() => this.updateSunColor());
    colorFolder
      .addColor(this.sunSettings, "noonColor")
      .name("Noon Color")
      .onChange(() => this.updateSunColor());
    colorFolder
      .addColor(this.sunSettings, "sunsetColor")
      .name("Sunset Color")
      .onChange(() => this.updateSunColor());
    colorFolder
      .addColor(this.sunSettings, "nightColor")
      .name("Night Color")
      .onChange(() => this.updateSunColor());

    // AJOUT: Contrôles de la caméra d'ombres
    const shadowFolder = sunFolder.addFolder("Shadow Camera");
    shadowFolder
      .add(this.sunSettings, "shadowCameraSize", 5, 50, 1)
      .name("Coverage Size")
      .onChange(() => this.updateShadowCamera());
    shadowFolder
      .add(this.sunSettings, "shadowCameraNear", 0.1, 5, 0.1)
      .name("Near Distance")
      .onChange(() => this.updateShadowCamera());
    shadowFolder
      .add(this.sunSettings, "shadowCameraFar", 10, 100, 5)
      .name("Far Distance")
      .onChange(() => this.updateShadowCamera());

    // AJOUT: Contrôles de la lumière ambiante
    const ambientFolder = sunFolder.addFolder("Ambient Light");
    ambientFolder
      .add(this.sunSettings, "enableAmbientCycle")
      .name("Enable Ambient Cycle")
      .onChange(() => this.updateAmbientLight());
    ambientFolder
      .add(this.sunSettings, "ambientNightIntensity", 0, 1, 0.01)
      .name("Night Intensity")
      .onChange(() => this.updateAmbientLight());
    ambientFolder
      .add(this.sunSettings, "ambientDayIntensity", 0, 2, 0.01)
      .name("Day Intensity")
      .onChange(() => this.updateAmbientLight());

    // AJOUT: Contrôles du background (simplifié)
    const backgroundFolder = sunFolder.addFolder("Background Colors");
    backgroundFolder
      .add(this.sunSettings, "enableBackgroundCycle")
      .name("Enable Background Cycle")
      .onChange(() => this.updateBackground());
    backgroundFolder
      .addColor(this.sunSettings, "backgroundDayColor")
      .name("Day Color")
      .onChange(() => this.updateBackground());
    backgroundFolder
      .addColor(this.sunSettings, "backgroundNightColor")
      .name("Night Color")
      .onChange(() => this.updateBackground());
  }

  private initializeSun(): void {
    // Commencer à la position de lever
    this.sunLight.position.copy(
      new THREE.Vector3(
        this.sunSettings.startPosition.x,
        this.sunSettings.startPosition.y,
        this.sunSettings.startPosition.z
      )
    );
    this.sunLight.intensity = this.sunSettings.minIntensity;

    // AJOUT: Initialiser avec la couleur du lever
    this.sunLight.color.setHex(
      parseInt(this.sunSettings.sunriseColor.replace("#", ""), 16)
    );

    // AJOUT: Initialiser la lumière ambiante
    this.ambientLight.intensity = this.sunSettings.ambientNightIntensity;

    // AJOUT: Initialiser le background
    if (this.sunSettings.enableBackgroundCycle) {
      this.scene.background = new THREE.Color(
        this.sunSettings.backgroundNightColor
      );
    }
  }

  private resetCycle(): void {
    this.elapsedTime = 0;
    this.isDay = true;
    this.initializeSun();
  }

  public update(deltaTime: number): void {
    if (!this.cycleSettings.enabled) return;

    this.elapsedTime += deltaTime * this.cycleSettings.speed;

    if (this.isDay) {
      this.updateDayPhase();
    } else {
      this.updateNightPhase();
    }
  }

  // AJOUT: Calcul de l'intensité de la lumière ambiante
  private calculateAmbientIntensity(progress: number): number {
    // Même courbe en cloche que l'intensité du soleil
    const intensityFactor = Math.sin(progress * Math.PI);
    return THREE.MathUtils.lerp(
      this.sunSettings.ambientNightIntensity,
      this.sunSettings.ambientDayIntensity,
      intensityFactor
    );
  }

  // AJOUT: Méthode pour mettre à jour la lumière ambiante via GUI
  private updateAmbientLight(): void {
    if (this.sunSettings.enableAmbientCycle) {
      if (this.isDay) {
        const dayProgress = this.elapsedTime / this.cycleSettings.dayDuration;
        const ambientIntensity = this.calculateAmbientIntensity(dayProgress);
        this.ambientLight.intensity = ambientIntensity;
      } else {
        this.ambientLight.intensity = this.sunSettings.ambientNightIntensity;
      }
    }
  }

  // AJOUT: Calcul de la couleur du background selon le moment de la journée (simplifié)
  private calculateBackgroundColor(progress: number): THREE.Color {
    const night = new THREE.Color(this.sunSettings.backgroundNightColor);
    const day = new THREE.Color(this.sunSettings.backgroundDayColor);

    if (progress <= 0.25) {
      // 0% → 25%: Dark blue → Day blue
      const t = progress / 0.25;
      return night.clone().lerp(day, t);
    } else if (progress <= 0.75) {
      // 25% → 75%: Stays day blue
      return day.clone();
    } else {
      // 75% → 100%: Day blue → Dark blue
      const t = (progress - 0.75) / 0.25;
      return day.clone().lerp(night, t);
    }
  }

  // AJOUT: Méthode pour mettre à jour le background via GUI
  private updateBackground(): void {
    if (this.sunSettings.enableBackgroundCycle) {
      if (this.isDay) {
        const dayProgress = this.elapsedTime / this.cycleSettings.dayDuration;
        const backgroundColor = this.calculateBackgroundColor(dayProgress);
        this.scene.background = backgroundColor;
      } else {
        this.scene.background = new THREE.Color(
          this.sunSettings.backgroundNightColor
        );
      }
    }
  }

  private updateDayPhase(): void {
    const dayProgress = this.elapsedTime / this.cycleSettings.dayDuration;

    if (dayProgress >= 1) {
      // Passer à la nuit
      this.isDay = false;
      this.elapsedTime = 0;
      this.sunLight.intensity = this.sunSettings.minIntensity;
      return;
    }

    // Calculer la position du soleil sur un arc de cercle
    const sunPosition = this.calculateSunPosition(dayProgress);
    this.sunLight.position.copy(sunPosition);

    // Calculer l'intensité avec une courbe en cloche
    const intensity = this.calculateSunIntensity(dayProgress);
    this.sunLight.intensity = intensity;

    // AJOUT: Calculer et appliquer la couleur du soleil
    const sunColor = this.calculateSunColor(dayProgress);
    this.sunLight.color.copy(sunColor);

    // AJOUT: Mettre à jour la lumière ambiante
    if (this.sunSettings.enableAmbientCycle) {
      const ambientIntensity = this.calculateAmbientIntensity(dayProgress);
      this.ambientLight.intensity = ambientIntensity;
    }

    // AJOUT: Mettre à jour le background
    if (this.sunSettings.enableBackgroundCycle) {
      const backgroundColor = this.calculateBackgroundColor(dayProgress);
      this.scene.background = backgroundColor;
    }

    // Mettre à jour les helpers
    this.updateHelpers();
  }

  private updateNightPhase(): void {
    const nightProgress = this.elapsedTime / this.cycleSettings.nightDuration;

    if (nightProgress >= 1) {
      // Retourner au jour
      this.isDay = true;
      this.elapsedTime = 0;
      this.initializeSun();
    }

    // Garder le soleil éteint pendant la nuit
    this.sunLight.intensity = this.sunSettings.minIntensity;

    // AJOUT: Appliquer la couleur de nuit
    this.sunLight.color.setHex(
      parseInt(this.sunSettings.nightColor.replace("#", ""), 16)
    );

    // AJOUT: Mettre à jour la lumière ambiante pour la nuit
    if (this.sunSettings.enableAmbientCycle) {
      this.ambientLight.intensity = this.sunSettings.ambientNightIntensity;
    }

    // AJOUT: Mettre à jour le background pour la nuit
    if (this.sunSettings.enableBackgroundCycle) {
      this.scene.background = new THREE.Color(
        this.sunSettings.backgroundNightColor
      );
    }

    // Mettre à jour les helpers même pendant la nuit
    this.updateHelpers();
  }

  private updateHelpers(): void {
    // Mettre à jour le helper de la lumière directionnelle
    if (this.lightHelper) {
      this.lightHelper.update();
    }

    // Mettre à jour le helper de la caméra des ombres
    if (this.cameraHelper) {
      this.cameraHelper.update();
    }
  }

  private calculateSunPosition(progress: number): THREE.Vector3 {
    // Interpolation parabolique pour simuler l'arc du soleil
    const z = THREE.MathUtils.lerp(
      this.sunSettings.startPosition.z,
      this.sunSettings.endPosition.z,
      progress
    );

    // Hauteur parabolique : maximum au milieu de la journée
    const heightFactor = 4 * progress * (1 - progress); // Parabole inversée
    const y =
      this.sunSettings.startPosition.y +
      (this.sunSettings.peakPosition.y - this.sunSettings.startPosition.y) *
        heightFactor;

    const x = THREE.MathUtils.lerp(
      this.sunSettings.startPosition.x,
      this.sunSettings.endPosition.x,
      progress
    );

    return new THREE.Vector3(x, y, z);
  }

  private calculateSunIntensity(progress: number): number {
    // Courbe en cloche : intensité maximale au milieu de la journée
    const intensityFactor = Math.sin(progress * Math.PI);
    return THREE.MathUtils.lerp(
      this.sunSettings.minIntensity,
      this.sunSettings.maxIntensity,
      intensityFactor
    );
  }

  // AJOUT: Calcul de la couleur du soleil selon le moment de la journée
  private calculateSunColor(progress: number): THREE.Color {
    const sunrise = new THREE.Color(this.sunSettings.sunriseColor);
    const noon = new THREE.Color(this.sunSettings.noonColor);
    const sunset = new THREE.Color(this.sunSettings.sunsetColor);

    if (progress <= 0.25) {
      // Lever du soleil vers milieu de matinée (0 -> 0.25)
      const t = progress / 0.25;
      return sunrise.clone().lerp(noon, t);
    } else if (progress <= 0.75) {
      // Milieu de matinée vers milieu d'après-midi (0.25 -> 0.75)
      // Garder la couleur du midi
      return noon.clone();
    } else {
      // Milieu d'après-midi vers coucher (0.75 -> 1)
      const t = (progress - 0.75) / 0.25;
      return noon.clone().lerp(sunset, t);
    }
  }

  // AJOUT: Méthode pour mettre à jour la couleur en temps réel via GUI
  private updateSunColor(): void {
    // Mettre à jour la couleur immédiatement si on est en cours de cycle
    if (this.cycleSettings.enabled) {
      if (this.isDay) {
        const dayProgress = this.elapsedTime / this.cycleSettings.dayDuration;
        const sunColor = this.calculateSunColor(dayProgress);
        this.sunLight.color.copy(sunColor);
      } else {
        this.sunLight.color.setHex(
          parseInt(this.sunSettings.nightColor.replace("#", ""), 16)
        );
      }
    }
  }

  // AJOUT: Méthode pour mettre à jour la caméra d'ombres
  private updateShadowCamera(): void {
    this.sunLight.shadow.camera.left = -this.sunSettings.shadowCameraSize;
    this.sunLight.shadow.camera.right = this.sunSettings.shadowCameraSize;
    this.sunLight.shadow.camera.top = this.sunSettings.shadowCameraSize;
    this.sunLight.shadow.camera.bottom = -this.sunSettings.shadowCameraSize;
    this.sunLight.shadow.camera.near = this.sunSettings.shadowCameraNear;
    this.sunLight.shadow.camera.far = this.sunSettings.shadowCameraFar;

    // Mise à jour de la matrice de projection
    this.sunLight.shadow.camera.updateProjectionMatrix();

    // Mettre à jour le helper si visible
    if (this.cameraHelper) {
      this.cameraHelper.update();
    }
  }

  // Getters pour l'état actuel
  public get currentPhase(): "day" | "night" {
    return this.isDay ? "day" : "night";
  }

  public get cycleProgress(): number {
    const totalDuration = this.isDay
      ? this.cycleSettings.dayDuration
      : this.cycleSettings.nightDuration;
    return this.elapsedTime / totalDuration;
  }

  public get timeOfDay(): string {
    if (!this.isDay) return "Night";

    const progress = this.cycleProgress;
    if (progress < 0.25) return "Morning";
    if (progress < 0.5) return "Late Morning";
    if (progress < 0.75) return "Afternoon";
    return "Evening";
  }

  // Méthode pour nettoyer les ressources
  public dispose(): void {
    // Nettoyer les helpers
    if (this.lightHelper) {
      this.lightHelper.dispose();
    }
    if (this.cameraHelper) {
      this.cameraHelper.dispose();
    }
  }
}
