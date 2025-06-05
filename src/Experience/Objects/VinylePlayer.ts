import FurnitureItem, { type FurnitureConfig } from "./FurnitureItem";
import * as THREE from "three";

export default class VinylePlayer extends FurnitureItem {
  private isPlaying: boolean = false;
  private currentAudio: HTMLAudioElement | null = null; // ✅ AJOUT : Audio element
  private currentTrackIndex: number = 0; // ✅ AJOUT : Index du track
  private vinylStartSFX!: HTMLAudioElement;
  private vinylEndSFX!: HTMLAudioElement;

  private lofiTracks = [
    { name: "Rainy Afternoon", file: "/audio/lofi1.mp3" },
    { name: "Study Session", file: "/audio/lofi2.mp3" },
    { name: "Coffee Break", file: "/audio/lofi3.mp3" },
  ];

  constructor() {
    const config: FurnitureConfig = {
      name: "Vinyle Player",
      modelPath: "/models/vinylePlayer/scene.gltf",
      defaultParams: {
        positionX: -0.5,
        positionY: 1.72,
        positionZ: -3.6,
        rotation: 0,
        scale: 0.0035,
      },
      guiRanges: {
        scale: [0.001, 0.004, 0.0005],
      },
      hoverable: true,
      clickable: true,
      clickType: "vinyle-player", // Identifiant pour les événements
    };

    super(config);
    this.initAudio();

    this.listenToEvent("uiMusicToggle", this.onUIToggle.bind(this));
  }

  private initAudio(): void {
    this.currentAudio = new Audio();
    this.currentAudio.volume = 0.5;
    this.currentAudio.loop = false;

    this.vinylStartSFX = new Audio("/audio/vinyl-start.mp3");
    this.vinylEndSFX = new Audio("/audio/vinyl-end.mp3");

    this.vinylStartSFX.volume = 0.4;
    this.vinylEndSFX.volume = 0.4;

    // Charger le premier track
    this.loadTrack(this.currentTrackIndex);

    this.currentAudio.addEventListener("ended", () => {
      this.nextTrack();
    });
  }

  private loadTrack(index: number): void {
    if (this.currentAudio) {
      this.currentAudio.src = this.lofiTracks[index].file;
      console.log(`🎵 Loaded: ${this.lofiTracks[index].name}`);
    }
  }

  private nextTrack(): void {
    this.currentTrackIndex =
      (this.currentTrackIndex + 1) % this.lofiTracks.length;
    this.loadTrack(this.currentTrackIndex);

    if (this.isPlaying) {
      this.playAudio();
    }
  }

  protected onModelSetup(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // ✅ Cibler spécifiquement la vitre
        if (child.name === "Cube005_Glass_0") {
          console.log(`🎯 Applying glass material to: ${child.name}`);

          const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15, // Très transparent comme une vraie vitre
            transmission: 0.95, // Transmission élevée
            roughness: 0.02, // Très lisse
            metalness: 0.0,
            ior: 1.5, // Indice de réfraction du verre
            thickness: 0.01,
          });

          child.material = glassMaterial;
        }
      }
    });
  }

  protected onClick(intersect: THREE.Intersection): void {
    console.log("vinyle player clicked!");
    this.toggleVinyle();
  }

  public toggleVinyle(): void {
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.playAudio();
    } else {
      this.pauseAudio();
    }
  }
  private playAudio(): void {
    console.log("🎵 Starting vinyl playback...");

    // ✅ Jouer l'effet de démarrage en premier
    this.vinylStartSFX
      .play()
      .then(() => {
        console.log("🔊 Vinyl start sound played");

        // ✅ Attendre un peu puis lancer la musique
        setTimeout(() => {
          if (this.currentAudio && this.isPlaying) {
            this.currentAudio
              .play()
              .then(() => {
                console.log(
                  `🎵 Now playing: ${
                    this.lofiTracks[this.currentTrackIndex].name
                  }`
                );
              })
              .catch((error) => {
                console.error("Error playing music:", error);
              });
          }
        }, 800); // Délai de 800ms pour que l'effet se termine
      })
      .catch((error) => {
        console.error("Error playing vinyl start sound:", error);
        // Si l'effet échoue, jouer quand même la musique
        if (this.currentAudio) {
          this.currentAudio.play();
        }
      });
  }
  private pauseAudio(): void {
    console.log("⏹️ Stopping vinyl playback...");

    // ✅ Jouer l'effet d'arrêt
    this.vinylEndSFX
      .play()
      .then(() => {
        console.log("🔊 Vinyl end sound played");
      })
      .catch((error) => {
        console.error("Error playing vinyl end sound:", error);
      });

    // ✅ Arrêter la musique immédiatement
    if (this.currentAudio) {
      this.currentAudio.pause();
      console.log("🎵 Music stopped");
    }
  }

  private getCurrentTrack() {
    return this.lofiTracks[this.currentTrackIndex];
  }

  private onUIToggle(event: CustomEvent): void {
    const { isPlaying } = event.detail;
    this.setPlayingState(isPlaying);
  }

  public setPlayingState(isPlaying: boolean): void {
    this.isPlaying = isPlaying;
  }

  public getPlayingState(): boolean {
    return this.isPlaying;
  }
  public dispose(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = "";
      this.currentAudio = null;
    }
    if (this.vinylStartSFX) {
      this.vinylStartSFX.src = "";
    }
    if (this.vinylEndSFX) {
      this.vinylEndSFX.src = "";
    }
    super.dispose();
  }
}
