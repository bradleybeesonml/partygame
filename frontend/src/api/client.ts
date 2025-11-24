const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type Answer = {
  id: string;
  player_id: string | null;
  text: string;
};

export type Vote = {
  id: string;
  voter_player_id: string;
  answer_id_voted_for: string;
};

export type GameState = {
  game_id: string;
  code: string;
  status: string;
  round_number: number;
  players: Player[];
  current_round_id: string | null;
  question_text: string | null;
  answers: Answer[];
  questions_per_player: number;
  votes?: Vote[];
};

export async function createGame() {
  const res = await fetch(`${API_BASE_URL}/games/create`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to create game");
  return res.json() as Promise<{ game_id: string; code: string }>;
}

export async function joinGame(name: string, code: string) {
  const res = await fetch(`${API_BASE_URL}/games/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, code }),
  });
  if (!res.ok) throw new Error("Failed to join game");
  return res.json() as Promise<{ player_id: string; game_id: string; code: string }>;
}

export async function fetchGameState(code: string) {
  const res = await fetch(`${API_BASE_URL}/games/${code}/state`);
  if (!res.ok) throw new Error("Failed to fetch game state");
  return res.json() as Promise<GameState>;
}

export async function startGame(code: string) {
  const res = await fetch(`${API_BASE_URL}/games/${code}/start`, {
    method: "POST",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to start game");
  }
  return res.json();
}

export async function setQuestionCount(code: string, count: number) {
  const res = await fetch(`${API_BASE_URL}/games/${code}/set-question-count`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count }),
  });
  if (!res.ok) throw new Error("Failed to set question count");
  return res.json();
}

export async function submitQuestion(code: string, playerId: string, text: string) {
  const res = await fetch(`${API_BASE_URL}/games/${code}/submit-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: playerId, text }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to submit question");
  }
  return res.json();
}

export async function submitAnswer(code: string, playerId: string, text: string) {
  const res = await fetch(`${API_BASE_URL}/games/${code}/submit-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: playerId, text }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to submit answer");
  }
  return res.json();
}

export async function submitVote(code: string, playerId: string, answerId: string) {
  const res = await fetch(`${API_BASE_URL}/games/${code}/submit-vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: playerId, answer_id: answerId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to submit vote");
  }
  return res.json();
}

export async function nextRound(code: string) {
  const res = await fetch(`${API_BASE_URL}/games/${code}/next-round`, {
    method: "POST",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to start next round");
  }
  return res.json();
}

export async function deleteGame(code: string) {
  const res = await fetch(`${API_BASE_URL}/games/${code}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to delete game");
  }
  return res.json();
}
