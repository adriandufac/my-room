// Scene3D.jsx
import { useRef, useEffect, useState } from "react";
import RoomExperience from "../Experience/RoomExperience";

const RoomScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<RoomExperience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Créer la scène Three.js
    if (canvasRef.current) {
      sceneRef.current = new RoomExperience(canvasRef.current);

      // Événement de progression du chargement
      const handleProgress = (event: CustomEvent) => {
        setLoadingProgress(event.detail.progress);
      };

      // Événement de fin de chargement
      const handleLoadComplete = () => {
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Petit délai pour une transition plus fluide
      };

      // Ajouter les listeners sur window.experience car c'est un singleton
      window.addEventListener(
        "roomLoadingProgress",
        handleProgress as EventListener
      );
      window.addEventListener("roomLoadingComplete", handleLoadComplete);

      // Cleanup
      return () => {
        window.removeEventListener(
          "roomLoadingProgress",
          handleProgress as EventListener
        );
        window.removeEventListener("roomLoadingComplete", handleLoadComplete);
      };
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />

      {/* Loading screen */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#000000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: "24px",
              marginBottom: "30px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Loading Room...
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: "300px",
              height: "6px",
              backgroundColor: "#333",
              borderRadius: "3px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: `${loadingProgress}%`,
                height: "100%",
                backgroundColor: "#4a9eff",
                transition: "width 0.3s ease-out",
                borderRadius: "3px",
              }}
            />
          </div>

          <div
            style={{
              color: "#ccc",
              fontSize: "16px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {Math.round(loadingProgress)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomScene;
