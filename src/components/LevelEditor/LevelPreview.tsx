import React, { useRef, useEffect, useCallback } from 'react';
import type { LevelData } from '../../game/utils/Types';

interface LevelPreviewProps {
  levelData: LevelData;
  width?: number;
  height?: number;
  scale?: number;
  showInfo?: boolean;
}

export const LevelPreview: React.FC<LevelPreviewProps> = ({
  levelData,
  width = 400,
  height = 200,
  scale = 0.15,
  showInfo = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculer l'�chelle pour ajuster le niveau � la taille du canvas
    const scaleX = canvas.width / levelData.width;
    const scaleY = canvas.height / levelData.height;
    const finalScale = Math.min(scaleX, scaleY, scale);

    // Centrer le niveau dans le canvas
    const offsetX = (canvas.width - levelData.width * finalScale) / 2;
    const offsetY = (canvas.height - levelData.height * finalScale) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(finalScale, finalScale);

    // Dessiner le fond
    const gradient = ctx.createLinearGradient(0, 0, 0, levelData.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#98D8E8');
    gradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, levelData.width, levelData.height);

    // Dessiner les plateformes
    ctx.fillStyle = '#4CAF50';
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 2 / finalScale; // Ajuster l'�paisseur des lignes selon l'�chelle
    
    levelData.platforms.forEach(platform => {
      ctx.fillStyle = platform.color;
      ctx.fillRect(platform.position.x, platform.position.y, platform.size.x, platform.size.y);
      ctx.strokeRect(platform.position.x, platform.position.y, platform.size.x, platform.size.y);
    });

    // Dessiner les ennemis
    levelData.enemies.forEach(enemy => {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.position.x, enemy.position.y, enemy.size.x, enemy.size.y);
      ctx.strokeStyle = '#D32F2F';
      ctx.strokeRect(enemy.position.x, enemy.position.y, enemy.size.x, enemy.size.y);
    });

    // Dessiner les spawners de projectiles
    levelData.projectileSpawners.forEach(spawner => {
      ctx.fillStyle = spawner.color;
      ctx.fillRect(spawner.position.x, spawner.position.y, 20, 20);
      ctx.strokeStyle = '#F57C00';
      ctx.strokeRect(spawner.position.x, spawner.position.y, 20, 20);
    });

    // Dessiner le point de spawn (point de d�part du joueur)
    ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
    ctx.beginPath();
    ctx.arc(levelData.playerStart.x, levelData.playerStart.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3 / finalScale;
    ctx.stroke();

    // Dessiner la ligne d'arriv�e
    ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.fillRect(levelData.finishLine.x - 10, 0, 20, levelData.height);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4 / finalScale;
    ctx.strokeRect(levelData.finishLine.x - 10, 0, 20, levelData.height);

    // Dessiner les limites du niveau
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3 / finalScale;
    ctx.strokeRect(0, 0, levelData.width, levelData.height);

    ctx.restore();

    // Ajouter une grille l�g�re pour aider � la visualisation
    if (finalScale > 0.1) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      
      const gridSize = 40 * finalScale;
      for (let x = offsetX; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x, offsetY + levelData.height * finalScale);
        ctx.stroke();
      }
      
      for (let y = offsetY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(offsetX, y);
        ctx.lineTo(offsetX + levelData.width * finalScale, y);
        ctx.stroke();
      }
    }

  }, [levelData, scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    
    renderPreview();
  }, [width, height, renderPreview]);

  const platformCount = levelData.platforms.length;
  const enemyCount = levelData.enemies.length;
  const spawnerCount = levelData.projectileSpawners.length;
  
  const estimatedDifficulty = (() => {
    const baseScore = platformCount * 0.5;
    const enemyScore = enemyCount * 2;
    const spawnerScore = spawnerCount * 1.5;
    const total = baseScore + enemyScore + spawnerScore;
    
    if (total < 5) return 'Facile';
    if (total < 15) return 'Moyen';
    if (total < 30) return 'Difficile';
    return 'Tr�s Difficile';
  })();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      border: '2px solid #333',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#fff'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          backgroundColor: '#f0f0f0'
        }}
      />
      
      {showInfo && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #ddd',
          fontSize: '12px',
          color: '#666'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <strong style={{ color: '#333' }}>{levelData.name}</strong>
            <span>Difficult�: <strong style={{ 
              color: estimatedDifficulty === 'Facile' ? '#4CAF50' : 
                     estimatedDifficulty === 'Moyen' ? '#FF9800' : 
                     estimatedDifficulty === 'Difficile' ? '#F44336' : '#9C27B0'
            }}>{estimatedDifficulty}</strong></span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <div>=� {levelData.width}�{levelData.height}px</div>
            <div>=� {platformCount} plateformes</div>
            <div>=~ {enemyCount} ennemis</div>
            <div>=� {spawnerCount} spawners</div>
          </div>
          
          <div style={{ marginTop: '5px', fontSize: '10px', color: '#999' }}>
            Cr��: {new Date(levelData.created).toLocaleDateString()} | 
            Modifi�: {new Date(levelData.modified).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};