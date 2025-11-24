import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeJoinPage from "./pages/HomeJoinPage";
import HostLobbyPage from "./pages/HostLobbyPage";
import HostGamePage from "./pages/HostGamePage";
import PlayerGamePage from "./pages/PlayerGamePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeJoinPage />} />
        <Route path="/host/:code" element={<HostLobbyPage />} />
        <Route path="/host/:code/game" element={<HostGamePage />} />
        <Route path="/game/:code" element={<PlayerGamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
