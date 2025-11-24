import { useParams, useNavigate } from "react-router-dom";
import { useGamePolling } from "../hooks/useGamePolling";
import { startGame } from "../api/client";
import { useState } from "react";

const HostLobbyPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { state } = useGamePolling(code || null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const handleStartGame = async () => {
    if (!code) return;
    setStarting(true);
    setError(null);
    try {
      await startGame(code);
      navigate(`/host/${code}/game`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  const playerCount = state?.players.length || 0;
  const canStart = playerCount >= 3;

  return (
    <div style={{ 
        padding: 24, 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        textAlign: "center"
    }}>
      <h1 style={{ fontSize: "4em", marginBottom: 20 }}>Lobby Code: <span style={{ color: "dodgerblue", letterSpacing: 8 }}>{code}</span></h1>
      <p style={{ fontSize: "1.5em", marginBottom: 40 }}>Join at <strong>{window.location.hostname}</strong></p>

      <div style={{ marginBottom: 40, width: "100%", maxWidth: 800 }}>
        <h2>Players ({playerCount})</h2>
        <ul style={{ 
            listStyle: "none", 
            padding: 0, 
            display: "flex", 
            flexWrap: "wrap", 
            justifyContent: "center", 
            gap: 20 
        }}>
          {state?.players.map(p => (
            <li key={p.id} style={{ 
                fontSize: "1.5em", 
                padding: "10px 20px", 
                backgroundColor: "#333", 
                borderRadius: 8 
            }}>
                {p.name}
            </li>
          ))}
        </ul>
        {playerCount === 0 && <p style={{ fontStyle: "italic", opacity: 0.6, color: "dodgerblue" }}>Waiting for players to join...</p>}
      </div>
      
      {error && <p style={{ color: "red", fontSize: "1.2em" }}>{error}</p>}
      
      <button 
        onClick={handleStartGame} 
        disabled={!canStart || starting}
        style={{ 
          padding: "20px 40px", 
          fontSize: "2em",
          cursor: canStart ? "pointer" : "not-allowed",
          opacity: canStart ? 1 : 0.5,
          marginTop: 20
        }}
      >
        {starting ? "Starting..." : canStart ? "Start Game" : "Need 3+ Players"}
      </button>
    </div>
  );
};

export default HostLobbyPage;
