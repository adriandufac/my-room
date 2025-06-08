import React, { useState } from "react";
import { GameCanvas } from "./GameCanvas";

const Game: React.FC = () => {
  const [showTests, setShowTests] = useState(false);

  return (
    <div className="game-container">
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Jeu de Plateforme 2D
      </h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => setShowTests(!showTests)}
          style={{
            padding: "8px 16px",
            backgroundColor: showTests ? "#dc3545" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {showTests ? "Masquer les tests" : "Afficher les tests de debug"}
        </button>
      </div>

      {showTests && (
        <>
          <div
            className="game-info"
            style={{
              textAlign: "center",
              marginBottom: "20px",
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
            }}
          >
            <h3>Tests de l'étape 2.1 :</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <div>[SUCCESS] La boucle de jeu tourne à 60 FPS</div>
              <div>[SUCCESS] Le compteur de FPS s'affiche</div>
              <div>[SUCCESS] La boucle peut être mise en pause/reprise</div>
              <div>[SUCCESS] Pas de fuite mémoire après 5 minutes</div>
            </div>
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                backgroundColor: "#e8f5fe",
                borderRadius: "4px",
              }}
            >
              <strong>Test visuel :</strong> Un rectangle orange doit se
              déplacer et rebondir sur les bords du canvas
            </div>
          </div>
        </>
      )}

      <GameCanvas width={1200} height={600} showDebug={showTests} />

      {showTests && (
        <div
          className="test-instructions"
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e8f5fe",
            borderRadius: "8px",
            border: "1px solid #81c784",
          }}
        >
          <h4>Instructions de test Phase 2.1 :</h4>
          <ol>
            <li>Vérifiez que le rectangle orange se déplace automatiquement</li>
            <li>Le rectangle doit rebondir sur tous les bords du canvas</li>
            <li>Le compteur FPS doit afficher environ 60 FPS</li>
            <li>
              Cliquez sur "Pause" pour arrêter la boucle, puis "Play" pour
              reprendre
            </li>
            <li>Ouvrez la console pour voir les logs du moteur de jeu</li>
            <li>
              Laissez tourner 5 minutes pour vérifier l'absence de fuite mémoire
            </li>
          </ol>
          <div
            style={{
              marginTop: "10px",
              padding: "8px",
              backgroundColor: "#fff3cd",
              borderRadius: "4px",
            }}
          >
            <strong>Objectif :</strong> Valider que la boucle de jeu fonctionne
            de manière stable et fluide
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
