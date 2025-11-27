import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalGameState, RoomSettings, Prompt, GameStats, PromptType } from "@shared/schema";

// Generate random avatar color
export function getRandomAvatarColor(): string {
  const colors = [
    "#FF008A", "#FF2E6D", "#FF5E33", "#B00F2F", 
    "#3B0F5C", "#5A1A8C", "#E3C089", "#7B2CB3"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Generate 6-character join code
export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

interface AgeVerificationState {
  isVerified: boolean;
  verifiedAt: Date | null;
  setVerified: () => void;
}

export const useAgeVerification = create<AgeVerificationState>()(
  persist(
    (set) => ({
      isVerified: false,
      verifiedAt: null,
      setVerified: () => set({ isVerified: true, verifiedAt: new Date() }),
    }),
    {
      name: "velvetplay-age-verified",
    }
  )
);

interface LocalGameStore {
  gameState: LocalGameState | null;
  
  // Actions
  initGame: (
    gameId: string,
    players: { nickname: string; avatarColor: string }[],
    settings: RoomSettings,
    prompts: Prompt[]
  ) => void;
  nextPrompt: () => Prompt | null;
  previousPrompt: () => Prompt | null;
  skipPrompt: () => void;
  updateHeatLevel: (delta: number) => void;
  advanceTurn: () => void;
  endGame: () => GameStats;
  resetGame: () => void;
}

export const useLocalGame = create<LocalGameStore>((set, get) => ({
  gameState: null,

  initGame: (gameId, players, settings, prompts) => {
    // Clear any existing game state first to prevent memory leaks
    const currentState = get().gameState;
    if (currentState) {
      console.log("Clearing previous game state");
      // Explicitly clear prompts array
      currentState.prompts = [];
      currentState.usedPromptIds = [];
    }
    
    // Shuffle prompts - create new array to avoid references
    const shuffledPrompts = prompts.map(p => ({ ...p })).sort(() => Math.random() - 0.5);
    
    set({
      gameState: {
        gameId,
        players: players.map(p => ({ ...p })),
        settings: { ...settings },
        currentPromptIndex: 0,
        prompts: shuffledPrompts,
        usedPromptIds: [],
        round: 1,
        turnIndex: 0,
        heatLevel: 0,
        stats: {
          roundsPlayed: 0,
          promptsByType: {
            truth: 0,
            dare: 0,
            challenge: 0,
            confession: 0,
            vote: 0,
            rule: 0,
          },
          playerPicks: {},
          skippedCount: 0,
        },
      },
    });
  },

  nextPrompt: () => {
    const { gameState } = get();
    if (!gameState) return null;

    const nextIndex = gameState.currentPromptIndex + 1;
    if (nextIndex >= gameState.prompts.length) {
      return null; // No more prompts
    }

    const prompt = gameState.prompts[nextIndex];
    const currentPlayer = gameState.players[gameState.turnIndex];

    set({
      gameState: {
        ...gameState,
        currentPromptIndex: nextIndex,
        usedPromptIds: [...gameState.usedPromptIds, prompt.id],
        stats: {
          ...gameState.stats,
          roundsPlayed: gameState.stats.roundsPlayed + 1,
          promptsByType: {
            ...gameState.stats.promptsByType,
            [prompt.type as PromptType]: (gameState.stats.promptsByType[prompt.type as PromptType] || 0) + 1,
          },
          playerPicks: {
            ...gameState.stats.playerPicks,
            [currentPlayer.nickname]: (gameState.stats.playerPicks[currentPlayer.nickname] || 0) + 1,
          },
        },
      },
    });

    return prompt;
  },

  previousPrompt: () => {
    const { gameState } = get();
    if (!gameState) return null;

    const prevIndex = Math.max(0, gameState.currentPromptIndex - 1);
    const prompt = gameState.prompts[prevIndex];

    set({
      gameState: {
        ...gameState,
        currentPromptIndex: prevIndex,
      },
    });

    return prompt;
  },

  skipPrompt: () => {
    const { gameState } = get();
    if (!gameState) return;

    set({
      gameState: {
        ...gameState,
        stats: {
          ...gameState.stats,
          skippedCount: gameState.stats.skippedCount + 1,
        },
      },
    });

    get().nextPrompt();
  },

  updateHeatLevel: (delta) => {
    const { gameState } = get();
    if (!gameState) return;

    const newLevel = Math.min(100, Math.max(0, gameState.heatLevel + delta));

    set({
      gameState: {
        ...gameState,
        heatLevel: newLevel,
      },
    });
  },

  advanceTurn: () => {
    const { gameState } = get();
    if (!gameState) return;

    const nextTurnIndex = (gameState.turnIndex + 1) % gameState.players.length;
    const newRound = nextTurnIndex === 0 ? gameState.round + 1 : gameState.round;

    set({
      gameState: {
        ...gameState,
        turnIndex: nextTurnIndex,
        round: newRound,
      },
    });
  },

  endGame: () => {
    const { gameState } = get();
    if (!gameState) {
      return {
        roundsPlayed: 0,
        promptsByType: { truth: 0, dare: 0, challenge: 0, confession: 0, vote: 0, rule: 0 },
        playerPicks: {},
        skippedCount: 0,
      };
    }

    return gameState.stats;
  },

  resetGame: () => {
    const state = get();
    if (state.gameState) {
      // Clear all arrays to free memory
      state.gameState.prompts = [];
      state.gameState.usedPromptIds = [];
      state.gameState.players = [];
    }
    set({ gameState: null });
  },
}));

// Online room state (synced via WebSocket)
interface OnlineRoomState {
  roomId: string | null;
  joinCode: string | null;
  gameSlug: string | null;
  isHost: boolean;
  isConnected: boolean;
  players: {
    id: string;
    nickname: string;
    avatarColor: string;
    isHost: boolean;
    isReady: boolean;
  }[];
  gameStarted: boolean;
  gameState: LocalGameState | null;
}

interface OnlineRoomStore extends OnlineRoomState {
  setRoom: (roomId: string, joinCode: string, isHost: boolean, gameSlug?: string) => void;
  setGameSlug: (gameSlug: string) => void;
  setConnected: (connected: boolean) => void;
  updatePlayers: (players: OnlineRoomState["players"]) => void;
  setGameStarted: (started: boolean) => void;
  initGameState: (prompts: Prompt[], players: OnlineRoomState["players"]) => void;
  nextPrompt: () => Prompt | null;
  previousPrompt: () => Prompt | null;
  skipPrompt: () => void;
  updateHeatLevel: (delta: number) => void;
  advanceTurn: () => void;
  endGame: () => GameStats;
  resetGame: () => void;
  reset: () => void;
}

const initialOnlineState: OnlineRoomState = {
  roomId: null,
  joinCode: null,
  gameSlug: null,
  isHost: false,
  isConnected: false,
  players: [],
  gameStarted: false,
  gameState: null,
};

export const useOnlineRoom = create<OnlineRoomStore>((set, get) => ({
  ...initialOnlineState,

  setRoom: (roomId, joinCode, isHost, gameSlug) => 
    set({ roomId, joinCode, isHost, gameSlug: gameSlug || null }),

  setGameSlug: (gameSlug) => 
    set({ gameSlug }),

  setConnected: (isConnected) => 
    set({ isConnected }),

  updatePlayers: (players) => 
    set({ players }),

  setGameStarted: (gameStarted) => 
    set({ gameStarted }),

  initGameState: (prompts, players) => {
    // Clear previous state to prevent memory leaks
    const currentState = get().gameState;
    if (currentState) {
      console.log("Clearing previous online game state");
      currentState.prompts = [];
      currentState.usedPromptIds = [];
    }
    
    const shuffledPrompts = prompts.map(p => ({ ...p })).sort(() => Math.random() - 0.5);
    
    const newGameState = {
      gameId: get().roomId || "",
      players: players.map(p => ({
        nickname: p.nickname,
        avatarColor: p.avatarColor,
      })),
      settings: {
        intensity: 3,
        allowNSFW: false,
        allowMovement: true,
        coupleMode: false,
        packs: [],
      },
      currentPromptIndex: 0,
      prompts: shuffledPrompts,
      usedPromptIds: [],
      round: 1,
      turnIndex: 0,
      heatLevel: 0,
      stats: {
        roundsPlayed: 0,
        promptsByType: {
          truth: 0,
          dare: 0,
          challenge: 0,
          confession: 0,
          vote: 0,
          rule: 0,
        },
        playerPicks: {},
        skippedCount: 0,
      },
    };
    
    set({ gameState: newGameState, gameStarted: true });
  },

  nextPrompt: () => {
    const { gameState } = get();
    if (!gameState) return null;

    const nextIndex = gameState.currentPromptIndex + 1;
    if (nextIndex >= gameState.prompts.length) {
      return null;
    }

    const prompt = gameState.prompts[nextIndex];
    const currentPlayer = gameState.players[gameState.turnIndex];

    set({
      gameState: {
        ...gameState,
        currentPromptIndex: nextIndex,
        usedPromptIds: [...gameState.usedPromptIds, prompt.id],
        stats: {
          ...gameState.stats,
          roundsPlayed: gameState.stats.roundsPlayed + 1,
          promptsByType: {
            ...gameState.stats.promptsByType,
            [prompt.type as PromptType]: (gameState.stats.promptsByType[prompt.type as PromptType] || 0) + 1,
          },
          playerPicks: {
            ...gameState.stats.playerPicks,
            [currentPlayer.nickname]: (gameState.stats.playerPicks[currentPlayer.nickname] || 0) + 1,
          },
        },
      },
    });

    return prompt;
  },

  previousPrompt: () => {
    const { gameState } = get();
    if (!gameState) return null;

    const prevIndex = Math.max(0, gameState.currentPromptIndex - 1);
    const prompt = gameState.prompts[prevIndex];

    set({
      gameState: {
        ...gameState,
        currentPromptIndex: prevIndex,
      },
    });

    return prompt;
  },

  skipPrompt: () => {
    const { gameState } = get();
    if (!gameState) return;

    set({
      gameState: {
        ...gameState,
        stats: {
          ...gameState.stats,
          skippedCount: gameState.stats.skippedCount + 1,
        },
      },
    });

    get().nextPrompt();
  },

  updateHeatLevel: (delta) => {
    const { gameState } = get();
    if (!gameState) return;

    const newLevel = Math.min(100, Math.max(0, gameState.heatLevel + delta));

    set({
      gameState: {
        ...gameState,
        heatLevel: newLevel,
      },
    });
  },

  advanceTurn: () => {
    const { gameState } = get();
    if (!gameState) return;

    const nextTurnIndex = (gameState.turnIndex + 1) % gameState.players.length;
    const newRound = nextTurnIndex === 0 ? gameState.round + 1 : gameState.round;

    set({
      gameState: {
        ...gameState,
        turnIndex: nextTurnIndex,
        round: newRound,
      },
    });
  },

  endGame: () => {
    const { gameState } = get();
    if (!gameState) {
      return {
        roundsPlayed: 0,
        promptsByType: { truth: 0, dare: 0, challenge: 0, confession: 0, vote: 0, rule: 0 },
        playerPicks: {},
        skippedCount: 0,
      };
    }

    return gameState.stats;
  },

  resetGame: () => {
    const state = get();
    if (state.gameState) {
      // Clear all arrays to free memory
      state.gameState.prompts = [];
      state.gameState.usedPromptIds = [];
      state.gameState.players = [];
    }
    set({ gameState: null, gameStarted: false });
  },

  reset: () => {
    const state = get();
    if (state.gameState) {
      state.gameState.prompts = [];
      state.gameState.usedPromptIds = [];
      state.gameState.players = [];
    }
    set(initialOnlineState);
  },
}));
