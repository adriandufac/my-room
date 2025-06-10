import * as THREE from "three";
import type { GUI } from "dat.gui";
import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";
import ModelLoader, { type ModelWithAnimations } from "../Utils/ModelLoader";

interface CatPosition {
  x: number;
  z: number;
  rotation: number;
}

interface CatPhase {
  startTime: number; // Pourcentage du jour (0-1)
  position: CatPosition;
  animation: string;
  description: string;
}

// États du mouvement
const MovementState = {
  IDLE: "idle",
  TURNING_TO_TARGET: "turning_to_target",
  MOVING: "moving",
  TURNING_TO_FINAL: "turning_to_final",
  FINISHING: "finishing",
} as const;

type MovementState = (typeof MovementState)[keyof typeof MovementState];

export default class Cat extends FurnitureItem {
  private mixer!: THREE.AnimationMixer;
  private animations: { [key: string]: THREE.AnimationAction } = {};
  private currentAnimation: string = "IdleNorm";

  // Cycle du chat selon le soleil
  private catPhases: CatPhase[] = [
    {
      startTime: 0, // Début de journée
      position: { x: -5, z: -1.6, rotation: 0.88 },
      animation: "IdleNorm",
      description: "Morning spot",
    },
    {
      startTime: 0.2, // 20% du jour
      position: { x: -1.2, z: 1.2, rotation: 3 },
      animation: "IdleNorm",
      description: "First exploration",
    },
    {
      startTime: 0.4, // 40% du jour
      position: { x: 0.9, z: -2.1, rotation: 4.63 },
      animation: "IdleSit",
      description: "Afternoon rest spot",
    },
    {
      startTime: 0.8, // 80% du jour
      position: { x: -5, z: -1.6, rotation: 0.88 },
      animation: "IdleNorm",
      description: "Return home",
    },
  ];

  private currentPhaseIndex: number = 0;

  // Nouveaux paramètres de mouvement
  private movementState: MovementState = MovementState.IDLE;
  private moveStartTime: number = 0;
  private moveDuration: number = 0;
  private turnDuration: number = 1.0; // 1 seconde pour se tourner
  private walkSpeed: number = 0.45; // unités par seconde

  private startPosition: CatPosition = { x: 0, z: 0, rotation: 0 };
  private targetPosition: CatPosition = { x: 0, z: 0, rotation: 0 };
  private currentRotation: number = 0;
  private targetRotation: number = 0;
  private finalRotation: number = 0;

  private onMovementComplete?: () => void;

  // Paramètres d'animation pour la GUI
  private animationParams = {
    currentAnimation: "IdleNorm",
    playAnimation: () =>
      this.playAnimation(this.animationParams.currentAnimation),
    animationSpeed: 0.75,
    followSunCycle: true,
    debugPhase: "Idle",
    walkSpeed: 0.45,
    turnSpeed: 0.5,
  };

  constructor() {
    const config: FurnitureConfig = {
      name: "Cat",
      modelPath: "/models/cat/scene.gltf",
      defaultParams: {
        positionX: -0.5,
        positionY: 0.01,
        positionZ: -1.6,
        rotation: 0.88,
        scale: { x: 0.04, y: 0.04, z: 0.04 },
      },
      guiRanges: {
        scale: [0.001, 3, 0.001],
      },
    };

    super(config);
  }

  // Override de la méthode loadModel de la classe parent
  protected async loadModel(): Promise<void> {
    try {
      const result: ModelWithAnimations = await ModelLoader.loadWithAnimations(
        this.config.modelPath
      );

      this.model = result.model;

      // Setup animations immédiatement après le chargement
      if (result.animations.length > 0) {
        this.setupAnimations(result.animations);
      } else {
        console.warn("No animations found in cat model");
      }
    } catch (error) {
      console.error(
        `Error loading ${this.config.name} with animations:`,
        error
      );
      throw error;
    }
  }

  protected onModelSetup(model: THREE.Group): void {
    super.onModelSetup(model);
    // Initialiser la position de départ
    this.setCurrentPosition(this.catPhases[0].position);
    this.currentRotation = this.catPhases[0].position.rotation;
  }

  protected onGUISetup(folder: GUI): void {
    super.onGUISetup(folder);
    this.setupAnimationGUI(folder);
  }

