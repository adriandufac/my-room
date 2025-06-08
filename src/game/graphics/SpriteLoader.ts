import { SpriteRenderer, type SpriteConfig } from "./SpriteRenderer";

export class SpriteLoader {
  private static instance: SpriteLoader;
  private cache: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  private constructor() {}

  public static getInstance(): SpriteLoader {
    if (!SpriteLoader.instance) {
      SpriteLoader.instance = new SpriteLoader();
    }
    return SpriteLoader.instance;
  }

  public async loadImage(path: string): Promise<HTMLImageElement> {
    // Check if already cached
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path)!;
    }

    // Start loading
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.cache.set(path, img);
        this.loadingPromises.delete(path);
        console.log(`[SPRITE_LOADER] Loaded: ${path}`);
        resolve(img);
      };

      img.onerror = () => {
        this.loadingPromises.delete(path);
        const error = new Error(`Failed to load image: ${path}`);
        console.error(`[ERROR] ${error.message}`);
        reject(error);
      };

      img.src = path;
    });

    this.loadingPromises.set(path, loadPromise);
    return loadPromise;
  }

  public createSpriteRenderer(config: SpriteConfig): SpriteRenderer {
    return new SpriteRenderer(config);
  }

  public async preloadSprites(paths: string[]): Promise<void> {
    console.log(`[SPRITE_LOADER] Preloading ${paths.length} sprites...`);

    const loadPromises = paths.map((path) => this.loadImage(path));

    try {
      await Promise.all(loadPromises);
      console.log(`[SPRITE_LOADER] Successfully preloaded all sprites`);
    } catch (error) {
      console.error(`[ERROR] Failed to preload some sprites:`, error);
      throw error;
    }
  }

  public getCachedImage(path: string): HTMLImageElement | null {
    return this.cache.get(path) || null;
  }

  public isImageLoaded(path: string): boolean {
    return this.cache.has(path);
  }

  public clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
    console.log(`[SPRITE_LOADER] Cache cleared`);
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public getLoadingCount(): number {
    return this.loadingPromises.size;
  }

  public getCacheStatus(): { cached: number; loading: number } {
    return {
      cached: this.getCacheSize(),
      loading: this.getLoadingCount(),
    };
  }
}
