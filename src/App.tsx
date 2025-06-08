import "./App.css";
import Game from "./components/Game/Game";
import TestPhysicsDemo from "./components/Game/TestPhysicsDemo";
import RoomScene from "./components/RoomScene";
import { GameCanvas } from "./components/Game/GameCanvas";
import { LevelEditor } from "./components/LevelEditor/LevelEditor";
import { LevelPreview } from "./components/LevelEditor/LevelPreview";
import type { LevelData } from "./game/utils/Types";
import { useState } from "react";

function App() {
  const [currentMode, setCurrentMode] = useState<'game' | 'editor'>('game');
  const [testLevel, setTestLevel] = useState<LevelData | null>(null);

  const handleSaveLevel = (levelData: LevelData) => {
    console.log('💾 Sauvegarde du niveau:', levelData.name);
    console.log('📊 Statistiques:', {
      plateformes: levelData.platforms.length,
      ennemis: levelData.enemies.length,
      spawners: levelData.projectileSpawners.length
    });
    
    // TODO: Implémenter la sauvegarde réelle dans data/levels/custom/
    alert(`Niveau "${levelData.name}" sauvegardé avec succès!`);
  };

  const handleTestLevel = (levelData: LevelData) => {
    console.log('🎮 Test du niveau:', levelData.name);
    setTestLevel(levelData);
    setCurrentMode('game');
    
    // TODO: Charger le niveau dans le jeu
    alert(`Test du niveau "${levelData.name}" - Fonctionnalité à implémenter`);
  };

  return (
    <div className="App">
      {/* Sélecteur de mode */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#333', 
        color: 'white', 
        display: 'flex', 
        gap: '10px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setCurrentMode('game')}
          style={{
            padding: '8px 16px',
            backgroundColor: currentMode === 'game' ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🎮 Jeu
        </button>
        <button
          onClick={() => setCurrentMode('editor')}
          style={{
            padding: '8px 16px',
            backgroundColor: currentMode === 'editor' ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🛠️ Éditeur de Niveau
        </button>
      </div>

      {/* Contenu principal */}
      {currentMode === 'game' && (
        <GameCanvas width={1200} height={600} showDebug={true} />
      )}
      
      {currentMode === 'editor' && (
        <LevelEditor 
          onSave={handleSaveLevel}
          onTest={handleTestLevel}
        />
      )}
    </div>
  );
}

export default App;
