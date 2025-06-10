# 🏗️ MY-ROOM Project Architecture

## 📊 Overview

MY-ROOM is a unique hybrid application that combines an interactive 3D room experience with a complete 2D platformer game, all orchestrated through a modern React interface. This document provides a comprehensive overview of the project's architecture, design patterns, and system interactions.

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MY-ROOM Application                       │
├─────────────────────────────────────────────────────────────┤
│  ⚛️ React UI Layer                                          │
│  ├── App.tsx (Entry Point)                                 │
│  ├── RoomScene.tsx (3D Container)                          │
│  ├── GameCanvas.tsx (2D Container)                         │
│  └── UI Components (MusicPlayer, LightControls)            │
├─────────────────────────────────────────────────────────────┤
│  🌐 3D Room Experience (Three.js)                          │
│  ├── RoomExperience.ts (Main Singleton)                    │
│  ├── Room.ts (Furniture Manager)                           │
│  ├── SunCycle.ts (Dynamic Lighting)                        │
│  └── Objects/ (Interactive Furniture)                      │
├─────────────────────────────────────────────────────────────┤
│  🎯 2D Platform Game (Canvas)                              │
│  ├── Game.ts (Core Engine)                                 │
│  ├── GameLoop.ts (60 FPS Loop)                             │
│  ├── Systems/ (Physics, Input, Collision)                  │
│  └── Entities/ (Player, Enemy, Platform)                   │
├─────────────────────────────────────────────────────────────┤
│  📁 Asset Management                                        │
│  ├── 3D Models (GLTF + Textures)                          │
│  ├── Audio (LoFi Music)                                    │
│  ├── 2D Sprites (Player Animations)                        │
│  └── Level Data (JSON)                                     │
└─────────────────────────────────────────────────────────────┘
```

## 🌐 3D Room Experience Architecture

### Core Singleton Pattern

The 3D experience is built around a singleton pattern for centralized management:

```typescript
// Global access pattern
RoomExperience (window.experience)
├── Scene Management
│   ├── THREE.Scene - 3D Scene
│   ├── THREE.PerspectiveCamera - Camera System
│   ├── THREE.WebGLRenderer - WebGL Rendering
│   └── OrbitControls - Camera Controls
├── Core Utilities
│   ├── EventEmitter - Event Communication
│   ├── Time - Temporal Management
│   ├── Sizes - Responsive Sizing
│   ├── ModelLoader - GLTF Loading
│   └── MaterialFactory - Toon Materials
├── Scene Objects
│   ├── Room.ts - Furniture Orchestrator
│   ├── Floor.ts - Textured Floor
│   ├── Walls.ts - CSG Walls
│   └── Roof.ts - Ceiling
├── Dynamic Lighting
│   ├── SunCycle - Day/Night Cycle
│   ├── DirectionalLight - Sun Light
│   ├── AmbientLight - Ambient Lighting
│   └── Shadow Mapping - PCF Shadows
└── Interactive Furniture
    ├── FurnitureItem (Abstract Base)
    ├── Chair, Desk, Cat, VinylePlayer...
    ├── Raycasting - Click Detection
    ├── Material System - PBR → Toon
    └── Debug GUI (dat.gui)
```

### Key Features

- **Model Loading**: GLTF format with automatic texture and material handling
- **Material System**: Automatic conversion to Toon materials for Miyazaki-style rendering
- **Interactive Objects**: Click/hover detection using raycasting
- **Dynamic Lighting**: Day/night cycle affecting all scene lighting
- **Special Effects**: Custom GLSL shaders for smoke and atmospheric effects
- **Debug Mode**: Comprehensive debug visualization with dat.GUI

## 🎯 2D Platform Game Architecture

### Game Engine Design

The 2D game follows an Entity-Component-System-like architecture:

```typescript
Game.ts (Main Controller)
├── Core Systems
│   ├── GameLoop - Fixed 60 FPS with deltaTime
│   ├── InputManager - AZERTY/QWERTY Support
│   ├── Renderer - Optimized Canvas 2D
│   ├── Camera - Smooth Player Following
│   └── CollisionDetector - AABB + SAT Resolution
├── Physics Engine
│   ├── Gravity (1200 px/s²)
│   ├── Friction (Air/Ground Differential)
│   ├── Air Control (Coyote Time)
│   └── Terminal Velocity Limiting
├── Entity Management
│   ├── Player - Movement + Animation States
│   ├── Enemies - AI with Patrol Patterns
│   ├── Platforms - Multiple Types (solid, falling, moving)
│   └── Projectiles - Physics-based with Spawners
├── Game States
│   ├── START_SCREEN - Controls + Instructions
│   ├── PLAYING - Main Gameplay
│   ├── PAUSED - Pause Menu
│   └── VICTORY - Completion Screen
└── Level System
    ├── 5 Built-in Levels (JSON Format)
    ├── Dynamic Level Loading
    ├── Smooth Transitions
    └── Start/Finish Zone Management
