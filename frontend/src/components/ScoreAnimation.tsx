import { useEffect, useState } from "react";

interface ScorePopup {
  id: number;
  points: number;
  timestamp: number;
}

interface ScoreAnimationProps {
  currentScore: number;
}

export const ScoreAnimation = ({ currentScore }: ScoreAnimationProps) => {
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const [previousScore, setPreviousScore] = useState(currentScore);

  useEffect(() => {
    if (currentScore !== previousScore) {
      const pointsEarned = currentScore - previousScore;
      
      // Only show animation if points changed
      if (pointsEarned !== 0) {
        const newPopup: ScorePopup = {
          id: Date.now(),
          points: pointsEarned,
          timestamp: Date.now()
        };
        
        setPopups(prev => [...prev, newPopup]);
        
        // Remove popup after animation completes (2 seconds)
        setTimeout(() => {
          setPopups(prev => prev.filter(p => p.id !== newPopup.id));
        }, 2000);
      }
      
      setPreviousScore(currentScore);
    }
  }, [currentScore, previousScore]);

  return (
    <>
      {popups.map(popup => (
        <div
          key={popup.id}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "3em",
            fontWeight: "bold",
            color: popup.points > 0 ? "#4ade80" : "#f87171",
            animation: "scorePopup 2s ease-out forwards",
            pointerEvents: "none",
            zIndex: 1000,
            textShadow: "0 0 10px rgba(0,0,0,0.8)",
          }}
        >
          {popup.points > 0 ? "+" : ""}{popup.points}
        </div>
      ))}
      <style>{`
        @keyframes scorePopup {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -80%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -120%) scale(1);
          }
        }
      `}</style>
    </>
  );
};

