import React, { useState, useEffect } from "react";

interface LightControlsProps {
  onLightToggle?: (lightId: string, isOn: boolean) => void;
  onAmbientChange?: (intensity: number) => void;
}

const LightControls: React.FC<LightControlsProps> = ({
  onLightToggle,
  onAmbientChange,
}) => {
  const [lampOn, setLampOn] = useState(true);
  const [ambientIntensity, setAmbientIntensity] = useState(0.3);

  // ✅ ÉCOUTER les événements de la lampe 3D
  useEffect(() => {
    const handleLampToggle = (event: CustomEvent) => {
      const { lampId, isOn } = event.detail;
      if (lampId === "desk-lamp") {
        setLampOn(isOn);
      }
    };

    window.addEventListener("lampToggle", handleLampToggle as EventListener);

    return () => {
      window.removeEventListener(
        "lampToggle",
        handleLampToggle as EventListener
      );
    };
  }, []);

  const toggleLamp = () => {
    const newState = !lampOn;
    setLampOn(newState);

    // ✅ NOTIFIER la scène 3D
    if (onLightToggle) {
      onLightToggle("desk-lamp", newState);
    }

    // ✅ ÉMETTRE un événement pour la lampe 3D
    const event = new CustomEvent("uiLampToggle", {
      detail: {
        lampId: "desk-lamp",
        isOn: newState,
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="light-controls">
      <button
        onClick={toggleLamp}
        className={`lamp-switch ${lampOn ? "on" : "off"}`}
        style={{
          backgroundColor: lampOn ? "#ffd700" : "#333",
          color: lampOn ? "#000" : "#fff",
          border: "2px solid #666",
          borderRadius: "8px",
          padding: "10px 15px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        💡 {lampOn ? "ON" : "OFF"}
      </button>

      <div style={{ marginTop: "10px" }}>
        <label style={{ color: "white", display: "block" }}>Ambiance</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={ambientIntensity}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setAmbientIntensity(value);
            if (onAmbientChange) onAmbientChange(value);
          }}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

export default LightControls;