```

### Advanced Features

- **Physics**: Custom physics with realistic jumping, coyote time, air control
- **Animation System**: State-based sprite animations (idle, run, jump, fall)
- **AI System**: Enemy patrol patterns with collision detection
- **Level Progression**: 5 levels with increasing difficulty
- **Input Flexibility**: Support for both AZERTY and QWERTY keyboards
- **Debug Visualization**: F1 toggle for comprehensive debug information

## ⚛️ React Integration Layer

### Component Architecture

```jsx
App.tsx (Root Component)
├── Display State Management
│   ├── RoomScene (Default 3D View)
│   ├── GameCanvas (2D Game View)
│   └── Desktop (Windows Interface)
├── UI Components
│   ├── MusicPlayer.tsx
│   │   ├── HTML5 Audio Controls
│   │   ├── LoFi Playlist Management
│   │   └── 3D Vinyl Player Synchronization
│   ├── LightControls.tsx
│   │   ├── 3D Lighting Control Interface
│   │   └── Real-time Scene Updates
│   └── WindowsOverlay.tsx
│       ├── Computer Screen UI
│       └── Game Launch Interface
├── State Management
│   ├── Local React State
│   ├── Inter-Component Communication
│   └── Global Event System
└── Canvas Integration
    ├── Three.js Canvas Refs
    ├── 2D Game Canvas Refs
    └── Responsive Sizing
```

## 🔄 System Communication & Data Flow

### Inter-System Communication Patterns

```typescript
// 3D → React Communication
window.addEventListener('furniture-clicked', (event) => {
  const { furnitureType, position } = event.detail;
  // React responds to 3D interactions
});

// React → 3D Communication
const experience = window.experience;
experience.sunCycle.setTimeOfDay(0.5); // Control 3D scene

// 2D → React Communication
gameInstance.on('lives-changed', (lives: number) => {
  setPlayerLives(lives); // Update React state
});

// React → 2D Communication
const handleKeyPress = (key: string) => {
  gameInstance.inputManager.handleKey(key);
};
```

### Data Flow Diagram

```
User Input
    ↓
React UI Layer
    ↓
┌─────────────┬─────────────┐
│ 3D System   │ 2D System   │
│ (Three.js)  │ (Canvas)    │
└─────────────┴─────────────┘
    ↓             ↓
Asset Management System
    ↓
