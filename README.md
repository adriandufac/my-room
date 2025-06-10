# 🏠 MY-ROOM - Interactive 3D Room Experience

A unique hybrid application that combines an immersive 3D room exploration experience with a complete 2D platformer game, all built with modern web technologies.

![Project Status](https://img.shields.io/badge/Status-Active%20Development-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Three.js](https://img.shields.io/badge/Three.js-Latest-orange)

## ✨ Features

### 🌐 3D Room Experience

- **Interactive 3D Environment** - Explore a detailed room with clickable furniture
- **Dynamic Lighting System** - Realistic day/night cycle with atmospheric lighting
- **Material System** - Miyazaki-style toon rendering with automatic PBR conversion
- **Audio Integration** - Synchronized vinyl player with lofi music playlist
- **Special Effects** - Custom GLSL shaders for smoke and atmospheric effects
- **Debug Mode** - Comprehensive development tools with dat.GUI controls

### 🎯 2D Platform Game

- **Complete Game Engine** - Full-featured 2D platformer with custom physics
- **5 Challenging Levels** - Progressive difficulty with unique mechanics
- **Advanced Player Movement** - Realistic physics with coyote time and air control
- **Enemy AI System** - Intelligent patrol patterns and collision detection
- **Multiple Platform Types** - Solid, falling, rising, and moving platforms
- **Projectile System** - Physics-based projectiles with automatic spawners
- **Lives & Progression** - 3-life system with invincibility frames
- **Victory System** - Complete game progression with congratulations screen

### 🎮 User Experience

- **Seamless Integration** - Smooth transitions between 3D exploration and 2D gaming
- **Keyboard Support** - AZERTY/QWERTY layout switching with K key
- **Start Screen** - Complete controls explanation and objectives
- **Pause System** - Full pause menu with controls reference
- **Responsive Design** - Adapts to different screen sizes
- **Visual Feedback** - Loading states and interaction feedback

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd my-room
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# TypeScript type checking
npm run type-check
```

## 🎮 How to Play

### 3D Room Exploration

1. **Navigate** - Use mouse to orbit around the room
2. **Interact** - Click on furniture to interact with objects
3. **Music** - Click the vinyl player to start/stop lofi music
4. **Computer** - Click the computer screen to launch the 2D game
5. **Debug** - Press F1 to toggle debug visualization

### 2D Platform Game Controls

#### Movement Controls

- **AZERTY Layout** (Default):
  - `Q` / `D` - Move left/right
  - `Z` - Jump
- **QWERTY Layout**:
  - `A` / `D` - Move left/right
  - `W` - Jump

#### Universal Controls

- `SPACE` / `↑` - Jump (both layouts)
- `ESC` / `P` - Pause game
- `K` - Switch keyboard layout
- `F1` - Toggle debug mode
- `R` - Restart level (when game over)

### Game Objective

Navigate through 5 challenging levels, avoid enemies and projectiles, and reach the golden finish zone to save humanity!

## 🏗️ Architecture

This project features a unique hybrid architecture:

- **React UI Layer** - Modern React interface with TypeScript
- **3D Engine** - Three.js with WebGL rendering and custom materials
- **2D Game Engine** - Custom Canvas 2D engine with physics simulation
- **Asset Management** - Efficient loading and caching system
- **Event System** - Cross-system communication and state management

For detailed architecture information, see [ARCHITECTURE.md](./documentation/ARCHITECTURE.md).

## 🛠️ Technology Stack

### Core Technologies

- **Frontend**: React 19 + TypeScript
- **3D Graphics**: Three.js + WebGL
- **2D Graphics**: Canvas 2D API
- **Build System**: Vite + GLSL Plugin
- **Audio**: HTML5 Audio API

### Development Tools

- **Linting**: ESLint + TypeScript
- **Debug**: dat.GUI (3D) + Custom Console (2D)
- **Shaders**: GLSL for custom effects
- **Hot Reload**: Vite fast refresh

### Assets

- **3D Models**: GLTF format with PBR textures
- **Audio**: Lofi music tracks + sound effects
- **Sprites**: PNG spritesheets for 2D animations
- **Levels**: JSON-based level definitions

## 📁 Project Structure

```
my-room/
├── src/
│   ├── Experience/          # 3D Room System (Three.js)
│   │   ├── Objects/         # Interactive furniture
│   │   ├── Utils/           # 3D utilities
│   │   └── ...
│   ├── game/               # 2D Platform Game Engine
│   │   ├── core/           # Core systems
│   │   ├── entities/       # Game objects
│   │   ├── graphics/       # Rendering
│   │   └── ...
│   ├── components/         # React UI Components
│   └── Data/              # Game data and levels
├── public/
│   ├── models/            # 3D assets (GLTF)
│   ├── audio/             # Music and sound effects
│   └── textures/          # 2D game sprites
└── documentation/         # Project documentation
```

## 🎨 Key Features

### 3D Experience Highlights

- **Miyazaki-Style Rendering** - Automatic toon material conversion
- **Dynamic Day/Night Cycle** - Real-time lighting simulation
- **Interactive Objects** - Click detection with hover effects
- **Particle Systems** - Custom GLSL smoke effects
- **Audio Synchronization** - Vinyl player controls actual music

### 2D Game Highlights

- **Custom Physics Engine** - Realistic movement with air control
- **State Management** - Start screen, pause, victory states
- **Enemy AI** - Patrol patterns with collision detection
- **Platform Variety** - Multiple interactive platform types
- **Progressive Difficulty** - 5 levels with increasing challenge
- **Accessibility** - Dual keyboard layout support

## 🐛 Development

### Debug Features

- **F1 Toggle** - Comprehensive debug visualization
- **3D Debug Mode** - Camera controls, lighting helpers, object bounds
- **2D Debug Mode** - Collision boxes, velocity vectors, FPS display
- **Console Logging** - Structured development logging
- **GUI Controls** - Real-time parameter adjustment

### Performance Optimizations

- **Efficient Rendering** - Separated 3D and 2D contexts
- **Smart Loading** - Progressive asset loading with caching
- **Memory Management** - Automatic resource cleanup
- **60 FPS Stable** - Optimized game loops for smooth performance
