// src/game/entities/UppingPlatform.ts

import { Vector2D } from "../physics/Vector2D";
import { Platform } from "./Platform";
import { GAME_CONFIG } from "../utils/Constants";

export class UppingPlatform extends Platform {
  private hasPlayerContact: boolean = false;
  private moveTimer: number = 0;
  private readonly moveDelay: number = 0.1; // 0.1 seconds before moving up
  private isMoving: boolean = false;
  private moveSpeed: number = 0;
  private readonly maxMoveSpeed: number = 300; // Pixels per second upward (faster trap)
  private readonly acceleration: number = 1000; // Very fast acceleration upward
  private originalPosition: Vector2D;
  private isDestroyed: boolean = false;

  // Respawn system (like falling platforms)
  private respawnTimer: number = 0;
  private readonly respawnDelay: number = 2.0; // 2 seconds to respawn

  constructor(x: number, y: number, width?: number, height?: number) {
    super(x, y, width, height);
    // Upping platforms have a blue color to distinguish them
    this.color = "#4A90E2"; // Blue color
    
    // Store original position for reset
    this.originalPosition = new Vector2D(x, y);
  }

  public update(deltaTime: number): void {
    // Handle respawn timer when destroyed
    if (this.isDestroyed) {
      this.respawnTimer += deltaTime;
      
      // Start respawn process
      if (this.respawnTimer >= this.respawnDelay) {
        this.startRespawn();
      }
      
      return;
    }

    // If player has made contact, start the move timer
    if (this.hasPlayerContact && !this.isMoving) {
      this.moveTimer += deltaTime;

      // Start moving after delay
      if (this.moveTimer >= this.moveDelay) {
        this.startMoving();
      }
    }

    // If moving, accelerate upward and continue until out of bounds
    if (this.isMoving) {
      this.moveSpeed += this.acceleration * deltaTime;
      this.moveSpeed = Math.min(this.moveSpeed, this.maxMoveSpeed);
      
      this.position.y -= this.moveSpeed * deltaTime;
      
      // Destroy if moved too far up (out of level bounds)
      if (this.position.y < -100) {
        this.isDestroyed = true;
        this.respawnTimer = 0; // Start respawn timer
        console.log(`[UPPING_PLATFORM] Platform ${this.id.slice(-8)} destroyed after moving out of bounds, will respawn in ${this.respawnDelay}s`);
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

    // Render the platform with sprite or fallback
    if ((this as any).useSprite && (this as any).spriteLoaded && (this as any).spriteImage) {
      ctx.drawImage(
        (this as any).spriteImage,
        this.position.x,
        this.position.y,
        this.size.x,
        this.size.y
      );
    } else {
      // Fallback rendering with color indication of state
      let platformColor = this.color;
      
      // Change color based on state
      if (this.isMoving) {
        platformColor = "#66B2FF"; // Brighter blue when moving
      } else if (this.hasPlayerContact) {
        // Flash blue as timer counts down
        const flashIntensity = Math.sin(this.moveTimer * 30) * 0.5 + 0.5;
        platformColor = `rgba(74, ${Math.floor(144 + 50 * flashIntensity)}, 226, 1)`;
      }
      
      ctx.fillStyle = platformColor;
      ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);

      // Border
      ctx.strokeStyle = "#2266BB";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }

    // Debug info
    if (GAME_CONFIG.DEBUG.SHOW_COLLISION_BOXES) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 1;
      ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);
      
      // Show timer and state
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      let statusText = "";
      
      if (this.hasPlayerContact && !this.isMoving) {
        statusText = `Move: ${(this.moveDelay - this.moveTimer).toFixed(1)}s`;
      } else if (this.isMoving) {
        statusText = "Moving Up (TRAP)";
      }
      
      if (statusText) {
        ctx.fillText(statusText, this.position.x + 5, this.position.y - 5);
      }
    }
  }

  public onPlayerContact(): void {
    if (!this.hasPlayerContact && !this.isMoving && !this.isDestroyed) {
      this.hasPlayerContact = true;
      this.moveTimer = 0;
      console.log(`[UPPING_PLATFORM] Player contacted platform ${this.id.slice(-8)}, starting move timer`);
    }
  }

  private startMoving(): void {
    if (!this.isMoving) {
      this.isMoving = true;
      this.moveSpeed = 0;
      console.log(`[UPPING_PLATFORM] Platform ${this.id.slice(-8)} started moving up (TRAP ACTIVATED)`);
    }
  }

  private startRespawn(): void {
    console.log(`[UPPING_PLATFORM] Platform ${this.id.slice(-8)} respawning...`);
    
    // Reset all states
    this.isDestroyed = false;
    this.isMoving = false;
    this.hasPlayerContact = false;
    this.moveTimer = 0;
    this.moveSpeed = 0;
    this.respawnTimer = 0;
    
    // Reset position
    this.position.set(this.originalPosition.x, this.originalPosition.y);
    
    console.log(`[UPPING_PLATFORM] Platform ${this.id.slice(-8)} respawned at original position`);
  }

  public getBounds(): { x: number; y: number; width: number; height: number } {
    if (this.isDestroyed) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.size.x,
      height: this.size.y,
    };
  }

  // Check if platform can still provide collision
  public canCollide(): boolean {
    return !this.isDestroyed;
  }

  // Check if platform is in moving state
  public getMovingState(): boolean {
    return this.isMoving;
  }

  // Get remaining time before move
  public getRemainingMoveTime(): number {
    if (!this.hasPlayerContact || this.isMoving || this.isDestroyed) return -1;
    return Math.max(0, this.moveDelay - this.moveTimer);
  }

  // Reset platform state (useful for level restart)
  public reset(): void {
    this.hasPlayerContact = false;
    this.moveTimer = 0;
    this.isMoving = false;
    this.isDestroyed = false;
    this.moveSpeed = 0;
    this.respawnTimer = 0;
    
    // Reset position to original
    this.position.set(this.originalPosition.x, this.originalPosition.y);
  }
}