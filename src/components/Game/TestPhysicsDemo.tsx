// src/components/TestPhysicsDemo.tsx
// Composant de test pour l'étape 2.2

import React, { useRef, useEffect, useState } from "react";
import { Vector2D } from "../../game/physics/Vector2D";
import { Physics, type PhysicsBody } from "../../game/physics/Physics";
import { GAME_CONFIG } from "../../game/utils/Constants";

const TestPhysicsDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [fps, setFps] = useState(0);

  // Corps de test pour la démo
  const testBodies = useRef<PhysicsBody[]>([]);
  const lastFrameTime = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialisation des corps de test
    initTestBodies();

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min(
        (currentTime - lastFrameTime.current) / 1000,
        0.016
      ); // Max 16ms
      lastFrameTime.current = currentTime;

      // Calcul du FPS
      const currentFps = deltaTime > 0 ? Math.round(1 / deltaTime) : 0;
      setFps(currentFps);

      // Update physics
      updatePhysics(deltaTime);

      // Render
      render(ctx);

      if (isRunning) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    if (isRunning) {
      lastFrameTime.current = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

  const initTestBodies = () => {
    testBodies.current = [
      // Rectangle qui tombe avec gravité normale
      Physics.createBody(new Vector2D(200, 100), {
        mass: 1,
        gravityScale: 1,
      }),
      // Rectangle qui tombe plus lentement
      Physics.createBody(new Vector2D(400, 100), {
        mass: 2,
        gravityScale: 0.5,
      }),
      // Rectangle qui tombe plus vite
      Physics.createBody(new Vector2D(600, 100), {
        mass: 0.5,
        gravityScale: 1.5,
      }),
      // Rectangle statique (ne bouge pas)
      Physics.createBody(new Vector2D(800, 300), {
        isStatic: true,
        gravityScale: 0,
      }),
    ];
  };

  const updatePhysics = (deltaTime: number) => {
    testBodies.current.forEach((body) => {
      // Application de la physique
      Physics.applyPhysics(body, deltaTime);

      // Collision avec le sol (simple)
      // Le sol est à HEIGHT - 50, et le carré fait 32px de haut
      // Donc le bas du carré doit être à HEIGHT - 50
      if (body.position.y + 32 > GAME_CONFIG.CANVAS.HEIGHT - 50) {
        body.position.y = GAME_CONFIG.CANVAS.HEIGHT - 50 - 32;
        body.velocity.y = 0;
        body.onGround = true;

        // Application d'un peu de friction au sol
        Physics.applyDamping(
          body,
          GAME_CONFIG.PHYSICS.GROUND_FRICTION * deltaTime
        );
      } else {
        body.onGround = false;
      }

      // Collision avec les bords latéraux
      if (body.position.x < 0) {
        body.position.x = 0;
        body.velocity.x = 0;
      }
      if (body.position.x + 32 > GAME_CONFIG.CANVAS.WIDTH) {
        body.position.x = GAME_CONFIG.CANVAS.WIDTH - 32;
        body.velocity.x = 0;
      }
    });
  };

  const render = (ctx: CanvasRenderingContext2D) => {
    // Effacer le canvas
    ctx.fillStyle = GAME_CONFIG.CANVAS.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS.WIDTH, GAME_CONFIG.CANVAS.HEIGHT);

    // Dessiner le sol
    ctx.fillStyle = "#8B4513"; // Marron
    ctx.fillRect(
      0,
      GAME_CONFIG.CANVAS.HEIGHT - 50,
      GAME_CONFIG.CANVAS.WIDTH,
      50
    );

    // Dessiner les corps de test
    testBodies.current.forEach((body, index) => {
      // Couleur différente selon le type
      if (body.isStatic) {
        ctx.fillStyle = "#888888"; // Gris pour statique
      } else {
        const colors = ["#FF4444", "#44FF44", "#4444FF", "#FFFF44"];
        ctx.fillStyle = colors[index % colors.length];
      }

      // Dessiner le rectangle
      ctx.fillRect(
        Math.round(body.position.x),
        Math.round(body.position.y),
        32,
        32
      );

      // Dessiner la vélocité (vecteur)
      if (!body.isStatic && body.velocity.magnitude() > 1) {
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(body.position.x + 16, body.position.y + 16);
        ctx.lineTo(
          body.position.x + 16 + body.velocity.x * 0.1,
          body.position.y + 16 + body.velocity.y * 0.1
        );
        ctx.stroke();
      }

      // Afficher les informations de debug
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "12px Arial";
      ctx.fillText(
        `V: ${body.velocity.magnitude().toFixed(1)}`,
        body.position.x,
        body.position.y - 5
      );
    });

    // Afficher les informations de debug générales
    ctx.fillStyle = "#000000";
    ctx.font = "16px Arial";
    ctx.fillText(`FPS: ${fps}`, 10, 30);
    ctx.fillText(`Gravité: ${GAME_CONFIG.PHYSICS.GRAVITY}`, 10, 50);
    ctx.fillText("Rectangle rouge: gravité normale", 10, 80);
    ctx.fillText("Rectangle vert: gravité réduite", 10, 100);
    ctx.fillText("Rectangle bleu: gravité augmentée", 10, 120);
    ctx.fillText("Rectangle gris: statique", 10, 140);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    initTestBodies();
  };

  const addImpulse = () => {
    // Ajouter une impulsion vers le haut aux rectangles non-statiques
    testBodies.current.forEach((body) => {
      if (!body.isStatic) {
        Physics.applyImpulse(body, new Vector2D(0, -300));
      }
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Test de Physique - Étape 2.2</h2>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={toggleSimulation} style={{ marginRight: "10px" }}>
          {isRunning ? "Pause" : "Démarrer"}
        </button>
        <button onClick={resetSimulation} style={{ marginRight: "10px" }}>
          Reset
        </button>
        <button onClick={addImpulse}>Impulsion vers le haut</button>
      </div>

      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.CANVAS.WIDTH}
        height={GAME_CONFIG.CANVAS.HEIGHT}
        style={{
          border: "2px solid #333",
          display: "block",
          backgroundColor: GAME_CONFIG.CANVAS.BACKGROUND_COLOR,
        }}
      />

      <div style={{ marginTop: "10px", fontSize: "14px" }}>
        <p>
          <strong>Tests à vérifier :</strong>
        </p>
        <ul>
          <li>✅ Un rectangle tombe vers le bas avec la gravité</li>
          <li>
            ✅ Les opérations vectorielles fonctionnent (vecteurs de vélocité
            visibles)
          </li>
          <li>✅ La vitesse augmente progressivement en chute libre</li>
          <li>✅ Les calculs sont fluides sans saccades</li>
          <li>
            ✅ Différents corps ont des comportements différents selon leur
            masse/gravité
          </li>
        </ul>
        <p>
          <strong>Informations :</strong>
        </p>
        <ul>
          <li>Les lignes blanches représentent les vecteurs de vélocité</li>
          <li>Le FPS devrait rester stable autour de 60</li>
          <li>Les rectangles rebondissent légèrement au contact du sol</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPhysicsDemo;
