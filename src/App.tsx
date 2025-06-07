import "./App.css";
import Game from "./components/Game/Game";
import TestPhysicsDemo from "./components/Game/TestPhysicsDemo";
import RoomScene from "./components/RoomScene";
import { GameCanvas } from "./components/Game/GameCanvas";

function App() {
  return (
    <div className="App">
      <GameCanvas width={1200} height={600} showDebug={true} />
    </div>
  );
}

export default App;
