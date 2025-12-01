import type { GameEngineState, GameAction, GameEngineConfig, GameEngineInterface } from "./types";

interface CupState {
  id: string;
  x: number;
  y: number;
  active: boolean;
}

interface BeerPongState {
  team1: {
    id: "team1";
    cups: CupState[];
    score: number;
  };
  team2: {
    id: "team2";
    cups: CupState[];
    score: number;
  };
  currentTeamId: "team1" | "team2";
  shotNumber: number;
  difficulty: number;
  lastShot?: {
    teamId: "team1" | "team2";
    hit: boolean;
    hitCupId?: string;
    aimAngle: number;
    power: number;
  };
  winnerTeamId?: "team1" | "team2";
}

// Generate cup positions in triangle formation (6 cups)
function generateCupPositions(): CupState[] {
  const cups: CupState[] = [];
  const rows = [1, 2, 3]; // Triangle: 1, 2, 3 cups
  let id = 0;

  rows.forEach((count, rowIdx) => {
    for (let i = 0; i < count; i++) {
      const x = 50 + (i - count / 2 + 0.5) * 20; // Centered
      const y = 20 + rowIdx * 25;
      cups.push({
        id: `cup-${id}`,
        x,
        y,
        active: true,
      });
      id++;
    }
  });

  return cups;
}

// Physics-based hit detection
function calculateHit(
  aimAngle: number,
  power: number,
  difficulty: number,
  cups: CupState[]
): { hit: boolean; cupId?: string } {
  // Base accuracy: difficulty 1=easy(70%), 2=medium(60%), 3=hard(50%), 4=extreme(40%)
  const accuracyChances = [0.7, 0.6, 0.5, 0.4];
  const baseAccuracy = accuracyChances[difficulty - 1] || 0.6;

  // Power affects aim consistency (more power = slightly less accurate)
  const powerAdjustment = 1 - power * 0.15;
  const finalAccuracy = baseAccuracy * powerAdjustment;

  // Determine if hit
  const isHit = Math.random() < finalAccuracy;

  if (!isHit) {
    return { hit: false };
  }

  // Select random active cup
  const activeCups = cups.filter(c => c.active);
  if (activeCups.length === 0) {
    return { hit: false };
  }

  const selectedCup = activeCups[Math.floor(Math.random() * activeCups.length)];
  return { hit: true, cupId: selectedCup.id };
}

export const beerPongEngine: GameEngineInterface = {
  createInitialState(config: GameEngineConfig): GameEngineState {
    return {
      type: "beer-pong",
      data: {
        team1: {
          id: "team1",
          cups: generateCupPositions(),
          score: 6,
        },
        team2: {
          id: "team2",
          cups: generateCupPositions(),
          score: 6,
        },
        currentTeamId: "team1",
        shotNumber: 1,
        difficulty: config.difficulty || 3,
      } as BeerPongState,
    };
  },

  applyAction(state: GameEngineState, action: GameAction): GameEngineState {
    const bpState = state.data as BeerPongState;

    if (action.type === "shoot") {
      const newState = { ...state };
      const { aimAngle, power } = action.payload || {};

      const targetTeam = bpState.currentTeamId === "team1" ? bpState.team2 : bpState.team1;
      const { hit, cupId } = calculateHit(aimAngle, power, bpState.difficulty, targetTeam.cups);

      let newTargetTeam = targetTeam;
      if (hit && cupId) {
        newTargetTeam = {
          ...targetTeam,
          cups: targetTeam.cups.map(cup =>
            cup.id === cupId ? { ...cup, active: false } : cup
          ),
          score: targetTeam.cups.filter(c => c.id !== cupId && c.active).length,
        };
      }

      const nextTeam = bpState.currentTeamId === "team1" ? "team2" : "team1";
      let winnerTeamId = undefined;

      if (newTargetTeam.score === 0) {
        winnerTeamId = bpState.currentTeamId as any;
      }

      newState.data = {
        ...bpState,
        team1: bpState.currentTeamId === "team1" ? bpState.team1 : newTargetTeam,
        team2: bpState.currentTeamId === "team2" ? bpState.team2 : newTargetTeam,
        currentTeamId: nextTeam,
        shotNumber: bpState.shotNumber + 1,
        lastShot: {
          teamId: bpState.currentTeamId,
          hit,
          hitCupId: cupId,
          aimAngle,
          power,
        },
        winnerTeamId,
      };

      return newState;
    }

    return state;
  },

  isGameOver(state: GameEngineState) {
    const bpState = state.data as BeerPongState;
    return {
      isOver: !!bpState.winnerTeamId,
      winner: bpState.winnerTeamId === "team1" ? 1 : bpState.winnerTeamId === "team2" ? 2 : undefined,
    };
  },

  getValidMoves(state: GameEngineState) {
    return [{ type: "shoot", payload: { aimAngle: 0, power: 1 } }];
  },

  getGameStatus(state: GameEngineState) {
    const bpState = state.data as BeerPongState;
    return {
      team1Cups: bpState.team1.cups,
      team1Score: bpState.team1.score,
      team2Cups: bpState.team2.cups,
      team2Score: bpState.team2.score,
      currentTeamId: bpState.currentTeamId,
      shotNumber: bpState.shotNumber,
      lastShot: bpState.lastShot,
      winner: bpState.winnerTeamId,
    };
  },
};
