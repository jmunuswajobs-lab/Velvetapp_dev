import { useCallback, useState } from "react";

// Hook to use game engines on the frontend
export function useGameEngine(engineType: string, config: { players: number; difficulty?: number }) {
  const [state, setState] = useState<any>(null);

  // Initialize engine state based on type
  const initializeGame = useCallback(() => {
    switch (engineType) {
      case "pong":
        return {
          type: "beer-pong",
          data: {
            team1Cups: Array(10).fill(true),
            team2Cups: Array(10).fill(true),
            currentTeam: 1,
            score1: 10,
            score2: 10,
            round: 1,
            difficulty: config.difficulty || 3,
          },
        };
      case "memory-match":
        const cards = Array.from({ length: 16 }, (_, i) => ({
          id: Math.floor(i / 2),
          matched: false,
        }));
        for (let i = 15; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return {
          type: "memory",
          data: {
            cards,
            flipped: [],
            matches: 0,
            scores: {},
            currentPlayer: 0,
          },
        };
      case "board-ludo":
        return {
          type: "ludo",
          data: {
            positions: {},
            diceValue: 0,
            currentPlayer: 0,
            round: 1,
          },
        };
      default:
        return null;
    }
  }, [engineType, config.difficulty]);

  const applyAction = useCallback(
    (action: { type: string; payload?: any }) => {
      if (!state) return;

      const newState = { ...state };

      switch (engineType) {
        case "pong":
          if (action.type === "throw") {
            const hitChances = [0.7, 0.6, 0.5, 0.4];
            const hitChance = hitChances[(state.data.difficulty || 3) - 1] || 0.6;
            const isHit = Math.random() < hitChance;

            if (isHit) {
              const targetCups = state.data.currentTeam === 1 ? state.data.team2Cups : state.data.team1Cups;
              const activeCups = targetCups.map((cup: boolean, idx: number) => (cup ? idx : -1)).filter((idx: number) => idx !== -1);

              if (activeCups.length > 0) {
                const targetIdx = activeCups[Math.floor(Math.random() * activeCups.length)];

                if (state.data.currentTeam === 1) {
                  const newTeam2Cups = [...state.data.team2Cups];
                  newTeam2Cups[targetIdx] = false;
                  newState.data = {
                    ...state.data,
                    team2Cups: newTeam2Cups,
                    score2: newTeam2Cups.filter((c: boolean) => c).length,
                  };
                } else {
                  const newTeam1Cups = [...state.data.team1Cups];
                  newTeam1Cups[targetIdx] = false;
                  newState.data = {
                    ...state.data,
                    team1Cups: newTeam1Cups,
                    score1: newTeam1Cups.filter((c: boolean) => c).length,
                  };
                }
              }
            }

            newState.data = {
              ...newState.data,
              currentTeam: state.data.currentTeam === 1 ? 2 : 1,
            };
          }
          break;
      }

      setState(newState);
      return newState;
    },
    [state, engineType]
  );

  return { state, initializeGame, applyAction };
}
