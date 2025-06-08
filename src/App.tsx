import "./App.css";
import Game from "./components/Game/Game";
import TestPhysicsDemo from "./components/Game/TestPhysicsDemo";
import RoomScene from "./components/RoomScene";
import { GameCanvas } from "./components/Game/GameCanvas";
import { LevelEditor } from "./components/LevelEditor/LevelEditor";
import { LevelList } from "./components/LevelEditor/LevelList";
import type { LevelData } from "./game/utils/Types";
import { LevelService } from "./game/levels/LevelService";
import { useState } from "react";

function App() {
  const [currentMode, setCurrentMode] = useState<'game' | 'editor' | 'manager'>('game');
  const [testLevel, setTestLevel] = useState<LevelData | null>(null);
  const [editingLevel, setEditingLevel] = useState<LevelData | null>(null);

  const handleSaveLevel = async (levelData: LevelData) => {
    try {
      const success = await LevelService.saveLevel(levelData);
      if (success) {
        alert(`✅ Niveau "${levelData.name}" sauvegardé avec succès!`);
      } else {
        alert(`❌ Erreur lors de la sauvegarde du niveau "${levelData.name}"`);
      }
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      alert(`❌ Erreur lors de la sauvegarde du niveau "${levelData.name}"`);
    }
  };

  const handleTestLevel = (levelData: LevelData) => {
    console.log('🎮 Test du niveau:', levelData.name);
    setTestLevel(levelData);
    setCurrentMode('game');
    
    // TODO: Charger le niveau dans le jeu
    alert(`Test du niveau "${levelData.name}" - Fonctionnalité à implémenter`);
  };

  const handleEditLevel = (levelData: LevelData) => {
    setEditingLevel(levelData);
    setCurrentMode('editor');
  };

  const handleLoadLevel = (levelData: LevelData) => {
    setTestLevel(levelData);
    setCurrentMode('game');
    alert(`Chargement du niveau "${levelData.name}" dans le jeu`);
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
          onClick={() => {
            setCurrentMode('editor');
            setEditingLevel(null); // Nouveau niveau
          }}
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
        <button
          onClick={() => setCurrentMode('manager')}
          style={{
            padding: '8px 16px',
            backgroundColor: currentMode === 'manager' ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📁 Gestionnaire de Niveaux
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
          initialLevel={editingLevel || undefined}
        />
      )}

      {currentMode === 'manager' && (
        <LevelList 
          onLoadLevel={handleLoadLevel}
          onEditLevel={handleEditLevel}
          currentLevelId={testLevel?.id}
        />
      )}
    </div>
  );
}

export default App;
