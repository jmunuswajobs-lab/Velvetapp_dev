import type { GameEngineState, GameAction, GameEngineConfig, GameEngineInterface } from "./types";

interface LudoState {
  players: number;
  positions: { [playerId: string]: number[] }; // piece positions
  diceValue: number;
  currentPlayer: number;
  round: number;
  winner?: number;
}

export const ludoEngine: GameEngineInterface = {
  createInitialState(config: GameEngineConfig): GameEngineState {
    const positions: { [key: string]: number[] } = {};
    for (let i = 0; i < config.players; i++) {
      positions[`player-${i}`] = [0, 0, 0, 0]; // 4 pieces each at start
    }

    return {
      type: "ludo",
      data: {
        players: config.players,
        positions,
        diceValue: 0,
        currentPlayer: 0,
        round: 1,
      } as LudoState,
    };
  },

  applyAction(state: GameEngineState, action: GameAction): GameEngineState {
    const ludoState = state.data as LudoState;

    if (action.type === "rollDice") {
      const newState = { ...state };
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      newState.data = {
        ...ludoState,
        diceValue: diceRoll,
      };
      return newState;
    }

    if (action.type === "movePiece") {
      const newState = { ...state };
      const newPositions = { ...ludoState.positions };
      const playerId = `player-${ludoState.currentPlayer}`;
      const { pieceIdx } = action.payload || {};

      if (pieceIdx !== undefined) {
        const currentPos = newPositions[playerId][pieceIdx];
        const newPos = Math.min(currentPos + ludoState.diceValue, 56); // 56 is finish line
        newPositions[playerId][pieceIdx] = newPos;
      }

      // Check for win
      const allFinished = newPositions[playerId].every(pos => pos >= 56);
      let winner = undefined;
      if (allFinished) {
        winner = ludoState.currentPlayer;
      }

      newState.data = {
        ...ludoState,
        positions: newPositions,
        currentPlayer: (ludoState.currentPlayer + 1) % ludoState.players,
        round: ludoState.round + (ludoState.currentPlayer === ludoState.players - 1 ? 1 : 0),
        winner,
      };
      return newState;
    }

    return state;
  },

  isGameOver(state: GameEngineState) {
    const ludoState = state.data as LudoState;
    return {
      isOver: !!ludoState.winner,
      winner: ludoState.winner,
    };
  },

  getValidMoves(state: GameEngineState, playerID: string) {
    const ludoState = state.data as LudoState;
    if (ludoState.diceValue === 0) return [];

    const playerId = playerID;
    const positions = ludoState.positions[playerId] || [];
    const validMoves: GameAction[] = [];

    positions.forEach((_, pieceIdx) => {
      validMoves.push({
        type: "movePiece",
        payload: { pieceIdx },
        playerID,
      });
    });

    return validMoves;
  },

  getGameStatus(state: GameEngineState) {
    const ludoState = state.data as LudoState;
    return {
      currentPlayer: ludoState.currentPlayer,
      round: ludoState.round,
      diceValue: ludoState.diceValue,
      positions: ludoState.positions,
      winner: ludoState.winner,
    };
  },
};
