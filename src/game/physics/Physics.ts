// src/game/physics/Physics.ts

import { Vector2D } from "./Vector2D";
import { GAME_CONFIG } from "../utils/Constants";

export interface PhysicsBody {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  mass: number;
  gravityScale: number;
  isStatic: boolean;
  onGround: boolean;
}

export class Physics {
  private static readonly GRAVITY = new Vector2D(
    0,
    GAME_CONFIG.PHYSICS.GRAVITY
  );
  private static readonly TERMINAL_VELOCITY =
    GAME_CONFIG.PHYSICS.TERMINAL_VELOCITY;
  private static readonly AIR_RESISTANCE = GAME_CONFIG.PHYSICS.AIR_RESISTANCE;

  // Applique les forces physiques à un corps
  static applyPhysics(body: PhysicsBody, deltaTime: number): void {
    if (body.isStatic) return;

    // Application de la gravité
    if (body.gravityScale > 0) {
      const gravityForce = Physics.GRAVITY.multiply(body.gravityScale);
      body.acceleration.addMutable(gravityForce);
    }

    // Application de la résistance de l'air (simple)
    if (Physics.AIR_RESISTANCE > 0) {
      const airResistance = body.velocity.multiply(-Physics.AIR_RESISTANCE);
      body.acceleration.addMutable(airResistance);
    }

    // Intégration de Verlet simplifiée
    // v = v + a * dt
    const accelerationDelta = body.acceleration.multiply(deltaTime);
    body.velocity.addMutable(accelerationDelta);

    // Limitation de la vitesse terminale
    if (body.velocity.y > Physics.TERMINAL_VELOCITY) {
      body.velocity.y = Physics.TERMINAL_VELOCITY;
    }

    // p = p + v * dt
    const velocityDelta = body.velocity.multiply(deltaTime);
    body.position.addMutable(velocityDelta);

    // Remise à zéro de l'accélération pour la prochaine frame
    body.acceleration.zero();
  }

  // Applique une force instantanée (comme un saut)
  static applyImpulse(body: PhysicsBody, impulse: Vector2D): void {
    if (body.isStatic) return;

    // F = ma, donc a = F/m
    const acceleration = impulse.divide(body.mass);
    body.velocity.addMutable(acceleration);
  }

  // Applique une force continue (comme le mouvement du joueur)
  static applyForce(body: PhysicsBody, force: Vector2D): void {
    if (body.isStatic) return;

    // F = ma, donc a = F/m
    const acceleration = force.divide(body.mass);
    body.acceleration.addMutable(acceleration);
  }

  // Crée un corps physique avec des valeurs par défaut
  static createBody(
    position: Vector2D,
    options: Partial<PhysicsBody> = {}
  ): PhysicsBody {
    return {
      position: position.clone(),
      velocity: new Vector2D(0, 0),
      acceleration: new Vector2D(0, 0),
      mass: 1,
      gravityScale: 1,
      isStatic: false,
      onGround: false,
      ...options,
    };
  }

  // Calcule la distance entre deux corps
  static distance(bodyA: PhysicsBody, bodyB: PhysicsBody): number {
    return bodyA.position.distanceTo(bodyB.position);
  }

  // Applique un amortissement à la vélocité (utile pour les frottements)
  static applyDamping(body: PhysicsBody, damping: number): void {
    if (body.isStatic) return;

    body.velocity.multiplyMutable(1 - damping);
  }

  // Stoppe le mouvement d'un corps
  static stopMovement(body: PhysicsBody): void {
    body.velocity.zero();
    body.acceleration.zero();
  }

  // Téléporte un corps à une nouvelle position
  static teleport(body: PhysicsBody, newPosition: Vector2D): void {
    body.position.set(newPosition.x, newPosition.y);
    body.velocity.zero();
    body.acceleration.zero();
  }

  // Calcule l'énergie cinétique d'un corps
  static kineticEnergy(body: PhysicsBody): number {
    const speed = body.velocity.magnitude();
    return 0.5 * body.mass * speed * speed;
  }

  // Vérifie si un corps est au repos
  static isAtRest(body: PhysicsBody, threshold: number = 0.1): boolean {
    return body.velocity.magnitude() < threshold;
  }
}
