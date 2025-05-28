// Scene3D.jsx
import { useRef, useEffect } from "react";
import RoomExperience from "../Experience/RoomExperience";

const RoomScene = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<RoomExperience | null>(null);

  useEffect(() => {
    // Créer la scène Three.js
    if (canvasRef.current) {
      sceneRef.current = new RoomExperience(canvasRef.current);
    }

    // Cleanup
    return () => {
      if (sceneRef.current) {
        /* sceneRef.current.dispose(); */
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default RoomScene;
