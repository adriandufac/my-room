import React, { useEffect, useRef, useState } from 'react';

interface DesktopProps {
  onLaunchGame: () => void;
}

export const Desktop: React.FC<DesktopProps> = ({ onLaunchGame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Canvas dimensions: game viewport + window decorations
  const GAME_WIDTH = 1200;
  const GAME_HEIGHT = 600;
  const TITLE_BAR_HEIGHT = 30;
  const TASKBAR_HEIGHT = 40;
  const CANVAS_WIDTH = GAME_WIDTH;
  const CANVAS_HEIGHT = GAME_HEIGHT + TITLE_BAR_HEIGHT + TASKBAR_HEIGHT;

  // Game icon properties
  const gameIcon = {
    x: 50,
    y: 60,
    width: 64,
    height: 64,
    selected: selectedIcon === 'game'
  };

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    renderDesktop(ctx);
  }, [selectedIcon, currentTime, CANVAS_WIDTH, CANVAS_HEIGHT]);

  const renderDesktop = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw title bar (window decoration)
    drawTitleBar(ctx);

    // Draw desktop background
    drawDesktopBackground(ctx);

    // Draw game icon
    drawGameIcon(ctx);

    // Draw taskbar
    drawTaskbar(ctx);

    // Draw instructions
    drawInstructions(ctx);
  };

  const drawTitleBar = (ctx: CanvasRenderingContext2D) => {
    // Title bar gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, TITLE_BAR_HEIGHT);
    gradient.addColorStop(0, '#4a5568');
    gradient.addColorStop(1, '#2d3748');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, TITLE_BAR_HEIGHT);

    // Title bar border
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, TITLE_BAR_HEIGHT);

    // Window title
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Platform Game Desktop', 8, 20);

    // Close button
    const closeButtonX = CANVAS_WIDTH - 25;
    const closeButtonY = 5;
    const closeButtonSize = 20;

    ctx.fillStyle = '#e53e3e';
    ctx.fillRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    ctx.strokeStyle = '#c53030';
    ctx.lineWidth = 1;
    ctx.strokeRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);

    // Close button X
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(closeButtonX + 6, closeButtonY + 6);
    ctx.lineTo(closeButtonX + 14, closeButtonY + 14);
    ctx.moveTo(closeButtonX + 14, closeButtonY + 6);
    ctx.lineTo(closeButtonX + 6, closeButtonY + 14);
    ctx.stroke();
  };

  const drawDesktopBackground = (ctx: CanvasRenderingContext2D) => {
    const desktopY = TITLE_BAR_HEIGHT;
    const desktopHeight = GAME_HEIGHT;

    // Desktop gradient background
    const gradient = ctx.createLinearGradient(0, desktopY, CANVAS_WIDTH, desktopY + desktopHeight);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, desktopY, CANVAS_WIDTH, desktopHeight);

    // Add some texture/pattern
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = desktopY + Math.random() * desktopHeight;
      const radius = Math.random() * 3 + 1;
      
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const drawGameIcon = (ctx: CanvasRenderingContext2D) => {
    const iconY = gameIcon.y + TITLE_BAR_HEIGHT;

    // Icon selection background
    if (gameIcon.selected) {
      ctx.fillStyle = 'rgba(0, 120, 215, 0.3)';
      ctx.fillRect(gameIcon.x - 8, iconY - 8, gameIcon.width + 16, gameIcon.height + 32);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(gameIcon.x - 8, iconY - 8, gameIcon.width + 16, gameIcon.height + 32);
      ctx.setLineDash([]);
    }

    // Icon background
    const iconGradient = ctx.createLinearGradient(gameIcon.x, iconY, gameIcon.x, iconY + gameIcon.height);
    iconGradient.addColorStop(0, '#667eea');
    iconGradient.addColorStop(1, '#764ba2');
    
    ctx.fillStyle = iconGradient;
    ctx.fillRect(gameIcon.x, iconY, gameIcon.width, gameIcon.height);

    // Icon border
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.strokeRect(gameIcon.x, iconY, gameIcon.width, gameIcon.height);

    // Icon highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(gameIcon.x + 1, iconY + 1, gameIcon.width - 2, gameIcon.height - 2);

    // Pixel art content
    const pixelSize = 8;
    const pixelGap = 2;
    const startX = gameIcon.x + (gameIcon.width - (pixelSize * 2 + pixelGap)) / 2;
    const startY = iconY + (gameIcon.height - (pixelSize * 2 + pixelGap)) / 2;

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
    
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const pixelX = startX + j * (pixelSize + pixelGap);
        const pixelY = startY + i * (pixelSize + pixelGap);
        
        ctx.fillStyle = colors[i * 2 + j];
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
        
        // Pixel highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(pixelX, pixelY, pixelSize, 2);
      }
    }

    // Icon label
    ctx.fillStyle = 'white';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 2;
    ctx.fillText('Platform Game', gameIcon.x + gameIcon.width / 2, iconY + gameIcon.height + 15);
    ctx.shadowBlur = 0;
  };

  const drawTaskbar = (ctx: CanvasRenderingContext2D) => {
    const taskbarY = CANVAS_HEIGHT - TASKBAR_HEIGHT;

    // Taskbar gradient
    const gradient = ctx.createLinearGradient(0, taskbarY, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#4a5568');
    gradient.addColorStop(1, '#2d3748');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, taskbarY, CANVAS_WIDTH, TASKBAR_HEIGHT);

    // Taskbar border
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, taskbarY, CANVAS_WIDTH, TASKBAR_HEIGHT);

    // Start button
    const startButtonX = 8;
    const startButtonY = taskbarY + 6;
    const startButtonWidth = 60;
    const startButtonHeight = 28;

    const startGradient = ctx.createLinearGradient(startButtonX, startButtonY, startButtonX, startButtonY + startButtonHeight);
    startGradient.addColorStop(0, '#68d391');
    startGradient.addColorStop(1, '#48bb78');
    
    ctx.fillStyle = startGradient;
    ctx.fillRect(startButtonX, startButtonY, startButtonWidth, startButtonHeight);

    ctx.strokeStyle = '#38a169';
    ctx.strokeRect(startButtonX, startButtonY, startButtonWidth, startButtonHeight);

    // Start button text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⊞ Start', startButtonX + startButtonWidth / 2, startButtonY + 18);

    // Clock
    const clockX = CANVAS_WIDTH - 80;
    const clockY = taskbarY + 6;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(clockX, clockY, 70, 28);

    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentTime, clockX + 35, clockY + 18);
  };

  const drawInstructions = (ctx: CanvasRenderingContext2D) => {
    const instructionY = CANVAS_HEIGHT - TASKBAR_HEIGHT - 60;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(CANVAS_WIDTH / 2 - 150, instructionY, 300, 40);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeRect(CANVAS_WIDTH / 2 - 150, instructionY, 300, 40);

    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 2;
    ctx.fillText('Double-click the Platform Game icon to start playing', CANVAS_WIDTH / 2, instructionY + 25);
    ctx.shadowBlur = 0;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Adjust for title bar
    const adjustedY = y - TITLE_BAR_HEIGHT;

    // Check if click is on game icon
    if (
      x >= gameIcon.x &&
      x <= gameIcon.x + gameIcon.width &&
      adjustedY >= gameIcon.y &&
      adjustedY <= gameIcon.y + gameIcon.height
    ) {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastClickTime;

      if (selectedIcon === 'game' && timeDiff < 500) {
        // Double click detected
        console.log('[DESKTOP] Double-click detected, launching game...');
        onLaunchGame();
      } else {
        // Single click - select the icon
        setSelectedIcon('game');
        setLastClickTime(currentTime);
      }
    } else {
      // Click outside icon - deselect
      setSelectedIcon(null);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      padding: '20px'
    }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        style={{
          border: '2px solid #4a5568',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          cursor: 'default'
        }}
      />
    </div>
  );
};