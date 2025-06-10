import React, { useEffect, useRef, useState } from "react";
import { Game } from "../game/core/Game";
import { ContactForm } from "./UI/ContactForm";

interface WindowsCanvasProps {}

export const WindowsCanvas: React.FC<WindowsCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState<boolean>(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Canvas dimensions: game viewport + window decorations
  const TITLE_BAR_HEIGHT = 30;
  const TASKBAR_HEIGHT = 40;

  // Calculate game dimensions (leaving some margin)
  const GAME_WIDTH = Math.min(1200, windowDimensions.width - 40);
  const GAME_HEIGHT = Math.min(
    600,
    windowDimensions.height - TITLE_BAR_HEIGHT - TASKBAR_HEIGHT - 40
  );
  const CANVAS_WIDTH = GAME_WIDTH;
  const CANVAS_HEIGHT = GAME_HEIGHT + TITLE_BAR_HEIGHT + TASKBAR_HEIGHT;

  // Game icon properties
  const gameIcon = {
    x: 50,
    y: 60,
    width: 64,
    height: 64,
    selected: selectedIcon === "game",
  };

  // Mail icon properties
  const mailIcon = {
    x: 150,
    y: 60,
    width: 64,
    height: 64,
    selected: selectedIcon === "mail",
  };

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1000);

    setCurrentTime(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Si le jeu est en cours, le fermer puis le relancer comme si on cliquait sur close puis double-click
      if (isGameRunning && gameRef.current) {
        console.log(
          "[WINDOWS] Window resized while game running - closing and reopening game"
        );

        // Fermer le jeu (comme si on cliquait sur le bouton close)
        gameRef.current.stop();
        gameRef.current.destroy();
        gameRef.current = null;
        setIsGameRunning(false);

        // Relancer le jeu après un court délai (comme si on double-cliquait l'icône)
        setTimeout(() => {
          console.log("[WINDOWS] Relaunching game with new dimensions");
          setIsGameRunning(true);
        }, 100);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isGameRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        console.log("[WINDOWS] Component unmounting, cleaning up game");
        gameRef.current.stop();
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    if (isGameRunning) {
      // If game is running, check if we need to recreate it due to size change
      const needsRecreation =
        !gameRef.current ||
        gameRef.current.getCanvas().width !== GAME_WIDTH ||
        gameRef.current.getCanvas().height !== GAME_HEIGHT;

      if (needsRecreation) {
        console.log("[WINDOWS] Recreating game due to size change");

        // Clean up existing game if it exists
        if (gameRef.current) {
          console.log("[WINDOWS] Stopping and destroying existing game");
          gameRef.current.stop();
          gameRef.current.destroy();
          gameRef.current = null;
        }

        // Create a virtual canvas for the game that renders into our main canvas
        const gameCanvas = document.createElement("canvas");
        gameCanvas.width = GAME_WIDTH;
        gameCanvas.height = GAME_HEIGHT;

        gameRef.current = new Game(gameCanvas);
        gameRef.current.start();
        console.log("[WINDOWS] New game created and started");
      }

      renderGameWindow(ctx);
    } else {
      // Render desktop
      renderDesktop(ctx);
    }
  }, [selectedIcon, currentTime, isGameRunning, windowDimensions]);

  // Animation loop for game rendering
  useEffect(() => {
    if (!isGameRunning) return;

    let animationId: number;

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas || !isGameRunning) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      renderGameWindow(ctx);

      if (isGameRunning) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isGameRunning]);

  const renderDesktop = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw title bar
    drawTitleBar(ctx, "Platform Game Desktop");

    // Draw desktop background
    drawDesktopBackground(ctx);

    // Draw game icon
    drawGameIcon(ctx);

    // Draw mail icon
    drawMailIcon(ctx);

    // Draw taskbar
    drawTaskbar(ctx);

    // Draw instructions - commented out as it's obvious
    // drawInstructions(ctx);
  };

  const renderGameWindow = (ctx: CanvasRenderingContext2D) => {
    // Don't render game window if game is not running
    if (!isGameRunning) {
      renderDesktop(ctx);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw title bar
    drawTitleBar(ctx, "Platform Game");

    // Draw game content area
    if (gameRef.current) {
      const gameCanvas = gameRef.current.getCanvas();
      if (gameCanvas) {
        ctx.drawImage(gameCanvas, 0, TITLE_BAR_HEIGHT, GAME_WIDTH, GAME_HEIGHT);
      }
    } else {
      // Fallback if game not loaded
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, TITLE_BAR_HEIGHT, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = "white";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "Loading Game...",
        GAME_WIDTH / 2,
        TITLE_BAR_HEIGHT + GAME_HEIGHT / 2
      );
    }

    // Draw taskbar
    drawTaskbar(ctx);
  };

  const drawTitleBar = (ctx: CanvasRenderingContext2D, title: string) => {
    // Title bar gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, TITLE_BAR_HEIGHT);
    gradient.addColorStop(0, "#4a5568");
    gradient.addColorStop(1, "#2d3748");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, TITLE_BAR_HEIGHT);

    // Title bar border
    ctx.strokeStyle = "#718096";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, TITLE_BAR_HEIGHT);

    // Window title
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(title, 8, 20);

    // Close button
    const closeButtonX = CANVAS_WIDTH - 25;
    const closeButtonY = 5;
    const closeButtonSize = 20;

    ctx.fillStyle = "#e53e3e";
    ctx.fillRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);

    ctx.strokeStyle = "#c53030";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      closeButtonX,
      closeButtonY,
      closeButtonSize,
      closeButtonSize
    );

    // Close button X
    ctx.strokeStyle = "white";
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
    const gradient = ctx.createLinearGradient(
      0,
      desktopY,
      CANVAS_WIDTH,
      desktopY + desktopHeight
    );
    gradient.addColorStop(0, "#1e3c72");
    gradient.addColorStop(1, "#2a5298");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, desktopY, CANVAS_WIDTH, desktopHeight);

    // Add some texture/pattern
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = desktopY + Math.random() * desktopHeight;
      const radius = Math.random() * 3 + 1;

      ctx.fillStyle = "white";
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
      ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
      ctx.fillRect(
        gameIcon.x - 8,
        iconY - 8,
        gameIcon.width + 16,
        gameIcon.height + 32
      );

      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(
        gameIcon.x - 8,
        iconY - 8,
        gameIcon.width + 16,
        gameIcon.height + 32
      );
      ctx.setLineDash([]);
    }

    // Icon background
    const iconGradient = ctx.createLinearGradient(
      gameIcon.x,
      iconY,
      gameIcon.x,
      iconY + gameIcon.height
    );
    iconGradient.addColorStop(0, "#667eea");
    iconGradient.addColorStop(1, "#764ba2");

    ctx.fillStyle = iconGradient;
    ctx.fillRect(gameIcon.x, iconY, gameIcon.width, gameIcon.height);

    // Icon border
    ctx.strokeStyle = "#4a5568";
    ctx.lineWidth = 2;
    ctx.strokeRect(gameIcon.x, iconY, gameIcon.width, gameIcon.height);

    // Icon highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      gameIcon.x + 1,
      iconY + 1,
      gameIcon.width - 2,
      gameIcon.height - 2
    );

    // Pixel art content
    const pixelSize = 8;
    const pixelGap = 2;
    const startX =
      gameIcon.x + (gameIcon.width - (pixelSize * 2 + pixelGap)) / 2;
    const startY = iconY + (gameIcon.height - (pixelSize * 2 + pixelGap)) / 2;

    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24"];

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const pixelX = startX + j * (pixelSize + pixelGap);
        const pixelY = startY + i * (pixelSize + pixelGap);

        ctx.fillStyle = colors[i * 2 + j];
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);

        // Pixel highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(pixelX, pixelY, pixelSize, 2);
      }
    }

    // Icon label
    ctx.fillStyle = "white";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 2;
    ctx.fillText(
      "Platform Game",
      gameIcon.x + gameIcon.width / 2,
      iconY + gameIcon.height + 15
    );
    ctx.shadowBlur = 0;
  };

  const drawMailIcon = (ctx: CanvasRenderingContext2D) => {
    const iconY = mailIcon.y + TITLE_BAR_HEIGHT;

    // Icon selection background
    if (mailIcon.selected) {
      ctx.fillStyle = "rgba(0, 120, 215, 0.3)";
      ctx.fillRect(
        mailIcon.x - 8,
        iconY - 8,
        mailIcon.width + 16,
        mailIcon.height + 32
      );

      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(
        mailIcon.x - 8,
        iconY - 8,
        mailIcon.width + 16,
        mailIcon.height + 32
      );
      ctx.setLineDash([]);
    }

    // Icon background (Gmail-style red gradient)
    const iconGradient = ctx.createLinearGradient(
      mailIcon.x,
      iconY,
      mailIcon.x,
      iconY + mailIcon.height
    );
    iconGradient.addColorStop(0, "#ea4335");
    iconGradient.addColorStop(1, "#c5221f");

    ctx.fillStyle = iconGradient;
    ctx.fillRect(mailIcon.x, iconY, mailIcon.width, mailIcon.height);

    // Icon border
    ctx.strokeStyle = "#4a5568";
    ctx.lineWidth = 2;
    ctx.strokeRect(mailIcon.x, iconY, mailIcon.width, mailIcon.height);

    // Icon highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      mailIcon.x + 1,
      iconY + 1,
      mailIcon.width - 2,
      mailIcon.height - 2
    );

    // Draw envelope shape
    const envelopeX = mailIcon.x + 8;
    const envelopeY = iconY + 16;
    const envelopeWidth = mailIcon.width - 16;
    const envelopeHeight = mailIcon.height - 32;

    // Envelope body
    ctx.fillStyle = "white";
    ctx.fillRect(envelopeX, envelopeY, envelopeWidth, envelopeHeight);

    // Envelope border
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;
    ctx.strokeRect(envelopeX, envelopeY, envelopeWidth, envelopeHeight);

    // Envelope flap (triangle)
    ctx.fillStyle = "#f3f4f6";
    ctx.beginPath();
    ctx.moveTo(envelopeX, envelopeY);
    ctx.lineTo(envelopeX + envelopeWidth / 2, envelopeY + envelopeHeight / 3);
    ctx.lineTo(envelopeX + envelopeWidth, envelopeY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // @ symbol in the center
    ctx.fillStyle = "#ea4335";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("@", mailIcon.x + mailIcon.width / 2, iconY + mailIcon.height / 2 + 5);

    // Icon label
    ctx.fillStyle = "white";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 2;
    ctx.fillText(
      "Contact the dev",
      mailIcon.x + mailIcon.width / 2,
      iconY + mailIcon.height + 15
    );
    ctx.shadowBlur = 0;
  };

  const drawTaskbar = (ctx: CanvasRenderingContext2D) => {
    const taskbarY = CANVAS_HEIGHT - TASKBAR_HEIGHT;

    // Taskbar gradient
    const gradient = ctx.createLinearGradient(0, taskbarY, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, "#4a5568");
    gradient.addColorStop(1, "#2d3748");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, taskbarY, CANVAS_WIDTH, TASKBAR_HEIGHT);

    // Taskbar border
    ctx.strokeStyle = "#718096";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, taskbarY, CANVAS_WIDTH, TASKBAR_HEIGHT);

    // Start button
    const startButtonX = 8;
    const startButtonY = taskbarY + 6;
    const startButtonWidth = 60;
    const startButtonHeight = 28;

    const startGradient = ctx.createLinearGradient(
      startButtonX,
      startButtonY,
      startButtonX,
      startButtonY + startButtonHeight
    );
    startGradient.addColorStop(0, "#68d391");
    startGradient.addColorStop(1, "#48bb78");

    ctx.fillStyle = startGradient;
    ctx.fillRect(
      startButtonX,
      startButtonY,
      startButtonWidth,
      startButtonHeight
    );

    ctx.strokeStyle = "#38a169";
    ctx.strokeRect(
      startButtonX,
      startButtonY,
      startButtonWidth,
      startButtonHeight
    );

    // Start button text
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "⊞ Start",
      startButtonX + startButtonWidth / 2,
      startButtonY + 18
    );

    // Clock
    const clockX = CANVAS_WIDTH - 80;
    const clockY = taskbarY + 6;

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(clockX, clockY, 70, 28);

    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(currentTime, clockX + 35, clockY + 18);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check for close button click (top right)
    const closeButtonX = CANVAS_WIDTH - 25;
    const closeButtonY = 5;
    const closeButtonSize = 20;

    if (
      x >= closeButtonX &&
      x <= closeButtonX + closeButtonSize &&
      y >= closeButtonY &&
      y <= closeButtonY + closeButtonSize
    ) {
      // Close button clicked
      if (isGameRunning) {
        // Stop the game
        if (gameRef.current) {
          gameRef.current.stop();
          gameRef.current.destroy();
          gameRef.current = null;
        }
        setIsGameRunning(false);
        console.log("[WINDOWS] Game closed, returning to desktop");

        // Immediately render desktop
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            renderDesktop(ctx);
          }
        }
      }
      return;
    }

    // If we're on desktop, handle icon clicks
    if (!isGameRunning) {
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

        if (selectedIcon === "game" && timeDiff < 500) {
          // Double click detected - launch game
          console.log("[WINDOWS] Double-click detected, launching game...");
          setIsGameRunning(true);
        } else {
          // Single click - select the icon
          setSelectedIcon("game");
          setLastClickTime(currentTime);
        }
      } 
      // Check if click is on mail icon
      else if (
        x >= mailIcon.x &&
        x <= mailIcon.x + mailIcon.width &&
        adjustedY >= mailIcon.y &&
        adjustedY <= mailIcon.y + mailIcon.height
      ) {
        const currentTime = Date.now();
        const timeDiff = currentTime - lastClickTime;

        if (selectedIcon === "mail" && timeDiff < 500) {
          // Double click detected - open contact form
          console.log("[WINDOWS] Double-click detected, opening contact form...");
          setIsContactFormOpen(true);
        } else {
          // Single click - select the icon
          setSelectedIcon("mail");
          setLastClickTime(currentTime);
        }
      } else {
        // Click outside icon - deselect
        setSelectedIcon(null);
      }
    } else {
      // If game is running, forward clicks to the game
      if (gameRef.current) {
        // Forward the click to the game canvas with adjusted coordinates
        const gameY = y - TITLE_BAR_HEIGHT;
        if (gameY >= 0 && gameY <= GAME_HEIGHT) {
          // Create a synthetic mouse event for the game
          const gameCanvas = gameRef.current.getCanvas();
          if (gameCanvas) {
            const syntheticEvent = new MouseEvent("click", {
              clientX: x,
              clientY: gameY,
              bubbles: true,
            });
            gameCanvas.dispatchEvent(syntheticEvent);
          }
        }
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#1a1a1a",
        padding: "20px",
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        style={{
          border: "2px solid #4a5568",
          borderRadius: "8px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          cursor: "default",
        }}
      />
      <ContactForm
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
      />
    </div>
  );
};
