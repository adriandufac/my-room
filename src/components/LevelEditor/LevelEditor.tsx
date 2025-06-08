import React, { useState, useRef, useEffect, useCallback } from "react";
import type {
  LevelData,
  EditorState,
  Vector2D,
  PlatformData,
  EnemyData,
  ProjectileSpawnerData,
} from "../../game/utils/Types";
import {
  EditorTool,
  PlatformType,
  EnemyType,
} from "../../game/utils/Types";
import { GAME_CONFIG } from "../../game/utils/Constants";

interface LevelEditorProps {
  onSave?: (levelData: LevelData) => void;
  onTest?: (levelData: LevelData) => void;
  initialLevel?: LevelData;
}

export const LevelEditor: React.FC<LevelEditorProps> = ({
  onSave,
  onTest,
  initialLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    currentTool: EditorTool.PLATFORM,
    selectedObject: null,
    gridSize: 40,
    snapToGrid: true,
    showGrid: true,
    cameraPosition: { x: 0, y: 0 },
    zoom: 1,
  });

  const [levelData, setLevelData] = useState<LevelData>(
    () =>
      initialLevel || {
        id: `level_${Date.now()}`,
        name: "Nouveau Niveau",
        width: GAME_CONFIG.LEVEL.DEFAULT_WIDTH,
        height: GAME_CONFIG.LEVEL.DEFAULT_HEIGHT,
        playerStart: { x: 100, y: 500 },
        finishLine: { x: 2200, y: 0 },
        platforms: [],
        enemies: [],
        projectileSpawners: [],
        version: "1.0.0",
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      }
  );

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<Vector2D>({ x: 0, y: 0 });

  // Conversion coordonn�es �cran vers monde
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Vector2D => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const x =
        (screenX - rect.left) / editorState.zoom + editorState.cameraPosition.x;
      const y =
        (screenY - rect.top) / editorState.zoom + editorState.cameraPosition.y;

      if (editorState.snapToGrid) {
        return {
          x: Math.round(x / editorState.gridSize) * editorState.gridSize,
          y: Math.round(y / editorState.gridSize) * editorState.gridSize,
        };
      }

      return { x, y };
    },
    [editorState]
  );

  // G�n�ration d'ID unique
  const generateId = useCallback(() => {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Placement d'objet
  const placeObject = useCallback(
    (worldPos: Vector2D) => {
      const newLevelData = { ...levelData };
      newLevelData.modified = new Date().toISOString();

      switch (editorState.currentTool) {
        case EditorTool.PLATFORM:
          const platformData: PlatformData = {
            id: generateId(),
            position: worldPos,
            size: { x: 120, y: 20 },
            type: PlatformType.SOLID,
            color: "#4CAF50",
          };
          newLevelData.platforms.push(platformData);
          break;

        case EditorTool.ENEMY:
          const enemyData: EnemyData = {
            id: generateId(),
            position: worldPos,
            size: { x: 30, y: 30 },
            type: EnemyType.BASIC,
            color: "#FF5722",
            properties: {
              patrolDistance: 100,
              speed: 50,
              direction: 1,
            },
          };
          newLevelData.enemies.push(enemyData);
          break;

        case EditorTool.PROJECTILE_SPAWNER:
          const spawnerData: ProjectileSpawnerData = {
            id: generateId(),
            position: worldPos,
            direction: 1,
            interval: 3000,
            color: "#FF9800",
            properties: {
              speed: 100,
              lifetime: 5000,
            },
          };
          newLevelData.projectileSpawners.push(spawnerData);
          break;

        case EditorTool.SPAWN_POINT:
          newLevelData.playerStart = worldPos;
          break;

        case EditorTool.FINISH_LINE:
          newLevelData.finishLine = worldPos;
          break;
      }

      setLevelData(newLevelData);
    },
    [levelData, editorState.currentTool, generateId]
  );

  // Suppression d'objet
  const removeObject = useCallback(
    (worldPos: Vector2D) => {
      const newLevelData = { ...levelData };
      newLevelData.modified = new Date().toISOString();

      // Supprimer plateformes
      newLevelData.platforms = newLevelData.platforms.filter((platform) => {
        const bounds = {
          x: platform.position.x,
          y: platform.position.y,
          width: platform.size.x,
          height: platform.size.y,
        };
        return !(
          worldPos.x >= bounds.x &&
          worldPos.x <= bounds.x + bounds.width &&
          worldPos.y >= bounds.y &&
          worldPos.y <= bounds.y + bounds.height
        );
      });

      // Supprimer ennemis
      newLevelData.enemies = newLevelData.enemies.filter((enemy) => {
        const bounds = {
          x: enemy.position.x,
          y: enemy.position.y,
          width: enemy.size.x,
          height: enemy.size.y,
        };
        return !(
          worldPos.x >= bounds.x &&
          worldPos.x <= bounds.x + bounds.width &&
          worldPos.y >= bounds.y &&
          worldPos.y <= bounds.y + bounds.height
        );
      });

      // Supprimer spawners
      newLevelData.projectileSpawners = newLevelData.projectileSpawners.filter(
        (spawner) => {
          const bounds = {
            x: spawner.position.x,
            y: spawner.position.y,
            width: 20,
            height: 20,
          };
          return !(
            worldPos.x >= bounds.x &&
            worldPos.x <= bounds.x + bounds.width &&
            worldPos.y >= bounds.y &&
            worldPos.y <= bounds.y + bounds.height
          );
        }
      );

      setLevelData(newLevelData);
    },
    [levelData]
  );

  // Gestionnaires de souris
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setIsMouseDown(true);
      setLastMousePos(worldPos);

      if (e.button === 0) {
        // Clic gauche
        if (editorState.currentTool === EditorTool.ERASE) {
          removeObject(worldPos);
        } else {
          placeObject(worldPos);
        }
      } else if (e.button === 2) {
        // Clic droit
        removeObject(worldPos);
      }
    },
    [screenToWorld, editorState.currentTool, placeObject, removeObject]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const worldPos = screenToWorld(e.clientX, e.clientY);

      if (isMouseDown && e.buttons === 4) {
        // Molette enfonc�e pour pan
        const deltaX = worldPos.x - lastMousePos.x;
        const deltaY = worldPos.y - lastMousePos.y;

        setEditorState((prev) => ({
          ...prev,
          cameraPosition: {
            x: Math.max(
              0,
              Math.min(levelData.width - 1200, prev.cameraPosition.x - deltaX)
            ),
            y: Math.max(
              0,
              Math.min(levelData.height - 600, prev.cameraPosition.y - deltaY)
            ),
          },
        }));
      }

      setLastMousePos(worldPos);
    },
    [
      screenToWorld,
      isMouseDown,
      lastMousePos,
      levelData.width,
      levelData.height,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  // Pr�venir le menu contextuel
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Rendu du canvas
  const renderEditor = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Appliquer transformation cam�ra
    ctx.save();
    ctx.scale(editorState.zoom, editorState.zoom);
    ctx.translate(-editorState.cameraPosition.x, -editorState.cameraPosition.y);

    // Dessiner le fond
    ctx.fillStyle = "#E3F2FD";
    ctx.fillRect(0, 0, levelData.width, levelData.height);

    // Dessiner la grille
    if (editorState.showGrid) {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 1;

      for (let x = 0; x <= levelData.width; x += editorState.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, levelData.height);
        ctx.stroke();
      }

      for (let y = 0; y <= levelData.height; y += editorState.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(levelData.width, y);
        ctx.stroke();
      }
    }

    // Dessiner les plateformes
    levelData.platforms.forEach((platform) => {
      ctx.fillStyle = platform.color;
      ctx.fillRect(
        platform.position.x,
        platform.position.y,
        platform.size.x,
        platform.size.y
      );
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        platform.position.x,
        platform.position.y,
        platform.size.x,
        platform.size.y
      );
    });

    // Dessiner les ennemis
    levelData.enemies.forEach((enemy) => {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(
        enemy.position.x,
        enemy.position.y,
        enemy.size.x,
        enemy.size.y
      );
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        enemy.position.x,
        enemy.position.y,
        enemy.size.x,
        enemy.size.y
      );

      // Dessiner la zone de patrouille
      ctx.strokeStyle = "rgba(255, 87, 34, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        enemy.position.x - enemy.properties.patrolDistance / 2,
        enemy.position.y,
        enemy.properties.patrolDistance,
        enemy.size.y
      );
    });

    // Dessiner les spawners de projectiles
    levelData.projectileSpawners.forEach((spawner) => {
      ctx.fillStyle = spawner.color;
      ctx.fillRect(spawner.position.x, spawner.position.y, 20, 20);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.strokeRect(spawner.position.x, spawner.position.y, 20, 20);

      // Fl�che pour la direction
      ctx.fillStyle = "#333";
      ctx.fillText(
        spawner.direction > 0 ? "�" : "�",
        spawner.position.x + 6,
        spawner.position.y + 15
      );
    });

    // Dessiner le point de spawn
    ctx.fillStyle = "rgba(76, 175, 80, 0.7)";
    ctx.fillRect(
      levelData.playerStart.x - 15,
      levelData.playerStart.y - 15,
      30,
      30
    );
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      levelData.playerStart.x - 15,
      levelData.playerStart.y - 15,
      30,
      30
    );
    ctx.fillStyle = "#333";
    ctx.font = "16px Arial";
    ctx.fillText("S", levelData.playerStart.x - 5, levelData.playerStart.y + 5);

    // Dessiner la ligne d'arriv�e
    ctx.fillStyle = "rgba(255, 215, 0, 0.7)";
    ctx.fillRect(
      levelData.finishLine.x - 15,
      levelData.finishLine.y - 15,
      30,
      600
    );
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      levelData.finishLine.x - 15,
      levelData.finishLine.y - 15,
      30,
      600
    );
    ctx.fillStyle = "#333";
    ctx.font = "16px Arial";
    ctx.fillText("F", levelData.finishLine.x - 5, levelData.finishLine.y + 5);

    ctx.restore();
  }, [editorState, levelData]);

  // Effet pour le rendu
  useEffect(() => {
    renderEditor();
  }, [renderEditor]);

  // Initialiser le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1200;
    canvas.height = 600;
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Barre d'outils */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#333",
          color: "white",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>�diteur de Niveau: {levelData.name}</h3>

        <div style={{ display: "flex", gap: "5px" }}>
          {Object.values(EditorTool).map((tool) => (
            <button
              key={tool}
              onClick={() =>
                setEditorState((prev) => ({ ...prev, currentTool: tool }))
              }
              style={{
                padding: "8px 12px",
                backgroundColor:
                  editorState.currentTool === tool ? "#4CAF50" : "#666",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {tool === EditorTool.PLATFORM && "=� Plateforme"}
              {tool === EditorTool.ENEMY && "=~ Ennemi"}
              {tool === EditorTool.PROJECTILE_SPAWNER && "=� Projectile"}
              {tool === EditorTool.SPAWN_POINT && "<� Spawn"}
              {tool === EditorTool.FINISH_LINE && "<� Arriv�e"}
              {tool === EditorTool.ERASE && "=� Effacer"}
              {tool === EditorTool.SELECT && "=F S�lection"}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <button
            onClick={() =>
              setEditorState((prev) => ({ ...prev, showGrid: !prev.showGrid }))
            }
            style={{
              padding: "8px 12px",
              backgroundColor: editorState.showGrid ? "#4CAF50" : "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Grille
          </button>

          {onTest && (
            <button
              onClick={() => onTest(levelData)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🎮 Tester
            </button>
          )}

          {onSave && (
            <button
              onClick={() => onSave(levelData)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              💾 Sauvegarder
            </button>
          )}
        </div>
      </div>

      {/* Canvas d'édition */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
          style={{
            border: "2px solid #333",
            cursor:
              editorState.currentTool === EditorTool.ERASE
                ? "crosshair"
                : "default",
            backgroundColor: "#fff",
          }}
        />

        {/* Informations de position */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          Cam�ra: ({editorState.cameraPosition.x.toFixed(0)},{" "}
          {editorState.cameraPosition.y.toFixed(0)}) | Zoom:{" "}
          {(editorState.zoom * 100).toFixed(0)}% | Objets:{" "}
          {levelData.platforms.length} plateformes, {levelData.enemies.length}{" "}
          ennemis, {levelData.projectileSpawners.length} spawners
        </div>
      </div>
    </div>
  );
};
