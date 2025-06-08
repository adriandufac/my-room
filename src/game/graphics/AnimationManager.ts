import type { AnimationState } from "./SpriteTypes";

// Re-export type
export type { AnimationState } from "./SpriteTypes";

export class AnimationManager {
  private states: Map<string, AnimationState> = new Map();
  private currentState: string = "";
  private defaultState: string = "";

  public addState(state: AnimationState): void {
    this.states.set(state.name, state);
    console.log(
      `[ANIMATION] Added state: ${state.name} (priority: ${state.priority})`
    );
  }

  public setDefaultState(stateName: string): void {
    if (!this.states.has(stateName)) {
      console.warn(`[WARNING] Default state '${stateName}' not found`);
      return;
    }
    this.defaultState = stateName;
    if (!this.currentState) {
      this.currentState = stateName;
    }
  }

  public getCurrentState(): string {
    return this.currentState;
  }

  public update(): string {
    let bestState = this.defaultState;
    let highestPriority = -1;

    // Find the highest priority state whose conditions are met
    for (const [name, state] of this.states) {
      if (state.priority > highestPriority) {
        if (!state.conditions || state.conditions()) {
          bestState = name;
          highestPriority = state.priority;
        }
      }
    }

    // Only change if different
    if (bestState !== this.currentState) {
      const previousState = this.currentState;
      this.currentState = bestState;
      console.log(`[ANIMATION] State changed: ${previousState} → ${bestState}`);
    }

    return this.currentState;
  }

  public forceState(stateName: string): void {
    if (!this.states.has(stateName)) {
      console.warn(`[WARNING] Cannot force unknown state: ${stateName}`);
      return;
    }
    this.currentState = stateName;
    console.log(`[ANIMATION] Forced state: ${stateName}`);
  }

  public getStates(): string[] {
    return Array.from(this.states.keys());
  }

  public hasState(stateName: string): boolean {
    return this.states.has(stateName);
  }

  public removeState(stateName: string): void {
    this.states.delete(stateName);
    if (this.currentState === stateName) {
      this.currentState = this.defaultState;
    }
    if (this.defaultState === stateName) {
      this.defaultState = "";
    }
  }

  public clear(): void {
    this.states.clear();
    this.currentState = "";
    this.defaultState = "";
  }
}
