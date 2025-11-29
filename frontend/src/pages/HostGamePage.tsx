import { useParams, useNavigate } from "react-router-dom";
import { useGamePolling } from "../hooks/useGamePolling";
import { useState, useEffect } from "react";
import { setQuestionCount, nextRound, deleteGame } from "../api/client";
import { VotingView } from "../components/VotingView";
import { RevealView } from "../components/RevealView";
import Confetti from "react-confetti";

// Simple hook to get window size for confetti
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

const HostGamePage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { state } = useGamePolling(code || null);
  const [submitting, setSubmitting] = useState(false);
  const { width, height } = useWindowSize();

  const handleSetCount = async (count: number) => {
    if (!code) return;
    setSubmitting(true);
    try {
        await setQuestionCount(code, count);
    } catch (e) {
        console.error(e);
        alert("Error setting count");
    } finally {
        setSubmitting(false);
    }
  };

  const handleNextRound = async () => {
      if (!code) return;
      setSubmitting(true);
      try {
          const res = await nextRound(code);
          if (res.status === "finished") {
              // Game Over
          }
      } catch (e) {
          console.error(e);
          alert("Error starting next round");
      } finally {
          setSubmitting(false);
      }
  };

  const handleEndGame = async () => {
      if (!code) return;
      if (!confirm("Are you sure you want to end the game? This will delete all data.")) return;
      
      setSubmitting(true);
      try {
          await deleteGame(code);
          navigate("/");
      } catch (e) {
          console.error(e);
          alert("Error deleting game");
      } finally {
          setSubmitting(false);
      }
  };

  if (!state) return <div>Loading...</div>;

  // Sort players for leaderboard
  const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers.length > 0 ? sortedPlayers[0] : null;

  return (
    <div className="animated-bg" style={{ 
        padding: 24, 
        paddingTop: "50px",
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "flex-start", 
        textAlign: "center",
        width: "100%",
        position: "relative"
    }}>
      <h1 style={{ marginBottom: 20 }}>Host View - Game Code: {code}</h1>
      
      <div style={{ width: "100%", maxWidth: 1000, flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        {state.status === "setup_questions" && (
            <div>
                <h2>How many questions per player?</h2>
                <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 20 }}>
                    {[1, 2, 3, 4, 5].map(num => (
                        <button 
                          key={num} 
                          onClick={() => handleSetCount(num)}
                          disabled={submitting}
                          style={{ padding: "20px 30px", fontSize: "1.5em" }}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {state.status === "write_questions" && (
            <div>
                <h2>Players are writing questions...</h2>
                <p style={{ fontSize: "1.5em" }}>Goal: {state.questions_per_player} questions per player</p>
            </div>
        )}

        {state.status === "answering" && (
            <div style={{ textAlign: "center" }}>
                <h2>Round {state.round_number}</h2>
                <div style={{ fontSize: "3em", margin: "40px 0", padding: 40, border: "4px solid #333", borderRadius: 16 }}>
                    {state.question_text}
                </div>
                <p style={{ fontSize: "1.5em" }}>Waiting for answers...</p>
            </div>
        )}

        {state.status === "voting" && (
            <div style={{ marginTop: 20 }}>
                <div style={{ 
                    backgroundColor: "rgba(0, 0, 0, 0.3)", 
                    border: "2px solid rgba(255, 255, 255, 0.2)", 
                    borderRadius: 12, 
                    padding: 20,
                    marginBottom: 30
                }}>
                    <h2 style={{ opacity: 0.7, marginTop: 0, marginBottom: 10 }}>Question</h2>
                    <div style={{ fontSize: "2.0em", fontStyle: 'italic' }}>{state.question_text}</div>
                </div>
                
                <div style={{ 
                    backgroundColor: "rgba(0, 0, 0, 0.3)", 
                    border: "2px solid rgba(255, 255, 255, 0.2)", 
                    borderRadius: 12, 
                    padding: 20
                }}>
                    <VotingView 
                      answers={state.answers} 
                      canVote={false} 
                      title="Which answer is the AI?" 
                    />
                </div>
            </div>
        )}

        {state.status === "reveal" && (
            <div>
                <RevealView 
                  answers={state.answers} 
                  players={state.players} 
                  votes={state.votes || []} 
                />
                <div style={{ textAlign: "center", marginTop: 40 }}>
                    <button 
                      onClick={handleNextRound}
                      disabled={submitting}
                      style={{ padding: "15px 30px", fontSize: "1.5em" }}
                    >
                        Show Leaderboard
                    </button>
                </div>
            </div>
        )}

        {state.status === "leaderboard" && (
            <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "2.5em", marginBottom: 30 }}>Leaderboard</h2>
                
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    gap: "15px",
                    marginBottom: "50px",
                    padding: "20px"
                }}>
                    {sortedPlayers.map((p, index) => {
                        let medal = null;
                        let color = "white";
                        let size = "2em";
                        let fontWeight = "normal";

                        if (index === 0) {
                            medal = "🥇";
                            color = "#FFD700"; // Gold
                            size = "2.8em";
                            fontWeight = "bold";
                        } else if (index === 1) {
                            medal = "🥈";
                            color = "#C0C0C0"; // Silver
                            size = "2.3em";
                            fontWeight = "bold";
                        } else if (index === 2) {
                            medal = "🥉";
                            color = "#CD7F32"; // Bronze
                            size = "2em";
                            fontWeight = "bold";
                        }

                        return (
                            <div 
                                key={p.id} 
                                style={{ 
                                    fontSize: size, 
                                    color: color, 
                                    fontWeight: fontWeight as any,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "15px",
                                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                                    padding: "15px 30px",
                                    borderRadius: 12,
                                    minWidth: "400px",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <span style={{ fontSize: "0.8em", opacity: 0.7 }}>#{index + 1}</span>
                                    {medal && <span>{medal}</span>}
                                    <span>{p.name}</span>
                                </div>
                                <span style={{ fontWeight: "bold" }}>{p.score}</span>
                            </div>
                        );
                    })}
                </div>
                
                <button 
                    onClick={handleNextRound}
                    disabled={submitting}
                    style={{ padding: "20px 40px", fontSize: "1.8em" }}
                >
                    Continue to Next Round
                </button>
            </div>
        )}

        {state.status === "finished" && (
            <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1000, pointerEvents: "none" }}>
                    <Confetti width={width} height={height} recycle={true} />
                </div>
                
                <h2 style={{ fontSize: "3em", marginBottom: "20px" }}>Game Over!</h2>
                
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    gap: "10px",
                    marginBottom: "40px" 
                }}>
                    {sortedPlayers.map((p, index) => {
                        let medal = null;
                        let color = "white";
                        let size = "1.5em";
                        let fontWeight = "normal";

                        if (index === 0) {
                            medal = "👑";
                            color = "#FFD700"; // Gold
                            size = "2.5em";
                            fontWeight = "bold";
                        } else if (index === 1) {
                            medal = "🥈";
                            color = "#C0C0C0"; // Silver
                            size = "2em";
                            fontWeight = "bold";
                        } else if (index === 2) {
                            medal = "🥉";
                            color = "#CD7F32"; // Bronze
                            size = "1.8em";
                            fontWeight = "bold";
                        }

                        // Only show top 3 prominently? Or all? Let's show all but style top 3
                        return (
                            <div 
                                key={p.id} 
                                style={{ 
                                    fontSize: size, 
                                    color: color, 
                                    fontWeight: fontWeight as any,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}
                            >
                                {medal && <span>{medal}</span>}
                                <span>{p.name}: {p.score}</span>
                            </div>
                        );
                    })}
                </div>
                
                {winner && (
                    <div style={{ fontSize: "1.2em", opacity: 0.8, marginBottom: 20 }}>
                        Congratulations {winner.name}!
                    </div>
                )}

                <button 
                    onClick={handleEndGame}
                    style={{ 
                        marginTop: 20, 
                        padding: "20px 40px", 
                        fontSize: "1.5em", 
                        backgroundColor: "#882222",
                        color: "white",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    End & Delete Game
                </button>
            </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ marginTop: 20, opacity: 0.6, position: "fixed", bottom: 20, right: 20, fontSize: "0.8em" }}>
          <p>Status: {state.status} | Round: {state.round_number}</p>
      </div>
    </div>
  );
};

export default HostGamePage;
