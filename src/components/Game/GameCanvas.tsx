import React, { useEffect, useRef } from "react";
import { Game } from "../../game/core/Game";
import type { LevelData } from "../../game/utils/Types";

interface GameCanvasProps {
  width?: number;
  height?: number;
  showDebug?: boolean;
  onGameReady?: (game: Game) => void;
  levelToLoad?: LevelData | null;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  width = 1200,
  height = 600,
  showDebug = false,
  onGameReady,
  levelToLoad = null,
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

      // Charger le niveau personnalisé si fourni
      if (levelToLoad) {
        console.log(`🎮 Chargement du niveau: ${levelToLoad.name}`);
        game.loadCustomLevel(levelToLoad);
      }

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
  }, [width, height, showDebug, onGameReady, levelToLoad]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        height: "100vh",
        backgroundColor: "#222",
      }}
    >
      {/* Afficher le nom du niveau si on teste un niveau personnalisé */}
      {levelToLoad && (
        <div style={{ 
          color: "white", 
          fontSize: "18px", 
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "10px"
        }}>
          🎮 Test: {levelToLoad.name}
        </div>
      )}
      
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
      
      {showDebug && (
        <div style={{ color: "white", fontSize: "14px", marginTop: "10px" }}>
          Debug mode activé - Appuyez sur F1 pour plus d'options
        </div>
      )}
    </div>
  );
};
