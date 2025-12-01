import type { GameEngineState, GameAction, GameEngineConfig, GameEngineInterface } from "./types";

interface BeerPongState {
  team1Cups: boolean[];
  team2Cups: boolean[];
  currentTeam: 1 | 2;
  score1: number;
  score2: number;
  round: number;
  difficulty: number;
}

export const beerPongEngine: GameEngineInterface = {
  createInitialState(config: GameEngineConfig): GameEngineState {
    const cupsPerTeam = 10;

    return {
      type: "beer-pong",
      data: {
        team1Cups: Array(cupsPerTeam).fill(true),
        team2Cups: Array(cupsPerTeam).fill(true),
        currentTeam: 1,
        score1: cupsPerTeam,
        score2: cupsPerTeam,
        round: 1,
        difficulty: config.difficulty || 3,
      } as BeerPongState,
    };
  },

  applyAction(state: GameEngineState, action: GameAction): GameEngineState {
    const bpState = state.data as BeerPongState;

    if (action.type === "throw") {
      const newState = { ...state };

      // Hit chance based on difficulty (1-4): Easy=70%, Medium=60%, Hard=50%, Extreme=40%
      const hitChances = [0.7, 0.6, 0.5, 0.4];
      const hitChance = hitChances[bpState.difficulty - 1] || 0.6;
      const isHit = Math.random() < hitChance;

      if (isHit) {
        const targetCups = bpState.currentTeam === 1 ? bpState.team2Cups : bpState.team1Cups;
        const activeCups = targetCups
          .map((cup, idx) => (cup ? idx : -1))
          .filter(idx => idx !== -1);

        if (activeCups.length > 0) {
          const targetIdx = activeCups[Math.floor(Math.random() * activeCups.length)];

          if (bpState.currentTeam === 1) {
            const newTeam2Cups = [...bpState.team2Cups];
            newTeam2Cups[targetIdx] = false;
            const remainingCups = newTeam2Cups.filter(c => c).length;

            newState.data = {
              ...bpState,
              team2Cups: newTeam2Cups,
              score2: remainingCups,
              currentTeam: remainingCups === 0 ? 1 : 2,
            };
          } else {
            const newTeam1Cups = [...bpState.team1Cups];
            newTeam1Cups[targetIdx] = false;
            const remainingCups = newTeam1Cups.filter(c => c).length;

            newState.data = {
              ...bpState,
              team1Cups: newTeam1Cups,
              score1: remainingCups,
              currentTeam: remainingCups === 0 ? 2 : 1,
            };
          }
        }
      } else {
        // Miss - switch team
        newState.data = {
          ...bpState,
          currentTeam: bpState.currentTeam === 1 ? 2 : 1,
        };
      }

      return newState;
    }

    if (action.type === "nextRound") {
      const newState = { ...state };
      newState.data = {
        ...bpState,
        round: bpState.round + 1,
      };
      return newState;
    }

    return state;
  },

  isGameOver(state: GameEngineState) {
    const bpState = state.data as BeerPongState;
    const winner =
      bpState.score1 === 0 ? 1 : bpState.score2 === 0 ? 2 : undefined;

    return {
      isOver: !!winner,
      winner,
    };
  },

  getValidMoves(state: GameEngineState) {
    return [
      {
        type: "throw",
        payload: { targetTeam: state.data.currentTeam === 1 ? 2 : 1 },
      },
    ];
  },

  getGameStatus(state: GameEngineState) {
    const bpState = state.data as BeerPongState;
    return {
      team1Cups: bpState.team1Cups,
      team2Cups: bpState.team2Cups,
      currentTeam: bpState.currentTeam,
      score1: bpState.score1,
      score2: bpState.score2,
      round: bpState.round,
      difficulty: bpState.difficulty,
    };
  },
};
