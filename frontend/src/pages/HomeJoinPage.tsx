import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame, joinGame } from "../api/client";
import robotMascot from "../assets/Robot-Emoji.png";

const HomeJoinPage = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    setLoading(true);
    try {
      const res = await createGame();
      navigate(`/host/${res.code}`);
    } catch (e) {
      console.error(e);
      alert("Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!name || !code) return;
    setLoading(true);
    try {
      const res = await joinGame(name, code);
      sessionStorage.setItem("player_id", res.player_id);
      sessionStorage.setItem("game_code", res.code);
      navigate(`/game/${res.code}`);
    } catch (e) {
      console.error(e);
      alert("Failed to join game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-bg" style={{ 
        padding: 24, 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        width: "100%",
        textAlign: "center"
    }}>
      <div style={{ width: "100%", maxWidth: 500 }}>
        <div style={{ marginBottom: 10 }}>
        <img 
          src={robotMascot} 
          alt="Secret Clanker Mascot" 
          style={{ 
            width: 120, 
            height: 120, 
            objectFit: "contain",
            animation: "float 3s ease-in-out infinite"
          }} 
        />
      </div>
      <h1 style={{ fontSize: "2.5em", marginBottom: 40, marginTop: 0, fontStyle: 'italic' }}>Secret Clanker</h1>

      <section style={{ width: "100%", marginBottom: 40 }}>
        <h2>Join Game</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              placeholder="Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ padding: 15, fontSize: "1.2em", borderRadius: 8, border: "1px solid #ccc" }}
            />
            <input
              placeholder="Game Code (e.g. 1234)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              style={{ padding: 15, fontSize: "1.2em", borderRadius: 8, border: "1px solid #ccc" }}
            />
            <button 
                disabled={loading || !name || !code} 
                onClick={handleJoinGame}
                style={{ padding: 15, fontSize: "1.2em", marginTop: 10 }}
            >
              Join Game
            </button>
        </div>
      </section>

      <div style={{ width: "100%", height: 1, backgroundColor: "#444", marginBottom: 40 }}></div>

      <section style={{ width: "100%" }}>
        <h2 style={{ fontSize: "1.2em", opacity: 0.8 }}>Or Host a New Game</h2>
        <button 
            disabled={loading} 
            onClick={handleCreateGame}
            style={{ width: "100%", padding: 15, fontSize: "1.2em", marginTop: 10, backgroundColor: "#444" }}
        >
          Create New Game
        </button>
      </section>
      </div>
    </div>
  );
};

export default HomeJoinPage;
