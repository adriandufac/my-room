// src/game/entities/FallingPlatform.ts

import { Vector2D } from "../physics/Vector2D";
import { Platform } from "./Platform";
import { GAME_CONFIG } from "../utils/Constants";

export class FallingPlatform extends Platform {
  private hasPlayerContact: boolean = false;
  private fallTimer: number = 0;
  private readonly fallDelay: number = 0.1; // 0.1 seconds before falling
  private isFalling: boolean = false;
  private isDestroyed: boolean = false;
  private fallSpeed: number = 0;
  private shakeOffset: Vector2D = new Vector2D(0, 0);
  private shakeIntensity: number = 0;
  
  // Respawn system
  private respawnTimer: number = 0;
  private readonly respawnDelay: number = 2.0; // 2 seconds to respawn
  private originalPosition: Vector2D;
  private isRespawning: boolean = false;

  constructor(x: number, y: number, width?: number, height?: number) {
    super(x, y, width, height);
    // Falling platforms have a slightly different color to distinguish them
    this.color = "#FF6B4A"; // Orange-red color
    
    // Store original position for respawn
    this.originalPosition = new Vector2D(x, y);
  }

  public update(deltaTime: number): void {
    // Handle respawn timer when destroyed
    if (this.isDestroyed) {
      this.respawnTimer += deltaTime;
      
      // Start respawn process
      if (this.respawnTimer >= this.respawnDelay && !this.isRespawning) {
        this.startRespawn();
      }
      
      return;
    }

    // If player has made contact, start the fall timer
    if (this.hasPlayerContact && !this.isFalling) {
      this.fallTimer += deltaTime;
      
      // Add shake effect as it's about to fall
      if (this.fallTimer > this.fallDelay * 0.5) {
        this.shakeIntensity = Math.min(3, (this.fallTimer - this.fallDelay * 0.5) / (this.fallDelay * 0.5) * 3);
        this.shakeOffset.x = (Math.random() - 0.5) * this.shakeIntensity;
        this.shakeOffset.y = (Math.random() - 0.5) * this.shakeIntensity;
      }

      // Start falling after delay
      if (this.fallTimer >= this.fallDelay) {
        this.startFalling();
      }
    }

    // If falling, accelerate downward
    if (this.isFalling) {
      this.fallSpeed += GAME_CONFIG.PHYSICS.GRAVITY * deltaTime * 2; // Fall faster than normal gravity
      this.position.y += this.fallSpeed * deltaTime;
      
      // Remove shake when falling
      this.shakeOffset.x = 0;
      this.shakeOffset.y = 0;
      
      // Destroy if fallen too far
      if (this.position.y > GAME_CONFIG.LEVEL.DEFAULT_HEIGHT + 100) {
        this.isDestroyed = true;
        this.respawnTimer = 0; // Start respawn timer
        console.log(`[FALLING_PLATFORM] Platform ${this.id.slice(-8)} destroyed, will respawn in ${this.respawnDelay}s`);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.isDestroyed) {
      // Show respawn countdown if in debug mode
      if (GAME_CONFIG.DEBUG.SHOW_COLLISION_BOXES) {
        const timeLeft = this.respawnDelay - this.respawnTimer;
        if (timeLeft > 0) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillRect(
            this.originalPosition.x,
            this.originalPosition.y,
            this.size.x,
            20
          );
          ctx.fillStyle = "black";
          ctx.font = "14px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            `Respawn: ${timeLeft.toFixed(1)}s`,
            this.originalPosition.x + this.size.x / 2,
            this.originalPosition.y + 15
          );
          ctx.textAlign = "left";
        }
      }
      return;
    }

    // Apply shake offset
    const renderX = this.position.x + this.shakeOffset.x;
    const renderY = this.position.y + this.shakeOffset.y;

