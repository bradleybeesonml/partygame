import type { Answer } from "../api/client";

type Props = {
  answers: Answer[];
  onVote?: (answerId: string) => void;
  canVote?: boolean;
  title?: string;
};

export const VotingView = ({ answers, onVote, canVote = true, title = "Vote for the Secret Clanker 🤖" }: Props) => {
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
        {answers.map(answer => (
          <button
            key={answer.id}
            onClick={() => canVote && onVote && onVote(answer.id)}
            disabled={!canVote}
            style={{
              padding: "10px 16px",
              fontSize: "1.5em",
              backgroundColor: "transparent",
              border: "none",
              color: "inherit",
              cursor: canVote ? "pointer" : "default",
              transition: "transform 0.2s, opacity 0.2s",
              opacity: canVote ? 1 : 0.7,
              textDecoration: canVote ? "underline" : "none",
              textDecorationStyle: "dotted",
              textUnderlineOffset: "4px"
            }}
            onMouseEnter={(e) => {
                if (canVote) {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.opacity = "1";
                }
            }}
            onMouseLeave={(e) => {
                if (canVote) {
                    e.currentTarget.style.transform = "scale(1)";
                }
            }}
          >
            {answer.text}
          </button>
        ))}
      </div>
    </div>
  );
};
