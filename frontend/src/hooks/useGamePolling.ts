import { useEffect, useState } from "react";
import { fetchGameState } from "../api/client";
import type { GameState } from "../api/client";

export function useGamePolling(code: string | null, intervalMs = 1500) {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    let isCancelled = false;
    let timer: number | undefined;

    const tick = async () => {
      try {
        const data = await fetchGameState(code);
        if (!isCancelled) {
          setState(data);
          setError(null);
        }
      } catch (err: any) {
        if (!isCancelled) setError(err.message || "Error");
      } finally {
        if (!isCancelled) {
          timer = window.setTimeout(tick, intervalMs);
        }
      }
    };

    tick();

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [code, intervalMs]);

  return { state, error };
}