Visual/Audio Output
```

## 📁 File Structure & Organization

```
my-room/
├── src/
│   ├── Experience/ (3D System)
│   │   ├── RoomExperience.ts - Main Singleton
│   │   ├── Room.ts - Furniture Orchestrator
│   │   ├── Objects/ - Interactive Furniture
│   │   │   ├── FurnitureItem.ts - Abstract Base Class
│   │   │   ├── Chair.ts, Desk.ts, Cat.ts...
│   │   │   └── smoke/ - Particle Effects
│   │   ├── Utils/ - 3D Utilities
│   │   │   ├── ModelLoader.ts - GLTF Loading
│   │   │   ├── MaterialFactory.ts - Material Management
│   │   │   ├── EventEmitter.ts - Event System
│   │   │   ├── Time.ts - Animation Timing
│   │   │   └── Sizes.ts - Responsive Sizing
│   │   └── furniture-layout.json - Scene Configuration
│   ├── game/ (2D Engine)
│   │   ├── core/ - Core Systems
│   │   │   ├── Game.ts - Main Game Controller
│   │   │   ├── GameLoop.ts - Render Loop
│   │   │   ├── InputManager.ts - Input Handling
│   │   │   └── CollisionDetector.ts - Physics
│   │   ├── entities/ - Game Objects
│   │   │   ├── Player.ts - Player Character
│   │   │   ├── Enemy.ts - Enemy AI
│   │   │   ├── Platform.ts - Platform Types
│   │   │   └── Projectile.ts - Projectile Physics
│   │   ├── graphics/ - Rendering System
│   │   │   ├── Renderer.ts - Canvas Rendering
│   │   │   ├── Camera.ts - Camera System
│   │   │   └── SpriteManager.ts - Sprite Handling
│   │   ├── physics/ - Physics Engine
│   │   │   ├── Physics.ts - Physics Calculations
│   │   │   └── Vector2D.ts - Vector Math
│   │   ├── levels/ - Level Management
│   │   │   ├── LevelManager.ts - Level Loading
│   │   │   └── levels.ts - Level Definitions
│   │   └── utils/ - Game Utilities
│   │       ├── Constants.ts - Game Configuration
│   │       └── Types.ts - Type Definitions
│   ├── components/ (React UI)
│   │   ├── RoomScene.tsx - 3D Scene Container
│   │   ├── Game/ - 2D Game Interface
│   │   │   ├── GameCanvas.tsx - Canvas Wrapper
│   │   │   └── GameUI.tsx - Game Interface
│   │   └── UI/ - Interface Components
│   │       ├── MusicPlayer.tsx - Audio Controls
│   │       └── LightControls.tsx - Lighting UI
│   └── Data/ - Static Data
│       └── levels/ - Level JSON Files
├── public/
│   ├── models/ - 3D Assets (GLTF)
│   ├── audio/ - Music Files
│   └── textures/ - Texture Assets
└── documentation/ - Project Documentation
    └── ARCHITECTURE.md - This Document
```

## 🛠️ Technology Stack

### Core Technologies
- **Frontend**: React 19 + TypeScript
- **3D Graphics**: Three.js + WebGL
- **2D Graphics**: Canvas 2D API + RequestAnimationFrame
- **Build System**: Vite + TypeScript + GLSL Plugin
- **State Management**: React Local State + Custom Event System

### Development Tools
- **Debug Tools**: dat.GUI (3D) + Custom Console (2D)
- **Shaders**: GLSL for custom effects
- **Audio**: HTML5 Audio API
- **Assets**: GLTF, JSON, PNG/JPG formats
- **Linting**: ESLint + TypeScript

### Performance Optimizations
- **Loading**: Lazy loading with intelligent caching
- **Rendering**: RequestAnimationFrame with culling
- **Memory**: Automatic resource disposal
- **Events**: Debouncing and object pooling

## 🎯 Design Patterns & Principles

### Singleton Pattern (3D System)
```typescript
class RoomExperience {
  private static instance: RoomExperience;
  
  constructor() {
    if (RoomExperience.instance) {
      return RoomExperience.instance;
    }
    RoomExperience.instance = this;
    window.experience = this;
  }
}
```

### Factory Pattern (Material Creation)
```typescript
class MaterialFactory {
  static createToonMaterial(options: MaterialOptions): THREE.MeshToonMaterial {
    return new THREE.MeshToonMaterial({
      gradientMap: this.createToonGradient(),
      ...options
    });
  }
}
```

### Observer Pattern (Event System)
```typescript
class EventEmitter {
  private events: Map<string, Function[]> = new Map();
  
  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }
  
  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}
```

### Component Pattern (React Integration)
```typescript
interface GameCanvasProps {
  onGameStateChange: (state: GameState) => void;
  onLivesChange: (lives: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  onGameStateChange, 
  onLivesChange 
}) => {
  // Canvas integration with callback props
};
```

## 🚀 State Management

### Game State Flow
```typescript
enum GameState {
  START_SCREEN = "startScreen",    // Initial screen with controls
  PLAYING = "playing",             // Active gameplay
  PAUSED = "paused",              // Pause menu
  TRANSITIONING = "transitioning", // Level transitions
  VICTORY = "victory",            // Game completion
}

// State transitions
START_SCREEN → PLAYING → VICTORY → START_SCREEN
     ↓              ↓
   PAUSED ←→ PLAYING
