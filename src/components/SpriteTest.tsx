import React, { useRef, useEffect, useState } from 'react';
import { SpriteManager } from '../game/graphics/SpriteManager';
import { SPRITE_CONFIGS } from '../game/graphics/SpriteConfigs';

export const SpriteTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spriteManager, setSpriteManager] = useState<SpriteManager | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentState, setCurrentState] = useState('idle');
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSprites = async () => {
      try {
        console.log('[SPRITE_TEST] Initializing sprite test with SpriteManager...');
        
        // Create sprite manager for player
        const manager = new SpriteManager('player');
        setSpriteManager(manager);
        
        // Get available states
        const states = manager.getAvailableStates();
        setAvailableStates(states);
        console.log('[SPRITE_TEST] Available states:', states);
        
        if (states.length > 0) {
          // Set initial state
          manager.setState('idle');
          setCurrentState('idle');
          
          // Wait for sprites to load
          const checkLoaded = () => {
            const loadedStates = manager.getAllLoadedStates();
            console.log('[SPRITE_TEST] Loaded states:', loadedStates);
            
            if (loadedStates.length > 0) {
              setIsLoaded(true);
              console.log('[SPRITE_TEST] At least one sprite loaded successfully');
            } else {
              setTimeout(checkLoaded, 100);
            }
          };
          checkLoaded();
        } else {
          throw new Error('No sprite configs found for player. Make sure you have player_idle, player_run, etc. configs.');
        }

      } catch (err) {
        console.error('[SPRITE_TEST] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    initSprites();
  }, []);

  useEffect(() => {
    if (!spriteManager || !isLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastTime = 0;

    const render = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update sprite animation
      spriteManager.update(deltaTime);

      // Render sprite at center
      const x = canvas.width / 2 - 16; // Center horizontally (32px width / 2)
      const y = canvas.height / 2 - 24; // Center vertically (48px height / 2)
      
      spriteManager.render(ctx, x, y);

      // Render debug info
      spriteManager.renderDebug(ctx, x, y);

      // Show animation info
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(`State: ${spriteManager.getCurrentState()}`, 10, 30);
      ctx.fillText(`Loaded: ${spriteManager.isCurrentStateLoaded()}`, 10, 50);
      ctx.fillText(`Available: ${availableStates.join(', ')}`, 10, 70);
      
      // Debug: Show status
      if (!spriteManager.isCurrentStateLoaded()) {
        ctx.fillStyle = 'red';
        ctx.fillRect(x, y, 32, 48);
        ctx.fillStyle = 'white';
        ctx.fillText('Loading...', x, y + 60);
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [spriteManager, isLoaded, availableStates]);

  const changeState = (stateName: string) => {
    if (spriteManager) {
      const success = spriteManager.setState(stateName);
      if (success) {
        setCurrentState(stateName);
        console.log(`[SPRITE_TEST] Changed state to: ${stateName}`);
      } else {
        console.warn(`[SPRITE_TEST] Failed to change to state: ${stateName}`);
      }
    }
  };

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h3>Sprite Test Error</h3>
        <p>{error}</p>
        <p>Assurez-vous que le fichier `/public/textures/sprites/player_run_spritesheet.png` existe.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🎮 Test du Système de Sprites</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Status:</strong> {isLoaded ? '✅ Chargé' : '⏳ Chargement...'}</p>
        <p><strong>État actuel:</strong> {currentState}</p>
        <p><strong>États disponibles:</strong> {availableStates.join(', ')}</p>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        style={{
          border: '2px solid #333',
          backgroundColor: '#87CEEB',
          display: 'block',
          marginBottom: '20px'
        }}
      />

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {availableStates.map(state => (
          <button
            key={state}
            onClick={() => changeState(state)}
            style={{
              padding: '10px 15px',
              backgroundColor: currentState === state ? '#4CAF50' : '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {state}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>Tests à vérifier :</h4>
        <ul>
          <li>✅ Le sprite s'affiche au centre du canvas</li>
          <li>✅ L'animation change quand vous cliquez sur les boutons</li>
          <li>✅ L'animation "run" boucle en continu</li>
          <li>✅ Les animations "jump" et "fall" restent sur la dernière frame</li>
          <li>✅ Aucune erreur dans la console du navigateur</li>
          <li>✅ Le debug info affiche les bonnes informations</li>
        </ul>
      </div>
    </div>
  );
};