  private setupAnimations(animations: THREE.AnimationClip[]): void {
    if (!this.model) {
      console.warn("No model found for cat animations");
      return;
    }

    // Créer le mixer d'animations
    this.mixer = new THREE.AnimationMixer(this.model);

    // Charger toutes les animations disponibles
    animations.forEach((clip) => {
      const action = this.mixer.clipAction(clip);
      this.animations[clip.name] = action;
      console.log(`Animation loaded: ${clip.name}`);
    });

    // Jouer l'animation par défaut
    this.playAnimation("IdleNorm");
  }

  private setupAnimationGUI(folder: GUI): void {
    // Créer un sous-dossier pour les animations
    const animFolder = folder.addFolder("Cat Animations");

    // Liste des animations disponibles
    const animationNames = Object.keys(this.animations);

    if (animationNames.length > 0) {
      // Contrôle du cycle solaire
      animFolder
        .add(this.animationParams, "followSunCycle")
        .name("Follow Sun Cycle");

      // Debug de la phase actuelle
      animFolder
        .add(this.animationParams, "debugPhase")
        .name("Current Phase")
        .listen(); // Pour mettre à jour automatiquement

      // Paramètres de mouvement
      animFolder
        .add(this.animationParams, "walkSpeed", 0.01, 5, 0.05)
        .name("Walk Speed")
        .onChange((value: number) => {
          this.walkSpeed = value;
        });

      animFolder
        .add(this.animationParams, "turnSpeed", 0.2, 3, 0.1)
        .name("Turn Speed")
        .onChange((value: number) => {
          this.turnDuration = 1.0 / value;
        });

      // Sélecteur d'animation manuel
      animFolder
        .add(this.animationParams, "currentAnimation", animationNames)
        .name("Manual Animation")
        .onChange((value: string) => {
          if (!this.animationParams.followSunCycle) {
            this.playAnimation(value);
          }
        });

      // Contrôle de vitesse
      animFolder
        .add(this.animationParams, "animationSpeed", 0.1, 3, 0.05)
        .name("Speed")
        .onChange((value: number) => {
          Object.values(this.animations).forEach((action) => {
            action.setEffectiveTimeScale(value);
          });
        });

      // Boutons de test pour les phases
      const testFolder = animFolder.addFolder("Test Phases");
      const testActions = {
        "Test Morning": () => this.testPhase(0),
        "Test 20%": () => this.testPhase(1),
        "Test 40%": () => this.testPhase(2),
        "Test 80%": () => this.testPhase(3),
      };

      Object.entries(testActions).forEach(([name, action]) => {
        testFolder.add({ [name]: action }, name);
      });

      // Boutons rapides pour les animations individuelles
      const quickFolder = animFolder.addFolder("Quick Animations");
      const quickActions = {
        "Idle Normal": () => this.playAnimation("IdleNorm"),
        Walk: () => this.playAnimation("WalkCycle"),
        "Tail Swoosh": () => this.playAnimation("IdleTailSwoosh"),
        "Sit Down": () => this.playAnimation("SitDown"),
        "Idle Sit": () => this.playAnimation("IdleSit"),
        "Stand Up": () => this.playAnimation("StandUp"),
      };

      Object.entries(quickActions).forEach(([name, actionFn]) => {
        const animName = actionFn.toString().match(/"(.+)"/)?.[1] || "";
        if (this.animations[animName]) {
          quickFolder.add({ [name]: actionFn }, name);
        }
      });

      animFolder.open();
    }
  }

  private testPhase(phaseIndex: number): void {
    if (phaseIndex < this.catPhases.length) {
      this.currentPhaseIndex = phaseIndex;
      const phase = this.catPhases[phaseIndex];
      this.moveToPosition(phase.position, () => {
        this.handlePhaseAnimation(phase);
        this.animationParams.debugPhase = phase.description;
      });
    }
  }

