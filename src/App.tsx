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
  const [isTestingFromEditor, setIsTestingFromEditor] = useState(false);

  const handleSaveLevel = async (levelData: LevelData) => {
    try {
      const success = await LevelService.saveLevel(levelData);
      if (success) {
        alert(`[SUCCESS] Niveau "${levelData.name}" sauvegardé avec succès!`);
      } else {
        alert(`[ERROR] Erreur lors de la sauvegarde du niveau "${levelData.name}"`);
      }
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      alert(`[ERROR] Erreur lors de la sauvegarde du niveau "${levelData.name}"`);
    }
  };

  const handleTestLevel = (levelData: LevelData) => {
    console.log('[GAME] Test du niveau:', levelData.name);
    setTestLevel(levelData);
    setEditingLevel(levelData); // Sauvegarder le niveau en cours d'édition
    setIsTestingFromEditor(true);
    setCurrentMode('game');
  };

  const handleEditLevel = (levelData: LevelData) => {
    setEditingLevel(levelData);
    setCurrentMode('editor');
  };

  const handleLoadLevel = (levelData: LevelData) => {
    setTestLevel(levelData);
    setIsTestingFromEditor(false);
    setCurrentMode('game');
  };

  const handleReturnToEditor = () => {
    setIsTestingFromEditor(false);
    setCurrentMode('editor');
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
          onClick={() => {
            setCurrentMode('game');
            setTestLevel(null);
            setIsTestingFromEditor(false);
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: currentMode === 'game' ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          [GAME] Jeu
        </button>
        <button
          onClick={() => {
            setCurrentMode('editor');
            setEditingLevel(null); // Nouveau niveau
            setIsTestingFromEditor(false);
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
          Éditeur de Niveau
        </button>
        <button
          onClick={() => {
            setCurrentMode('manager');
            setIsTestingFromEditor(false);
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: currentMode === 'manager' ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          [FILE] Gestionnaire de Niveaux
        </button>
      </div>

      {/* Bouton retour à l'éditeur si on teste depuis l'éditeur */}
      {currentMode === 'game' && isTestingFromEditor && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          zIndex: 1000
        }}>
          <button
            onClick={handleReturnToEditor}
            style={{
              padding: '10px 20px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            ← Retour à l'éditeur
          </button>
        </div>
      )}

      {/* Contenu principal */}
      {currentMode === 'game' && (
        <GameCanvas 
          width={1200} 
          height={600} 
          showDebug={true} 
          levelToLoad={testLevel}
        />
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