```

### 3D Scene State
```typescript
interface SceneState {
  timeOfDay: number;          // 0-1 (midnight-midnight)
  lightsOn: boolean;          // Room lighting state
  musicPlaying: boolean;      // Audio playback state
  debugMode: boolean;         // Debug visualization
  keyboardLayout: string;     // "AZERTY" | "QWERTY"
}
```

### 2D Game State
```typescript
interface GameplayState {
  currentLevel: number;           // 1-5
  playerLives: number;           // 0-3
  invulnerabilityTime: number;   // Damage protection timer
  levelCompleted: boolean;       // Completion status
  isTransitioning: boolean;      // Transition state
}
```

## 🔧 Key Features & Capabilities

### 3D Room Features
- **Interactive Furniture**: Click detection and hover effects
- **Dynamic Lighting**: Real-time day/night cycle simulation
- **Material System**: Automatic PBR to Toon material conversion
- **Particle Effects**: Custom GLSL shaders for atmospheric effects
- **Audio Integration**: Synchronized vinyl player with HTML5 audio
- **Debug Visualization**: Comprehensive development tools

### 2D Game Features
- **Complete Physics Engine**: Gravity, friction, air control
- **Advanced Player Movement**: Coyote time, wall jumping, momentum
- **Enemy AI System**: Patrol patterns with collision detection
- **Multiple Platform Types**: Solid, falling, rising, moving platforms
- **Projectile System**: Physics-based with automatic spawners
- **Level Progression**: 5 levels with increasing difficulty
- **State Management**: Start screen, pause menu, victory screen
- **Keyboard Flexibility**: AZERTY/QWERTY layout switching

### UI/UX Features
- **Seamless Integration**: Smooth transitions between 3D and 2D
- **Responsive Design**: Adapts to different screen sizes
- **Audio Controls**: Music player with playlist management
- **Visual Feedback**: Loading states and interaction feedback
- **Accessibility**: Multiple keyboard layout support

## 📊 Performance Considerations

### Rendering Optimization
- **Separate Contexts**: 3D and 2D rendering don't interfere
- **Efficient Updates**: Only render when necessary
- **Culling**: Frustum culling for 3D objects
- **Batching**: Sprite batching for 2D rendering

### Memory Management
- **Asset Disposal**: Automatic cleanup of unused resources
- **Object Pooling**: Reuse of frequently created objects
- **Texture Management**: Efficient texture loading and caching
- **Event Cleanup**: Proper event listener removal

### Loading Strategy
- **Progressive Loading**: Critical assets first
- **Lazy Loading**: Load assets on demand
- **Caching**: Intelligent asset caching
- **Error Handling**: Graceful fallbacks for failed loads

## 🔮 Future Extensibility

### Planned Enhancements
- **Level Editor**: Visual level creation tools
- **Custom Furniture**: User-generated 3D content
- **Multiplayer Support**: Shared room experiences
- **VR Integration**: Virtual reality room exploration
- **Advanced Physics**: More realistic 2D physics simulation

### Architecture Benefits
- **Modular Design**: Easy to add new furniture or game mechanics
- **Clean Separation**: Systems can be developed independently
- **Type Safety**: Full TypeScript coverage prevents errors
- **Event-Driven**: Loose coupling between systems
- **Component-Based**: Reusable and testable components

## 📝 Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code formatting
- **Component Isolation**: Each furniture item and game entity is self-contained
- **Event-Driven Architecture**: Use EventEmitter for cross-system communication

### Testing Strategy
- **Unit Tests**: Core game logic and utilities
- **Integration Tests**: System interactions
- **Visual Tests**: Rendering consistency
- **Performance Tests**: Frame rate and memory usage

### Debugging Tools
- **3D Debug Mode**: F1 toggles comprehensive 3D visualization
- **2D Debug Mode**: Collision boxes, velocity vectors, FPS display
- **Console Logging**: Structured logging for development
- **GUI Controls**: Real-time parameter adjustment

---

## 📚 Conclusion

The MY-ROOM project represents a unique architectural approach that successfully combines two distinct but complementary systems: an immersive 3D room exploration experience and a complete 2D platformer game. This hybrid architecture demonstrates how modern web technologies can be leveraged to create engaging, performant, and maintainable interactive experiences.

The modular design ensures that each system can evolve independently while maintaining seamless integration through well-defined interfaces and communication patterns. This architecture serves as a solid foundation for future enhancements and demonstrates best practices for complex web application development.

---

*This document serves as a living reference for the MY-ROOM project architecture and should be updated as the system evolves.*