  // MÉTHODE PRINCIPALE POUR LE CYCLE DU SOLEIL
  public updateFromSunCycle(
    sunCyclePhase: string,
    cycleProgress: number
  ): void {
    if (!this.animationParams.followSunCycle) return;

    const isDay = sunCyclePhase === "day";

    if (!isDay) {
      // Pendant la nuit, rester en position de départ sans animation
      this.animationParams.debugPhase = "Night - Sleeping";
      if (this.movementState === MovementState.IDLE) {
        const homePosition = this.catPhases[0].position;
        if (Math.abs(this.getCurrentPosition().x - homePosition.x) > 0.1) {
          this.setCurrentPosition(homePosition);
        }
        // Pas d'animation la nuit (le chat dort)
        this.stopAllAnimations();
      }
      return;
    }

    // Déterminer la phase actuelle selon le progrès du jour
    const currentPhase = this.determineCurrentPhase(cycleProgress);

    if (
      currentPhase !== this.currentPhaseIndex &&
      this.movementState === MovementState.IDLE
    ) {
      this.currentPhaseIndex = currentPhase;
      const phase = this.catPhases[currentPhase];

      this.animationParams.debugPhase = `Moving to: ${phase.description}`;
      console.log(
        `Cat: ${this.animationParams.debugPhase} (${(
          cycleProgress * 100
        ).toFixed(1)}%)`
      );

      // Se déplacer vers la nouvelle position
      this.moveToPosition(phase.position, () => {
        // Callback quand le mouvement est terminé
        this.handlePhaseAnimation(phase);
        this.animationParams.debugPhase = phase.description;
        console.log(`Cat arrived at: ${phase.description}`);
      });
    }
  }

  private determineCurrentPhase(dayProgress: number): number {
    // Trouver la phase correspondant au progrès actuel
    for (let i = this.catPhases.length - 1; i >= 0; i--) {
      if (dayProgress >= this.catPhases[i].startTime) {
        return i;
      }
    }
    return 0;
  }

  private handlePhaseAnimation(phase: CatPhase): void {
    switch (phase.animation) {
      case "StandUp": {
        // Séquence : StandUp -> IdleNorm
        this.playAnimation("StandUp");
        const standUpAction = this.animations["StandUp"];
        if (standUpAction) {
          const duration =
            standUpAction.getClip().duration /
            this.animationParams.animationSpeed;
          setTimeout(() => {
            this.playAnimation("IdleNorm");
          }, duration * 1000);
        }
        break;
      }

      default:
        this.playAnimation(phase.animation);
        break;
    }
  }

  private moveToPosition(
    targetPos: CatPosition,
    onComplete?: () => void
  ): void {
    if (!this.model || this.movementState !== MovementState.IDLE) return;

    // Sauvegarder le callback
    this.onMovementComplete = onComplete;

    // Calculer les paramètres du mouvement
    this.startPosition = this.getCurrentPosition();
    this.targetPosition = targetPos;
    this.currentRotation = this.model.rotation.y;
    this.finalRotation = targetPos.rotation;

    // Calculer l'angle vers lequel se tourner pour regarder la cible
    const dx = targetPos.x - this.startPosition.x;
    const dz = targetPos.z - this.startPosition.z;
    this.targetRotation = Math.atan2(dx, dz);

    // Calculer la durée du mouvement (distance / vitesse)
    const distance = Math.sqrt(dx * dx + dz * dz);
    this.moveDuration = distance / this.walkSpeed;

    // Commencer par se tourner vers la cible
    this.startTurningToTarget();
  }

  private startTurningToTarget(): void {
    this.movementState = MovementState.TURNING_TO_TARGET;
    this.moveStartTime = Date.now();
    console.log("Cat: Turning towards target");
  }

  private startMoving(): void {
    this.movementState = MovementState.MOVING;
    this.moveStartTime = Date.now();
    this.playAnimation("WalkCycle");
    console.log("Cat: Starting to walk");
  }

  private startTurningToFinal(): void {
    this.movementState = MovementState.TURNING_TO_FINAL;
    this.moveStartTime = Date.now();
    this.currentRotation = this.model!.rotation.y;
    console.log("Cat: Turning to final rotation");
  }

  private finishMovement(): void {
    this.movementState = MovementState.IDLE;
    this.setCurrentPosition(this.targetPosition);

    if (this.onMovementComplete) {
      this.onMovementComplete();
      this.onMovementComplete = undefined;
    }

    console.log("Cat: Movement completed");
  }

  private getCurrentPosition(): CatPosition {
    if (!this.model) return { x: 0, z: 0, rotation: 0 };
    return {
      x: this.model.position.x,
      z: this.model.position.z,
      rotation: this.model.rotation.y,
    };
  }

  private setCurrentPosition(pos: CatPosition): void {
    if (!this.model) return;
    this.model.position.x = pos.x;
    this.model.position.z = pos.z;
    this.model.rotation.y = pos.rotation;

    // Mettre à jour les paramètres GUI
    this.params.positionX = pos.x;
    this.params.positionZ = pos.z;
    this.params.rotation = pos.rotation;
  }

  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  private interpolateAngle(start: number, end: number, t: number): number {
    const diff = this.normalizeAngle(end - start);
    return start + diff * t;
  }

