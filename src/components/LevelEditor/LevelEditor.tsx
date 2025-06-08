import React, { useState, useRef, useEffect, useCallback } from "react";
import type {
  LevelData,
  EditorState,
  Vector2D,
  PlatformData,
  EnemyData,
  ProjectileSpawnerData,
} from "../../game/utils/Types";
import { EditorTool, PlatformType, EnemyType } from "../../game/utils/Types";
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
    gridSize: 20,
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
  const [mouseWorldPos, setMouseWorldPos] = useState<Vector2D>({ x: 0, y: 0 });
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placingObjectData, setPlacingObjectData] = useState<any>(null);

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

  // Génération d'ID unique
  const generateId = useCallback(() => {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Vérification de collision/superposition
  const checkCollision = useCallback(
    (pos: Vector2D, size: Vector2D, toolType?: EditorTool): boolean => {
      // Ajuster la position selon le type d'objet
      let adjustedPos = pos;
      if (toolType === EditorTool.ENEMY) {
        adjustedPos = { x: pos.x, y: pos.y - size.y };
      }

      // Vérifier collision avec plateformes
      for (const platform of levelData.platforms) {
        if (
          adjustedPos.x < platform.position.x + platform.size.x &&
          adjustedPos.x + size.x > platform.position.x &&
          adjustedPos.y < platform.position.y + platform.size.y &&
          adjustedPos.y + size.y > platform.position.y
        ) {
          return true;
        }
      }

      // Vérifier collision avec ennemis
      for (const enemy of levelData.enemies) {
        if (
          adjustedPos.x < enemy.position.x + enemy.size.x &&
          adjustedPos.x + size.x > enemy.position.x &&
          adjustedPos.y < enemy.position.y + enemy.size.y &&
          adjustedPos.y + size.y > enemy.position.y
        ) {
          return true;
        }
      }

      // Vérifier collision avec spawners
      for (const spawner of levelData.projectileSpawners) {
        if (
          adjustedPos.x < spawner.position.x + 20 &&
          adjustedPos.x + size.x > spawner.position.x &&
          adjustedPos.y < spawner.position.y + 20 &&
          adjustedPos.y + size.y > spawner.position.y
        ) {
          return true;
        }
      }

      return false;
    },
    [levelData]
  );

  // Obtenir la taille de l'objet selon l'outil
  const getObjectSize = useCallback((tool: EditorTool): Vector2D => {
    switch (tool) {
      case EditorTool.PLATFORM:
        return { x: 120, y: 20 };
      case EditorTool.ENEMY:
        return { x: 30, y: 30 };
      case EditorTool.PROJECTILE_SPAWNER:
        return { x: 20, y: 20 };
      case EditorTool.SPAWN_POINT:
      case EditorTool.FINISH_LINE:
        return { x: 30, y: 30 };
      default:
        return { x: 20, y: 20 };
    }
  }, []);

  // Trouver un objet à une position donnée
  const findObjectAtPosition = useCallback(
    (pos: Vector2D): { id: string; type: string } | null => {
      // Vérifier plateformes
      for (const platform of levelData.platforms) {
        if (
          pos.x >= platform.position.x &&
          pos.x <= platform.position.x + platform.size.x &&
          pos.y >= platform.position.y &&
          pos.y <= platform.position.y + platform.size.y
        ) {
          return { id: platform.id, type: "platform" };
        }
      }

      // Vérifier ennemis
      for (const enemy of levelData.enemies) {
        if (
          pos.x >= enemy.position.x &&
          pos.x <= enemy.position.x + enemy.size.x &&
          pos.y >= enemy.position.y &&
          pos.y <= enemy.position.y + enemy.size.y
        ) {
          return { id: enemy.id, type: "enemy" };
        }
      }

      // Vérifier spawners
      for (const spawner of levelData.projectileSpawners) {
        if (
          pos.x >= spawner.position.x &&
          pos.x <= spawner.position.x + 20 &&
          pos.y >= spawner.position.y &&
          pos.y <= spawner.position.y + 20
        ) {
          return { id: spawner.id, type: "spawner" };
        }
      }

      return null;
    },
    [levelData]
  );

  // Déplacer un objet sélectionné
  const moveSelectedObject = useCallback(
    (newPos: Vector2D) => {
      if (!selectedObjectId) return;

      const newLevelData = { ...levelData };
      newLevelData.modified = new Date().toISOString();

      // Trouver et déplacer l'objet
      const platform = newLevelData.platforms.find(
        (p) => p.id === selectedObjectId
      );
      if (platform) {
        platform.position = newPos;
        setLevelData(newLevelData);
        return;
      }

      const enemy = newLevelData.enemies.find((e) => e.id === selectedObjectId);
      if (enemy) {
        enemy.position = newPos;
        setLevelData(newLevelData);
        return;
      }

      const spawner = newLevelData.projectileSpawners.find(
        (s) => s.id === selectedObjectId
      );
      if (spawner) {
        spawner.position = newPos;
        setLevelData(newLevelData);
        return;
      }
    },
    [selectedObjectId, levelData]
  );

  // Créer les données d'un nouvel objet
  const createObjectData = useCallback(
    (tool: EditorTool, worldPos: Vector2D) => {
      switch (tool) {
        case EditorTool.PLATFORM:
          return {
            id: generateId(),
            position: worldPos,
            size: { x: 120, y: 20 },
            type: PlatformType.SOLID,
            color: "#4CAF50",
          };

        case EditorTool.ENEMY:
          return {
            id: generateId(),
            position: { x: worldPos.x, y: worldPos.y - 30 }, // Décaler vers le haut pour que les "pieds" soient sur la grille
            size: { x: 30, y: 30 },
            type: EnemyType.BASIC,
            color: "#FF5722",
            properties: {
              patrolDistance: 100,
              speed: 50,
              direction: 1,
            },
          };

        case EditorTool.PROJECTILE_SPAWNER:
          return {
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

        default:
          return null;
      }
    },
    [generateId]
  );

  // Commencer le placement (au mouseDown)
  const startPlacing = useCallback(
    (worldPos: Vector2D) => {
      const objectData = createObjectData(editorState.currentTool, worldPos);
      if (objectData) {
        setIsPlacing(true);
        setPlacingObjectData(objectData);
      }
    },
    [editorState.currentTool, createObjectData]
  );

  // Finaliser le placement (au mouseUp)
  const finalizePlacement = useCallback(() => {
    if (!isPlacing || !placingObjectData) return;

    // Vérifier les collisions pour les objets qui peuvent se superposer
    if (
      editorState.currentTool !== EditorTool.SPAWN_POINT &&
      editorState.currentTool !== EditorTool.FINISH_LINE
    ) {
      const objectSize = getObjectSize(editorState.currentTool);

      // Pour l'ennemi, utiliser la position originale avant ajustement (ses "pieds")
      let positionToCheck = placingObjectData.position;
      if (editorState.currentTool === EditorTool.ENEMY) {
        positionToCheck = {
          x: placingObjectData.position.x,
          y: placingObjectData.position.y + objectSize.y,
        };
      }

      if (
        checkCollision(positionToCheck, objectSize, editorState.currentTool)
      ) {
        console.log("❌ Impossible de placer l'objet : superposition détectée");
        setIsPlacing(false);
        setPlacingObjectData(null);
        return;
      }
    }

    const newLevelData = { ...levelData };
    newLevelData.modified = new Date().toISOString();

    switch (editorState.currentTool) {
      case EditorTool.PLATFORM:
        newLevelData.platforms.push(placingObjectData as PlatformData);
        break;
      case EditorTool.ENEMY:
        newLevelData.enemies.push(placingObjectData as EnemyData);
        break;
      case EditorTool.PROJECTILE_SPAWNER:
        newLevelData.projectileSpawners.push(
          placingObjectData as ProjectileSpawnerData
        );
        break;
      case EditorTool.SPAWN_POINT:
        newLevelData.playerStart = placingObjectData.position;
        break;
      case EditorTool.FINISH_LINE:
        newLevelData.finishLine = placingObjectData.position;
        break;
    }

    setLevelData(newLevelData);
    setIsPlacing(false);
    setPlacingObjectData(null);
  }, [
    isPlacing,
    placingObjectData,
    levelData,
    editorState.currentTool,
    checkCollision,
    getObjectSize,
  ]);

  // Mettre à jour la position pendant le placement
  const updatePlacingPosition = useCallback(
    (worldPos: Vector2D) => {
      if (isPlacing && placingObjectData) {
        setPlacingObjectData(
          (prev: PlatformData | EnemyData | ProjectileSpawnerData | null) => ({
            ...prev,
            position: worldPos,
          })
        );
      }
    },
    [isPlacing, placingObjectData]
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
        if (editorState.currentTool === EditorTool.SELECT) {
          const foundObject = findObjectAtPosition(worldPos);
          if (foundObject) {
            setSelectedObjectId(foundObject.id);
            setIsDragging(true);
            console.log(
              `🎯 Objet sélectionné: ${foundObject.type} (${foundObject.id})`
            );
          } else {
            setSelectedObjectId(null);
            setIsDragging(false);
          }
        } else if (editorState.currentTool === EditorTool.ERASE) {
          removeObject(worldPos);
        } else if (
          editorState.currentTool === EditorTool.SPAWN_POINT ||
          editorState.currentTool === EditorTool.FINISH_LINE
        ) {
          // Placement immédiat pour spawn et finish (pas besoin de drag)
          const newLevelData = { ...levelData };
          newLevelData.modified = new Date().toISOString();

          if (editorState.currentTool === EditorTool.SPAWN_POINT) {
            newLevelData.playerStart = worldPos;
          } else {
            newLevelData.finishLine = worldPos;
          }

          setLevelData(newLevelData);
        } else {
          // Commencer le placement avec drag
          startPlacing(worldPos);
        }
      } else if (e.button === 2) {
        // Clic droit
        removeObject(worldPos);
      }
    },
    [
      screenToWorld,
      editorState.currentTool,
      removeObject,
      findObjectAtPosition,
      startPlacing,
      levelData,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setMouseWorldPos(worldPos); // Mettre à jour la position pour la prévisualisation

      // Déplacement d'objet en cours de placement
      if (isPlacing && isMouseDown) {
        updatePlacingPosition(worldPos);
      }

      // Déplacement d'objet sélectionné
      if (
        isDragging &&
        selectedObjectId &&
        editorState.currentTool === EditorTool.SELECT &&
        isMouseDown
      ) {
        moveSelectedObject(worldPos);
      }

      if (isMouseDown && e.buttons === 4) {
        // Molette enfoncée pour pan
        const deltaX = worldPos.x - lastMousePos.x;
        const deltaY = worldPos.y - lastMousePos.y;

        setEditorState((prev) => ({
          ...prev,
          cameraPosition: {
            x: Math.max(
              -500, // Permettre de naviguer 500px à gauche du niveau
              Math.min(
                levelData.width + 500 - 1200,
                prev.cameraPosition.x - deltaX
              )
            ),
            y: Math.max(
              -500, // Permettre de naviguer 500px au-dessus du niveau
              Math.min(
                levelData.height + 500 - 600,
                prev.cameraPosition.y - deltaY
              )
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
      isDragging,
      selectedObjectId,
      editorState.currentTool,
      moveSelectedObject,
      isPlacing,
      updatePlacingPosition,
    ]
  );

  const handleMouseUp = useCallback(() => {
    // Finaliser le placement si on était en train de placer
    if (isPlacing) {
      finalizePlacement();
    }

    setIsMouseDown(false);
    setIsDragging(false);
  }, [isPlacing, finalizePlacement]);

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

    // Dessiner le fond étendu de l'espace de travail
    const workspaceExtension = 500;
    ctx.fillStyle = "#F5F5F5"; // Gris clair pour la zone étendue
    ctx.fillRect(
      -workspaceExtension,
      -workspaceExtension,
      levelData.width + workspaceExtension * 2,
      levelData.height + workspaceExtension * 2
    );

    // Dessiner le fond du niveau proprement dit
    ctx.fillStyle = "#E3F2FD";
    ctx.fillRect(0, 0, levelData.width, levelData.height);

    // Bordure du niveau pour bien le distinguer
    ctx.strokeStyle = "#1976D2";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, levelData.width, levelData.height);

    // Dessiner la grille étendue
    if (editorState.showGrid) {
      const gridExtension = 500; // Extension de 500px dans toutes les directions

      // Grille principale (zone de niveau)
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 1;

      for (
        let x = -gridExtension;
        x <= levelData.width + gridExtension;
        x += editorState.gridSize
      ) {
        ctx.beginPath();
        ctx.moveTo(x, -gridExtension);
        ctx.lineTo(x, levelData.height + gridExtension);
        ctx.stroke();
      }

      for (
        let y = -gridExtension;
        y <= levelData.height + gridExtension;
        y += editorState.gridSize
      ) {
        ctx.beginPath();
        ctx.moveTo(-gridExtension, y);
        ctx.lineTo(levelData.width + gridExtension, y);
        ctx.stroke();
      }

      // Grille plus visible dans la zone du niveau
      ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
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

      // Bordure normale ou sélection
      if (selectedObjectId === platform.id) {
        ctx.strokeStyle = "#FFD700"; // Or pour la sélection
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
      }

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

      // Bordure normale ou sélection
      if (selectedObjectId === enemy.id) {
        ctx.strokeStyle = "#FFD700"; // Or pour la sélection
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
      }

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

      // Bordure normale ou sélection
      if (selectedObjectId === spawner.id) {
        ctx.strokeStyle = "#FFD700"; // Or pour la sélection
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
      }

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

    // Dessiner l'objet en cours de placement
    if (isPlacing && placingObjectData) {
      const objectSize = getObjectSize(editorState.currentTool);

      // Pour l'ennemi, vérifier collision avec la position des "pieds"
      let positionToCheck = placingObjectData.position;
      if (editorState.currentTool === EditorTool.ENEMY) {
        positionToCheck = {
          x: placingObjectData.position.x,
          y: placingObjectData.position.y + objectSize.y,
        };
      }

      const hasCollision =
        editorState.currentTool !== EditorTool.SPAWN_POINT &&
        editorState.currentTool !== EditorTool.FINISH_LINE &&
        checkCollision(positionToCheck, objectSize, editorState.currentTool);

      // Couleur de placement selon la collision
      ctx.fillStyle = hasCollision
        ? "rgba(255, 0, 0, 0.7)"
        : "rgba(0, 255, 0, 0.7)";
      ctx.strokeStyle = hasCollision ? "#FF0000" : "#00FF00";
      ctx.lineWidth = 3;

      switch (editorState.currentTool) {
        case EditorTool.PLATFORM:
          ctx.fillRect(
            placingObjectData.position.x,
            placingObjectData.position.y,
            objectSize.x,
            objectSize.y
          );
          ctx.strokeRect(
            placingObjectData.position.x,
            placingObjectData.position.y,
            objectSize.x,
            objectSize.y
          );
          break;

        case EditorTool.ENEMY:
          ctx.fillRect(
            placingObjectData.position.x,
            placingObjectData.position.y,
            objectSize.x,
            objectSize.y
          );
          ctx.strokeRect(
            placingObjectData.position.x,
            placingObjectData.position.y,
            objectSize.x,
            objectSize.y
          );
          // Zone de patrouille
          ctx.strokeStyle = "rgba(255, 87, 34, 0.5)";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            placingObjectData.position.x - 50,
            placingObjectData.position.y,
            100,
            objectSize.y
          );
          break;

        case EditorTool.PROJECTILE_SPAWNER:
          ctx.fillRect(
            placingObjectData.position.x,
            placingObjectData.position.y,
            objectSize.x,
            objectSize.y
          );
          ctx.strokeRect(
            placingObjectData.position.x,
            placingObjectData.position.y,
            objectSize.x,
            objectSize.y
          );
          break;
      }
    }
    // Dessiner la prévisualisation fantôme (seulement si pas en train de placer)
    else if (
      !isPlacing &&
      editorState.currentTool !== EditorTool.SELECT &&
      editorState.currentTool !== EditorTool.ERASE
    ) {
      const objectSize = getObjectSize(editorState.currentTool);
      const hasCollision =
        editorState.currentTool !== EditorTool.SPAWN_POINT &&
        editorState.currentTool !== EditorTool.FINISH_LINE &&
        checkCollision(mouseWorldPos, objectSize, editorState.currentTool);

      // Couleur de prévisualisation selon la collision
      ctx.fillStyle = hasCollision
        ? "rgba(255, 0, 0, 0.3)"
        : "rgba(0, 255, 0, 0.3)";
      ctx.strokeStyle = hasCollision
        ? "rgba(255, 0, 0, 0.8)"
        : "rgba(0, 255, 0, 0.8)";
      ctx.lineWidth = 2;

      switch (editorState.currentTool) {
        case EditorTool.PLATFORM:
          ctx.fillRect(
            mouseWorldPos.x,
            mouseWorldPos.y,
            objectSize.x,
            objectSize.y
          );
          ctx.strokeRect(
            mouseWorldPos.x,
            mouseWorldPos.y,
            objectSize.x,
            objectSize.y
          );
          break;

        case EditorTool.ENEMY:
          // Dessiner l'ennemi avec ses "pieds" sur la grille
          ctx.fillRect(
            mouseWorldPos.x,
            mouseWorldPos.y - objectSize.y,
            objectSize.x,
            objectSize.y
          );
          ctx.strokeRect(
            mouseWorldPos.x,
            mouseWorldPos.y - objectSize.y,
            objectSize.x,
            objectSize.y
          );
          // Prévisualisation de la zone de patrouille
          ctx.strokeStyle = "rgba(255, 87, 34, 0.3)";
          ctx.lineWidth = 1;
          ctx.strokeRect(
            mouseWorldPos.x - 50,
            mouseWorldPos.y - objectSize.y,
            100,
            objectSize.y
          );
          break;

        case EditorTool.PROJECTILE_SPAWNER:
          ctx.fillRect(
            mouseWorldPos.x,
            mouseWorldPos.y,
            objectSize.x,
            objectSize.y
          );
          ctx.strokeRect(
            mouseWorldPos.x,
            mouseWorldPos.y,
            objectSize.x,
            objectSize.y
          );
          break;

        case EditorTool.SPAWN_POINT:
          ctx.fillRect(mouseWorldPos.x - 15, mouseWorldPos.y - 15, 30, 30);
          ctx.strokeRect(mouseWorldPos.x - 15, mouseWorldPos.y - 15, 30, 30);
          break;

        case EditorTool.FINISH_LINE:
          ctx.fillRect(mouseWorldPos.x - 15, mouseWorldPos.y - 15, 30, 600);
          ctx.strokeRect(mouseWorldPos.x - 15, mouseWorldPos.y - 15, 30, 600);
          break;
      }
    }

    ctx.restore();
  }, [
    editorState,
    levelData,
    mouseWorldPos,
    getObjectSize,
    checkCollision,
    selectedObjectId,
    isPlacing,
    placingObjectData,
  ]);

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
              setEditorState((prev) => ({
                ...prev,
                cameraPosition: { x: 0, y: 0 },
              }))
            }
            style={{
              padding: "8px 12px",
              backgroundColor: "#9C27B0",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🏠 Centrer
          </button>

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
          Caméra: ({editorState.cameraPosition.x.toFixed(0)},{" "}
          {editorState.cameraPosition.y.toFixed(0)}) | Zoom:{" "}
          {(editorState.zoom * 100).toFixed(0)}% | Zone:{" "}
          {mouseWorldPos.x >= 0 &&
          mouseWorldPos.x <= levelData.width &&
          mouseWorldPos.y >= 0 &&
          mouseWorldPos.y <= levelData.height
            ? "🎯 Niveau"
            : "🌐 Hors niveau"}{" "}
          | Objets: {levelData.platforms.length} plateformes,{" "}
          {levelData.enemies.length} ennemis,{" "}
          {levelData.projectileSpawners.length} spawners
        </div>
      </div>
    </div>
  );
};
