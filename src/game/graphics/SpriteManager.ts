import { SpriteRenderer } from "./SpriteRenderer";
import { SPRITE_CONFIGS } from "./SpriteConfigs";

export class SpriteManager {
  private renderers: Map<string, SpriteRenderer> = new Map();
  private currentState: string = "";
  private currentRenderer: SpriteRenderer | null = null;

  constructor(entityType: string) {
    this.loadSpritesForEntity(entityType);
  }

  private loadSpritesForEntity(entityType: string): void {
    // Load all sprite configs for this entity (player_idle, player_run, etc.)
    Object.keys(SPRITE_CONFIGS).forEach((configKey) => {
      if (configKey.startsWith(entityType + "_")) {
        const config = SPRITE_CONFIGS[configKey];
        const renderer = new SpriteRenderer(config);

        // Extract state name (player_run -> run)
        const stateName = configKey.replace(entityType + "_", "");
        this.renderers.set(stateName, renderer);

        console.log(
          `[SPRITE_MANAGER] Loaded ${configKey} for state: ${stateName}`
        );
      }
    });
  }

  public setState(stateName: string): boolean {
    if (!this.renderers.has(stateName)) {
      console.warn(`[SPRITE_MANAGER] State '${stateName}' not found`);
      return false;
    }

    if (this.currentState !== stateName) {
      this.currentState = stateName;
      this.currentRenderer = this.renderers.get(stateName)!;

      // Start the animation for this state
      const animationName = stateName; // Animation name matches state name
      this.currentRenderer.setAnimation(animationName);

      console.log(`[SPRITE_MANAGER] Changed to state: ${stateName}`);
      return true;
    }
    return false;
  }

  public getCurrentState(): string {
    return this.currentState;
  }

  public update(deltaTime: number): void {
    if (this.currentRenderer) {
      this.currentRenderer.update(deltaTime);
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    if (this.currentRenderer && this.currentRenderer.isLoaded()) {
      this.currentRenderer.render(ctx, x, y, width, height);
    }
  }

  public renderDebug(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    if (this.currentRenderer) {
      this.currentRenderer.renderDebug(ctx, x, y, width, height);
    }
  }

  public isCurrentStateLoaded(): boolean {
    return this.currentRenderer ? this.currentRenderer.isLoaded() : false;
  }

  public getAvailableStates(): string[] {
    return Array.from(this.renderers.keys());
  }

  public isStateLoaded(stateName: string): boolean {
    const renderer = this.renderers.get(stateName);
    return renderer ? renderer.isLoaded() : false;
  }

  public getAllLoadedStates(): string[] {
    return Array.from(this.renderers.entries())
      .filter(([_, renderer]) => renderer.isLoaded())
      .map(([state, _]) => state);
  }

  public dispose(): void {
    this.renderers.forEach((renderer) => renderer.dispose());
    this.renderers.clear();
    this.currentRenderer = null;
    this.currentState = "";
  }
}
