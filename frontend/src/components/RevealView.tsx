import type { Answer, Player } from "../api/client";

export type Vote = {
  voter_player_id: string;
  answer_id_voted_for: string;
};

type Props = {
  answers: Answer[];
  players: Player[];
  votes: Vote[];
};

export const RevealView = ({ answers, players, votes }: Props) => {
  // Find the AI answer (player_id is null)
  const aiAnswerId = answers.find(a => a.player_id === null)?.id;

  return (
    <div style={{ textAlign: "center", marginTop: 20}}>
      <h2>Results</h2>
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: 24, 
        justifyContent: "center",
        maxWidth: 900, 
        margin: "0 auto",
        padding: 20
      }}>
        {answers.map(answer => {
          const isAI = answer.id === aiAnswerId;
          const voters = votes
            .filter(v => v.answer_id_voted_for === answer.id)
            .map(v => players.find(p => p.id === v.voter_player_id)?.name)
            .filter(Boolean);

          const author = answer.player_id 
            ? players.find(p => p.id === answer.player_id)?.name 
            : "🤖 Secret Clanker";

          return (
            <div 
              key={answer.id} 
              style={{ 
                textAlign: "center",
                flex: "1 1 auto",
                minWidth: "200px"
              }}
            >
              <div style={{ 
                fontSize: "1.8em", 
                marginBottom: 8,
                fontWeight: isAI ? "bold" : "normal",
                color: isAI ? "#ff4444" : "inherit",
                textShadow: isAI ? "0 0 10px rgba(255, 0, 0, 0.5)" : "none"
              }}>
                {answer.text}
              </div>
              
              <div style={{ fontSize: "0.9em", opacity: 0.7, marginBottom: 4 }}>
                {isAI ? "🤖 SECRET CLANKER" : `By ${author}`}
              </div>

              {voters.length > 0 && (
                <div style={{ fontSize: "0.8em", color: "#888" }}>
                  {isAI ? "Caught by: " : "Fooled: "}
                  {voters.join(", ")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
