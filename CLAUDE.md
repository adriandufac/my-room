# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production (TypeScript compilation + Vite build)
npm run lint         # Run ESLint
npm run preview      # Preview production build

# TypeScript compilation happens during build
tsc -b               # Manual TypeScript build (part of npm run build)
```

## Project Architecture

This is a React + TypeScript + Vite project with two main applications:

### 1. 3D Room Experience (`src/Experience/`)
- **RoomExperience.ts**: Main Three.js experience singleton managing scene, camera, lighting
- **Room.ts**: Main room controller that loads furniture and manages 3D objects
- **SunCycle.ts**: Dynamic lighting system that simulates day/night cycle
- **Objects/**: Individual furniture classes (Chair, Desk, Cat, etc.) extending FurnitureItem
- **Utils/**: Core utilities (Time, Sizes, EventEmitter, ModelLoader, MaterialFactory)
- **furniture-layout.json**: Configuration file defining room layout, furniture positions, and lighting

The 3D experience uses:
- Three.js for 3D rendering with OrbitControls
- GLTF models in `/public/models/` directory
- Dat.GUI for debug controls
- Custom shader materials (smoke effects in `Objects/smoke/`)

### 2. 2D Platform Game (`src/game/`)
- **core/Game.ts**: Main game controller with full 2D platformer implementation
- **core/GameLoop.ts**: 60 FPS game loop with pause/resume functionality
- **entities/**: Game objects (Player, Enemy, Platform, Projectile)
- **physics/**: Custom physics engine with collision detection
- **renderer/**: 2D canvas rendering system with camera
- **levels/**: Level management and generation system

### React Components Structure
- **App.tsx**: Main app entry point, currently showing GameCanvas
- **components/Game/**: 2D game React components and canvas wrapper
- **components/LevelEditor/**: Level editor components (appears unused)
- **components/RoomScene.tsx**: 3D room React component wrapper
- **components/UI/**: UI components (LightControls, MusicPlayer)

## Key Technical Details

### 3D Experience Architecture
- Singleton pattern for RoomExperience - access via `window.experience`
- Event-driven updates using custom EventEmitter
- Model loading uses GLTF format with texture support
- Shadow mapping enabled with PCF soft shadows
- Materials support PBR workflow (baseColor, metallicRoughness, normal maps)

### 2D Game Architecture
- Entity-component system for game objects
- Separated axis collision detection and resolution
- Camera follows player with smooth interpolation
- Extended level (2400x600px) with enemies, platforms, and special zones
- Input management supports keyboard controls with proper state tracking

### Build Configuration
- Vite with React plugin and GLSL shader support (`vite-plugin-glsl`)
- TypeScript with strict configuration
- ESLint with React and TypeScript rules
- Assets served from `/public/` directory

## Asset Structure

```
public/
├── models/           # GLTF 3D models with textures
├── audio/           # Lofi music tracks and vinyl sound effects
└── textures/        # Additional texture assets (floor, perlin noise)
```

Models follow naming convention: `scene.gltf` + `scene.bin` + `/textures/` folder

## Important Notes

- The project currently renders the 2D game by default (GameCanvas in App.tsx)
- 3D room experience is available but not currently displayed
- Both systems are fully functional and can run independently
- Level editor components exist but appear to be unused
- Music player supports lofi background tracks with vinyl effects

## Code Style Guidelines

**CRITICAL: NO EMOJIS IN CODE**
- NEVER use emojis in console.log, console.error, comments, or any code
- Emojis cause severe Unicode encoding issues that break the build
- Use text prefixes instead: [GAME], [ERROR], [SUCCESS], [LEVEL], [WARNING], [SAVE], [DELETE], [IMPORT], [FILE], [COPY], [DEBUG]
- This rule applies to ALL files in the project
- If you see any emojis in existing code, replace them immediately with text prefixes