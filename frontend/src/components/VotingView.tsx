import type { Answer } from "../api/client";

type Props = {
  answers: Answer[];
  onVote?: (answerId: string) => void;
  canVote?: boolean;
  title?: string;
  playerAnswerId?: string; // ID of the player's own answer (cannot vote for this)
};

export const VotingView = ({ answers, onVote, canVote = true, title = "Vote for the Secret Clanker 🤖", playerAnswerId }: Props) => {
  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: 12, 
        justifyContent: "center",
        alignItems: "center",
        maxWidth: 800,
        margin: "0 auto",
        padding: 20
      }}>
        {answers.map(answer => {
          const isOwnAnswer = answer.id === playerAnswerId;
          const isClickable = canVote && !isOwnAnswer;
          
          return (
            <button
              key={answer.id}
              onClick={() => isClickable && onVote && onVote(answer.id)}
              disabled={!isClickable}
              style={{
                padding: "10px 16px",
                fontSize: "1.5em",
                backgroundColor: isOwnAnswer ? "#444" : "transparent",
                border: isOwnAnswer ? "1px solid #666" : "none",
                color: isOwnAnswer ? "#999" : "inherit",
                cursor: isClickable ? "pointer" : "not-allowed",
                transition: "transform 0.2s, opacity 0.2s",
                opacity: isClickable ? 1 : 0.5,
                textDecoration: isClickable ? "underline" : "none",
                textDecorationStyle: "dotted",
                textUnderlineOffset: "4px",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                  if (isClickable) {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.opacity = "1";
                  }
              }}
              onMouseLeave={(e) => {
                  if (isClickable) {
                      e.currentTarget.style.transform = "scale(1)";
                  }
              }}
              title={isOwnAnswer ? "You can't vote for your own answer!" : ""}
            >
              {answer.text}
              {isOwnAnswer && <span style={{ fontSize: "0.6em", marginLeft: 8 }}>👤</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
