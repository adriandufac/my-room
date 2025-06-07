import React, { useRef, useEffect, useState } from "react";
import { Game } from "../../game/core/Game";

interface GameCanvasProps {
  width?: number;
  height?: number;
  showDebug?: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  width = 1200,
  height = 600,
  showDebug = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [gameStats, setGameStats] = useState({
    fps: 0,
    deltaTime: 0,
    isRunning: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Créer une nouvelle instance du jeu
    const game = new Game(canvas);
    gameRef.current = game;

    if (showDebug) {
      console.log("✅ Canvas initialisé avec succès");
      console.log(`✅ Dimensions: ${width}x${height}`);
      console.log("✅ Contexte 2D obtenu");
      console.log("✅ Moteur de jeu créé");
    }

    // Démarrer le jeu automatiquement
    game.start();

    // Mettre à jour les stats toutes les 100ms
    const statsInterval = setInterval(() => {
      if (gameRef.current) {
        setGameStats(gameRef.current.getStats());
      }
    }, 100);

    // Nettoyage
    return () => {
      clearInterval(statsInterval);
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, [width, height, showDebug]);

  const handleToggleGame = () => {
    if (gameRef.current) {
      gameRef.current.toggle();
    }
  };

  return (
    <div className="game-canvas-container">
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <button
          onClick={handleToggleGame}
          style={{
            padding: "10px 20px",
            backgroundColor: gameStats.isRunning ? "#dc3545" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {gameStats.isRunning ? "⏸️ Pause" : "▶️ Play"}
        </button>

        {showDebug && (
          <div style={{ marginTop: "10px", fontSize: "14px" }}>
            <span style={{ marginRight: "20px" }}>🎯 FPS: {gameStats.fps}</span>
            <span style={{ marginRight: "20px" }}>
              ⏱️ Delta: {(gameStats.deltaTime * 1000).toFixed(1)}ms
            </span>
            <span>🔄 État: {gameStats.isRunning ? "En cours" : "Arrêté"}</span>
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: "2px solid #333",
          display: "block",
          margin: "0 auto",
          backgroundColor: "#f0f0f0",
        }}
      />

      <div style={{ textAlign: "center", marginTop: "10px", fontSize: "14px" }}>
        Canvas de jeu - {width}x{height}px
        {showDebug && (
          <span style={{ color: "#007bff", marginLeft: "10px" }}>
            (Mode Debug)
          </span>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;