    // Render the platform with sprite or fallback
    if ((this as any).useSprite && (this as any).spriteLoaded && (this as any).spriteImage) {
      ctx.drawImage(
        (this as any).spriteImage,
        renderX,
        renderY,
        this.size.x,
        this.size.y
      );
    } else {
      // Fallback rendering with color indication of state
      let platformColor = this.color;
      
      // Change color based on state
      if (this.isFalling) {
        platformColor = "#FF0000"; // Bright red when falling
      } else if (this.hasPlayerContact) {
        // Flash red as timer counts down
        const flashIntensity = Math.sin(this.fallTimer * 20) * 0.5 + 0.5;
        platformColor = `rgba(255, ${Math.floor(107 * (1 - flashIntensity))}, ${Math.floor(74 * (1 - flashIntensity))}, 1)`;
      }
      
      ctx.fillStyle = platformColor;
      ctx.fillRect(renderX, renderY, this.size.x, this.size.y);

      // Border
      ctx.strokeStyle = "#CC4400";
      ctx.lineWidth = 2;
      ctx.strokeRect(renderX, renderY, this.size.x, this.size.y);
    }

    // Debug info
    if (GAME_CONFIG.DEBUG.SHOW_COLLISION_BOXES) {
      ctx.strokeStyle = "purple";
      ctx.lineWidth = 1;
      ctx.strokeRect(renderX, renderY, this.size.x, this.size.y);
      
      // Show timer
      if (this.hasPlayerContact && !this.isFalling) {
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(
          `${(this.fallDelay - this.fallTimer).toFixed(1)}s`,
          renderX + 5,
          renderY - 5
        );
      }
    }
  }

  public onPlayerContact(): void {
    if (!this.hasPlayerContact && !this.isFalling && !this.isDestroyed) {
      this.hasPlayerContact = true;
      this.fallTimer = 0;
      console.log(`[FALLING_PLATFORM] Player contacted platform ${this.id.slice(-8)}, starting fall timer`);
    }
  }

  private startFalling(): void {
    if (!this.isFalling) {
      this.isFalling = true;
      this.fallSpeed = 0;
      console.log(`[FALLING_PLATFORM] Platform ${this.id.slice(-8)} started falling`);
    }
  }

  private startRespawn(): void {
    this.isRespawning = true;
    console.log(`[FALLING_PLATFORM] Platform ${this.id.slice(-8)} respawning...`);
    
    // Reset all states
    this.isDestroyed = false;
    this.isFalling = false;
    this.hasPlayerContact = false;
    this.fallTimer = 0;
    this.fallSpeed = 0;
    this.respawnTimer = 0;
    this.isRespawning = false;
    this.shakeOffset.set(0, 0);
    this.shakeIntensity = 0;
    
    // Reset position
    this.position.set(this.originalPosition.x, this.originalPosition.y);
    
    console.log(`[FALLING_PLATFORM] Platform ${this.id.slice(-8)} respawned at original position`);
  }

  public getBounds(): { x: number; y: number; width: number; height: number } {
    if (this.isDestroyed) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    return {
      x: this.position.x + this.shakeOffset.x,
      y: this.position.y + this.shakeOffset.y,
      width: this.size.x,
      height: this.size.y,
    };
  }

  // Check if platform should still provide collision (not destroyed and not fallen too far)
  public canCollide(): boolean {
    return !this.isDestroyed;
  }

  // Check if platform is in falling state
  public getFallingState(): boolean {
    return this.isFalling;
  }

  // Get remaining time before fall
  public getRemainingTime(): number {
    if (!this.hasPlayerContact || this.isFalling) return -1;
    return Math.max(0, this.fallDelay - this.fallTimer);
  }

  // Reset platform state (useful for level restart)
  public reset(): void {
    this.hasPlayerContact = false;
    this.fallTimer = 0;
    this.isFalling = false;
    this.isDestroyed = false;
    this.fallSpeed = 0;
    this.shakeOffset.set(0, 0);
    this.shakeIntensity = 0;
    this.respawnTimer = 0;
    this.isRespawning = false;
    
    // Reset position to original
    this.position.set(this.originalPosition.x, this.originalPosition.y);
  }
}