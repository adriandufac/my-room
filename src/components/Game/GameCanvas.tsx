import React, { useEffect, useRef } from "react";
import { Game } from "../../game/core/Game";

interface GameCanvasProps {
  width?: number;
  height?: number;
  showDebug?: boolean;
  onGameReady?: (game: Game) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  width = 1200,
  height = 600,
  showDebug = false,
  onGameReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // VRAIS imports de VOS classes !
      const game = new Game(canvasRef.current);
      gameRef.current = game;

      // Démarrer le jeu
      game.start();

      // Callback
      if (onGameReady) {
        onGameReady(game);
      }

      console.log("Jeu initialisé avec VOS classes !");
    } catch (error) {
      console.error("Erreur lors de l'initialisation du jeu:", error);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, [width, height, showDebug, onGameReady]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: "2px solid #333",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          borderRadius: "4px",
        }}
      />
    </div>
  );
};
