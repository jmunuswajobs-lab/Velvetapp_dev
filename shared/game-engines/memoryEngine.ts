import type { GameEngineState, GameAction, GameEngineConfig, GameEngineInterface } from "./types";

interface Card {
  id: number;
  matched: boolean;
}

interface MemoryState {
  cards: Card[];
  flipped: number[];
  matches: number;
  attempts: number;
  currentPlayer: number;
  players: number;
  scores: { [playerId: string]: number };
  round: number;
}

export const memoryEngine: GameEngineInterface = {
  createInitialState(config: GameEngineConfig): GameEngineState {
    const cardCount = 16; // 4x4 grid
    const cards = Array.from({ length: cardCount }, (_, i) => ({
      id: Math.floor(i / 2),
      matched: false,
    }));

    // Shuffle
    for (let i = cardCount - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    const scores: { [key: string]: number } = {};
    for (let i = 0; i < config.players; i++) {
      scores[`player-${i}`] = 0;
    }

    return {
      type: "memory",
      data: {
        cards,
        flipped: [],
        matches: 0,
        attempts: 0,
        currentPlayer: 0,
        players: config.players,
        scores,
        round: 1,
      } as MemoryState,
    };
  },

  applyAction(state: GameEngineState, action: GameAction): GameEngineState {
    const memState = state.data as MemoryState;

    if (action.type === "flipCard") {
      const newState = { ...state };
      const { cardIdx } = action.payload || {};

      if (cardIdx === undefined) return state;

      // Prevent double-flip
      if (memState.flipped.includes(cardIdx)) return state;

      const newFlipped = [...memState.flipped, cardIdx];

      // Check for match when 2 cards flipped
      if (newFlipped.length === 2) {
        const [idx1, idx2] = newFlipped;
        const match = memState.cards[idx1].id === memState.cards[idx2].id;

        if (match) {
          const newCards = memState.cards.map((card, i) =>
            i === idx1 || i === idx2 ? { ...card, matched: true } : card
          );

          const playerId = `player-${memState.currentPlayer}`;
          const newScores = { ...memState.scores };
          newScores[playerId] = (newScores[playerId] || 0) + 1;

          const allMatched = newCards.every(c => c.matched);

          newState.data = {
            ...memState,
            cards: newCards,
            flipped: [],
            matches: memState.matches + 1,
            scores: newScores,
            currentPlayer: allMatched
              ? memState.currentPlayer
              : (memState.currentPlayer + 1) % memState.players,
          };
        } else {
          // Reset after delay
          setTimeout(() => {
            // In real implementation, handle via action
          }, 800);

          newState.data = {
            ...memState,
            flipped: newFlipped,
            currentPlayer: (memState.currentPlayer + 1) % memState.players,
          };
        }
      } else {
        newState.data = {
          ...memState,
          flipped: newFlipped,
        };
      }

      return newState;
    }

    return state;
  },

  isGameOver(state: GameEngineState) {
    const memState = state.data as MemoryState;
    const allMatched = memState.cards.every(c => c.matched);

    if (allMatched) {
      const winnerId = Object.entries(memState.scores).reduce((a, b) =>
        a[1] > b[1] ? a : b
      );
      return {
        isOver: true,
        winner: parseInt(winnerId[0].split("-")[1]),
      };
    }

    return { isOver: false };
  },

  getValidMoves(state: GameEngineState) {
    const memState = state.data as MemoryState;
    const validMoves: GameAction[] = [];

    memState.cards.forEach((_, idx) => {
      if (!memState.cards[idx].matched && !memState.flipped.includes(idx)) {
        validMoves.push({
          type: "flipCard",
          payload: { cardIdx: idx },
        });
      }
    });

    return validMoves;
  },

  getGameStatus(state: GameEngineState) {
    const memState = state.data as MemoryState;
    return {
      cards: memState.cards,
      flipped: memState.flipped,
      matches: memState.matches,
      scores: memState.scores,
      currentPlayer: memState.currentPlayer,
    };
  },
};