  private playAnimation(animationName: string): void {
    if (!this.mixer || !this.animations[animationName]) {
      console.warn(`Animation "${animationName}" not found`);
      return;
    }

    // Arrêter l'animation actuelle
    if (this.currentAnimation && this.animations[this.currentAnimation]) {
      this.animations[this.currentAnimation].fadeOut(0.3);
    }

    // Jouer la nouvelle animation
    const newAction = this.animations[animationName];
    newAction.reset();
    newAction.setEffectiveTimeScale(this.animationParams.animationSpeed);
    newAction.fadeIn(0.3);
    newAction.play();

    this.currentAnimation = animationName;
    this.animationParams.currentAnimation = animationName;
  }

  private stopAllAnimations(): void {
    Object.values(this.animations).forEach((action) => {
      action.stop();
    });
  }

  // Méthode pour faire une séquence d'animations
  public playAnimationSequence(
    animations: string[],
    loop: boolean = false
  ): void {
    if (animations.length === 0) return;

    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex < animations.length) {
        const animName = animations[currentIndex];
        this.playAnimation(animName);

        // Utiliser la durée de l'animation pour savoir quand elle se termine
        const action = this.animations[animName];
        if (action) {
          const clip = action.getClip();
          const duration = clip.duration / this.animationParams.animationSpeed;

          // Attendre la fin de l'animation
          setTimeout(() => {
            currentIndex++;
            if (currentIndex >= animations.length && loop) {
              currentIndex = 0;
            }
            playNext();
          }, duration * 1000); // Convertir en millisecondes
        }
      }
    };

    playNext();
  }

  // Alternative avec une méthode plus simple pour les séquences
  public async playAnimationSequenceAsync(
    animations: string[],
    loop: boolean = false
  ): Promise<void> {
    if (animations.length === 0) return;

    do {
      for (const animName of animations) {
        await this.playAnimationAndWait(animName);
      }
    } while (loop);
  }

  private playAnimationAndWait(animationName: string): Promise<void> {
    return new Promise((resolve) => {
      this.playAnimation(animationName);

      const action = this.animations[animationName];
      if (action) {
        const clip = action.getClip();
        const duration = clip.duration / this.animationParams.animationSpeed;

        setTimeout(() => {
          resolve();
        }, duration * 1000);
      } else {
        resolve();
      }
    });
  }

  // IMPORTANT: Mettre à jour le mixer et les mouvements
  public update(deltaTime: number): void {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    // Machine à états pour le mouvement
    if (this.movementState !== MovementState.IDLE && this.model) {
      const elapsed = (Date.now() - this.moveStartTime) / 1000;

      switch (this.movementState) {
        case MovementState.TURNING_TO_TARGET:
          if (elapsed >= this.turnDuration) {
            // Rotation terminée, commencer le mouvement
            this.model.rotation.y = this.targetRotation;
            this.startMoving();
          } else {
            // Interpolation linéaire de la rotation
            const t = elapsed / this.turnDuration;
            this.model.rotation.y = this.interpolateAngle(
              this.currentRotation,
              this.targetRotation,
              t
            );
          }
          break;

        case MovementState.MOVING:
          if (elapsed >= this.moveDuration) {
            // Mouvement terminé, se tourner vers la rotation finale
            this.model.position.x = this.targetPosition.x;
            this.model.position.z = this.targetPosition.z;
            this.startTurningToFinal();
          } else {
            // Mouvement linéaire (vitesse constante)
            const t = elapsed / this.moveDuration;
            this.model.position.x = THREE.MathUtils.lerp(
              this.startPosition.x,
              this.targetPosition.x,
              t
            );
            this.model.position.z = THREE.MathUtils.lerp(
              this.startPosition.z,
              this.targetPosition.z,
              t
            );
          }
          break;

        case MovementState.TURNING_TO_FINAL:
          if (elapsed >= this.turnDuration) {
            // Rotation finale terminée
            this.model.rotation.y = this.finalRotation;
            this.finishMovement();
          } else {
            // Interpolation linéaire de la rotation finale
            const t = elapsed / this.turnDuration;
            this.model.rotation.y = this.interpolateAngle(
              this.currentRotation,
              this.finalRotation,
              t
            );
          }
          break;
      }
    }
  }

  // Nettoyage
  public dispose(): void {
    super.dispose();

    if (this.mixer) {
      this.mixer.stopAllAction();
    }
  }
}
