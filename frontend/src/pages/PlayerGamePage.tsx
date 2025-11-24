import { useParams } from "react-router-dom";
import { useGamePolling } from "../hooks/useGamePolling";
import { useState, useEffect } from "react";
import { submitQuestion, submitAnswer, submitVote } from "../api/client";
import { VotingView } from "../components/VotingView";
import { RevealView } from "../components/RevealView";

const PlayerGamePage = () => {
  const { code } = useParams<{ code: string }>();
  const { state } = useGamePolling(code || null);
  const playerId = sessionStorage.getItem("player_id");
  const player = state?.players.find((p: any) => p.id === playerId);

  const [questionText, setQuestionText] = useState("");
  const [submittedCount, setSubmittedCount] = useState(0);
  
  const [answerText, setAnswerText] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);

  // Reset state when round changes
  useEffect(() => {
      setAnswerSubmitted(false);
      setAnswerText("");
      setVoteSubmitted(false);
  }, [state?.round_number]);

  const handleSubmitQuestion = async () => {
      if (!code || !playerId || !questionText.trim()) return;
      setSubmitting(true);
      try {
          await submitQuestion(code, playerId, questionText);
          setSubmittedCount(prev => prev + 1);
          setQuestionText("");
      } catch (e: any) {
          alert(e.message);
      } finally {
          setSubmitting(false);
      }
  };

  const handleSubmitAnswer = async () => {
      if (!code || !playerId || !answerText.trim()) return;
      setSubmitting(true);
      try {
          await submitAnswer(code, playerId, answerText);
          setAnswerSubmitted(true);
      } catch (e: any) {
          alert(e.message);
      } finally {
          setSubmitting(false);
      }
  };

  const handleVote = async (answerId: string) => {
      if (!code || !playerId) return;
      setSubmitting(true);
      try {
          await submitVote(code, playerId, answerId);
          setVoteSubmitted(true);
      } catch (e: any) {
          alert(e.message);
      } finally {
          setSubmitting(false);
      }
  };

  if (!state || !player) return <div>Loading...</div>;

  const questionsNeeded = state.questions_per_player || 2; 
  const isWritingPhase = state.status === "write_questions";
  const doneWriting = submittedCount >= questionsNeeded;
  const isAnsweringPhase = state.status === "answering";
  const isVotingPhase = state.status === "voting";
  const isRevealPhase = state.status === "reveal";
  const isFinished = state.status === "finished";

  return (
    <div style={{ 
        padding: 24, 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "flex-start",
        maxWidth: 500,
        margin: "0 auto",
        textAlign: "center"
    }}>
      <div style={{ width: "100%", textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.8em", margin: "0 0 10px 0", color: "dodgerblue"}}>AI Impostor Game</h1>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#333", borderRadius: 8, fontSize: "0.9em" }}>
            <span>Code: <strong>{code}</strong></span>
            <span>Name: <strong>{player.name}</strong></span>
            <span>Score: <strong>{player.score}</strong></span>
        </div>
      </div>
    
      <div style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        {state.status === "setup_questions" && (
              <div style={{ textAlign: "center", padding: 20 }}>
                  <h2>Waiting for host...</h2>
                  <p>The host is setting up the game parameters.</p>
              </div>
          )}

          {isWritingPhase && !doneWriting && (
              <div style={{ width: "100%" }}>
                  <h2>Write a Question</h2>
                  <p>({submittedCount + 1}/{questionsNeeded})</p>
                  <textarea 
                      value={questionText}
                      onChange={e => setQuestionText(e.target.value)}
                      rows={4}
                      style={{ 
                          width: "100%", 
                          marginBottom: 20, 
                          padding: 15, 
                          fontSize: "1.2em", 
                          borderRadius: 12,
                          boxSizing: "border-box"
                      }}
                      placeholder="e.g. What is the best pizza topping?"
                  />
                  <button 
                      onClick={handleSubmitQuestion}
                      disabled={submitting || !questionText.trim()}
                      style={{ width: "100%", padding: 15, fontSize: "1.2em" }}
                  >
                      Submit Question
                  </button>
              </div>
          )}

          {isWritingPhase && doneWriting && (
              <div style={{ textAlign: "center" }}>
                  <h2>All questions submitted!</h2>
                  <p>Waiting for other players...</p>
              </div>
          )}

          {isAnsweringPhase && (
              <div style={{ width: "100%" }}>
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <h2>Round {state.round_number}</h2>
                      <div style={{ 
                          fontSize: "1.5em", 
                          padding: 20, 
                          border: "2px solid #444", 
                          borderRadius: 12,
                          backgroundColor: "#2a2a2a",
                          marginBottom: 20
                      }}>
                          {state.question_text}
                      </div>
                  </div>
                  
                  {!answerSubmitted ? (
                      <div style={{ width: "100%" }}>
                          <textarea 
                              value={answerText}
                              onChange={e => setAnswerText(e.target.value)}
                              rows={4}
                              style={{ 
                                  width: "100%", 
                                  marginBottom: 20, 
                                  padding: 15, 
                                  fontSize: "1.2em", 
                                  borderRadius: 12,
                                  boxSizing: "border-box"
                              }}
                              placeholder="Your answer..."
                          />
                          <button 
                              onClick={handleSubmitAnswer}
                              disabled={submitting || !answerText.trim()}
                              style={{ width: "100%", padding: 15, fontSize: "1.2em" }}
                          >
                              Submit Answer
                          </button>
                      </div>
                  ) : (
                      <div style={{ textAlign: "center", padding: 20 }}>
                          <h3>Answer submitted!</h3>
                          <p>Waiting for others...</p>
                      </div>
                  )}
              </div>
          )}

          {isVotingPhase && (
              <div style={{ width: "100%" }}>
                  {!voteSubmitted ? (
                      <VotingView 
                          answers={state.answers} 
                          onVote={handleVote}
                          canVote={!submitting}
                      />
                  ) : (
                      <div style={{ textAlign: "center", padding: 20 }}>
                          <h2>Vote Submitted!</h2>
                          <p>Waiting for results...</p>
                      </div>
                  )}
              </div>
          )}

          {isRevealPhase && (
              <div style={{ width: "100%" }}>
                  <RevealView 
                      answers={state.answers} 
                      players={state.players} 
                      votes={state.votes || []} 
                  />
              </div>
          )}

          {isFinished && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                  <h2>Game Over!</h2>
                  <p>Check the host screen for final results.</p>
              </div>
          )}
        </div>
    </div>
  );
};

export default PlayerGamePage;
