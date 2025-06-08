import React, { useState, useEffect } from 'react';
import type { LevelData } from '../../game/utils/Types';
import { LevelService } from '../../game/levels/LevelService';
import { LevelPreview } from './LevelPreview';

interface LevelListProps {
  onLoadLevel?: (levelData: LevelData) => void;
  onEditLevel?: (levelData: LevelData) => void;
  currentLevelId?: string;
}

export const LevelList: React.FC<LevelListProps> = ({
  onLoadLevel,
  onEditLevel,
  currentLevelId
}) => {
  const [levels, setLevels] = useState<Record<string, LevelData>>({});
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  // Charger les niveaux
  const loadLevels = async () => {
    try {
      const allLevels = await LevelService.getAllLevels();
      setLevels(allLevels);
    } catch (error) {
      console.error('Erreur lors du chargement des niveaux:', error);
      setLevels({});
    }
  };

  useEffect(() => {
    loadLevels();
  }, []);

  // Supprimer un niveau
  const handleDelete = async (fileName: string, levelName: string) => {
    if (confirm(`Supprimer le niveau "${levelName}" ?`)) {
      try {
        const success = await LevelService.deleteLevel(fileName);
        if (success) {
          loadLevels();
          if (selectedLevel === fileName) {
            setSelectedLevel(null);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du niveau');
      }
    }
  };

  // Exporter un niveau
  const handleExport = (levelData: LevelData) => {
    LevelService.exportLevel(levelData);
  };

  // Importer un niveau
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const levelData = await LevelService.importLevel(file);
      if (levelData) {
        const success = await LevelService.saveLevel(levelData);
        if (success) {
          loadLevels();
          alert(`Niveau "${levelData.name}" importé avec succès !`);
        }
      } else {
        alert('Erreur lors de l\'import. Vérifiez le format JSON.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      alert('Erreur lors de l\'import. Vérifiez le format JSON.');
    }
    
    // Reset input
    event.target.value = '';
    setShowImport(false);
  };

  const levelEntries = Object.entries(levels);
  const [stats, setStats] = useState({ total: 0, totalSize: '0 Ko' });

  // Charger les statistiques
  useEffect(() => {
    const loadStats = async () => {
      try {
        const levelStats = await LevelService.getLevelStats();
        setStats(levelStats);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        setStats({ total: Object.keys(levels).length, totalSize: '0 Ko' });
      }
    };
    
    loadStats();
  }, [levels]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        backgroundColor: '#333',
        color: 'white',
        borderBottom: '2px solid #555'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Gestionnaire de Niveaux</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
          <span>📊 {stats.total} niveaux - {stats.totalSize}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowImport(!showImport)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              [IMPORT] Importer
            </button>
            <button
              onClick={loadLevels}
              style={{
                padding: '8px 12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Actualiser
            </button>
          </div>
        </div>
        
        {showImport && (
          <div style={{ marginTop: '10px' }}>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{
                padding: '5px',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Level List */}
        <div style={{
          width: '400px',
          borderRight: '2px solid #ddd',
          backgroundColor: 'white',
          overflowY: 'auto'
        }}>
          {levelEntries.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p>Aucun niveau sauvegard�</p>
              <p style={{ fontSize: '12px' }}>
                Cr�ez votre premier niveau dans l'�diteur !
              </p>
            </div>
          ) : (
            levelEntries.map(([fileName, levelData]) => (
              <div
                key={fileName}
                onClick={() => setSelectedLevel(fileName)}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: selectedLevel === fileName ? '#e3f2fd' : 'white',
                  borderLeft: currentLevelId === fileName ? '4px solid #4CAF50' : '4px solid transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                      {levelData.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div>[LEVEL] {levelData.width}×{levelData.height}px</div>
                      <div>
                        [LEVEL] {levelData.platforms.length} | 
                        [LEVEL] {levelData.enemies.length} | 
                        [LEVEL] {levelData.projectileSpawners.length}
                      </div>
                      <div>Modifié: {new Date(levelData.modified).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '10px' }}>
                    {onEditLevel && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditLevel(levelData);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        ✏️ Éditer
                      </button>
                    )}
                    
                    {onLoadLevel && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadLevel(levelData);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        🎮 Charger
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(levelData);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      [FILE] Export
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(fileName, levelData.name);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      [DELETE]
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preview */}
        <div style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {selectedLevel && levels[selectedLevel] ? (
            <div style={{ maxWidth: '600px', width: '100%' }}>
              <LevelPreview 
                levelData={levels[selectedLevel]}
                width={600}
                height={300}
                showInfo={true}
              />
              
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>D�tails du niveau</h3>
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <div><strong>ID:</strong> {levels[selectedLevel].id}</div>
                  <div><strong>Version:</strong> {levels[selectedLevel].version}</div>
                  <div><strong>Cr��:</strong> {new Date(levels[selectedLevel].created).toLocaleString()}</div>
                  <div><strong>Modifi�:</strong> {new Date(levels[selectedLevel].modified).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666' }}>
              <p>S�lectionnez un niveau pour voir l'aper�u</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};