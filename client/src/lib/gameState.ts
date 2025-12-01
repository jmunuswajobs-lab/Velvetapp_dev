import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalGameState, RoomSettings, Prompt, GameStats, PromptType } from "@shared/schema";

import { useGameSessionStore, generateSessionId, type LocalPromptsSession } from "./gameSessionStore";
import type { Prompt as SharedPrompt, RoomSettings as SharedRoomSettings } from "@shared/schema";


// Generate random avatar color
export function getRandomAvatarColor(): string {
  const colors = [
    "#FF008A", "#FF2E6D", "#FF5E33", "#B00F2F", 
    "#3B0F5C", "#5A1A8C", "#E3C089", "#7B2CB3"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Age verification (unchanged)
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

// Local game actions
export function createLocalGameSession(
  gameId: string,
  players: { nickname: string; avatarColor: string }[],
  settings: SharedRoomSettings,
  prompts: SharedPrompt[]
): string {
  if (!prompts || prompts.length === 0) {
    throw new Error("Cannot create game session without prompts");
  }

  if (!players || players.length < 2) {
    throw new Error("Cannot create game session without at least 2 players");
  }

  const sessionId = generateSessionId();
  const shuffledPrompts = [...prompts].sort(() => Math.random() - 0.5);

  const session: LocalPromptsSession = {
    id: sessionId,
    gameType: "local-prompts",
    gameId,
    mode: "local",
    createdAt: Date.now(),
    players: players.map(p => ({ ...p })),
    config: { ...settings },
    prompts: shuffledPrompts,
    currentPromptIndex: 0,
    usedPromptIds: [],
    round: 1,
    turnIndex: 0,
    heatLevel: 0,
    stats: {
      roundsPlayed: 0,
      promptsByType: {},
      playerPicks: {},
      skippedCount: 0,
    },
  };

  useGameSessionStore.getState().createSession(session);
  return sessionId;
}

export function useLocalGameSession(sessionId: string) {
  const session = useGameSessionStore((state) => 
    state.sessions[sessionId] as LocalPromptsSession | undefined
  );

  const updateSession = useGameSessionStore((state) => state.updateSession);

  if (!session || session.gameType !== "local-prompts") {
    return null;
  }

  return {
    session,

    nextPrompt: () => {
      const nextIndex = session.currentPromptIndex + 1;
      if (nextIndex >= session.prompts.length) {
        return null;
      }

      const prompt = session.prompts[nextIndex];
      const currentPlayer = session.players[session.turnIndex];

      updateSession(sessionId, {
        currentPromptIndex: nextIndex,
        usedPromptIds: [...session.usedPromptIds, prompt.id],
        stats: {
          ...session.stats,
          roundsPlayed: session.stats.roundsPlayed + 1,
          promptsByType: {
            ...session.stats.promptsByType,
            [prompt.type]: (session.stats.promptsByType[prompt.type] || 0) + 1,
          },
          playerPicks: {
            ...session.stats.playerPicks,
            [currentPlayer.nickname]: (session.stats.playerPicks[currentPlayer.nickname] || 0) + 1,
          },
        },
      } as Partial<LocalPromptsSession>);

      return prompt;
    },

    previousPrompt: () => {
      const prevIndex = Math.max(0, session.currentPromptIndex - 1);
      updateSession(sessionId, { currentPromptIndex: prevIndex } as Partial<LocalPromptsSession>);
      return session.prompts[prevIndex];
    },

    skipPrompt: () => {
      updateSession(sessionId, {
        stats: {
          ...session.stats,
          skippedCount: session.stats.skippedCount + 1,
        },
      } as Partial<LocalPromptsSession>);
    },

    updateHeatLevel: (delta: number) => {
      const newLevel = Math.min(100, Math.max(0, session.heatLevel + delta));
      updateSession(sessionId, { heatLevel: newLevel } as Partial<LocalPromptsSession>);
    },

    advanceTurn: () => {
      const nextTurnIndex = (session.turnIndex + 1) % session.players.length;
      const newRound = nextTurnIndex === 0 ? session.round + 1 : session.round;
      updateSession(sessionId, { 
        turnIndex: nextTurnIndex, 
        round: newRound 
      } as Partial<LocalPromptsSession>);
    },

    endGame: () => {
      useGameSessionStore.getState().deleteSession(sessionId);
      return session.stats;
    },
  };
}

// Legacy compatibility - will be removed after migration
export const useLocalGame = create(() => ({
  gameState: null,
  initGame: () => {},
  nextPrompt: () => null,
  previousPrompt: () => null,
  skipPrompt: () => {},
  updateHeatLevel: () => {},
  advanceTurn: () => {},
  endGame: () => ({}),
  resetGame: () => {},
}));

// Online room state
interface OnlineRoomState {
  roomId: string | null;
  joinCode: string | null;
  gameSlug: string | null;
  isHost: boolean;
  isConnected: boolean;
  players: Array<{ id: string; nickname: string; avatarColor: string; isHost: boolean; isReady: boolean }>;
  gameStarted: boolean;
  gameState: any;
  setRoom: (roomId: string, joinCode: string, isHost: boolean) => void;
  setGameSlug: (slug: string) => void;
  setConnected: (connected: boolean) => void;
  updatePlayers: (players: any[]) => void;
  setGameStarted: (started: boolean) => void;
  initGameState: (prompts: any[], players: any[]) => void;
  nextPrompt: () => null;
  previousPrompt: () => null;
  skipPrompt: () => void;
  updateHeatLevel: (delta: number) => void;
  advanceTurn: () => void;
  endGame: () => {};
  resetGame: () => void;
  reset: () => void;
}

export const useOnlineRoom = create<OnlineRoomState>((set) => ({
  roomId: null,
  joinCode: null,
  gameSlug: null,
  isHost: false,
  isConnected: false,
  players: [],
  gameStarted: false,
  gameState: null,
  setRoom: (roomId: string, joinCode: string, isHost: boolean) => set({ roomId, joinCode, isHost }),
  setGameSlug: (gameSlug: string) => set({ gameSlug }),
  setConnected: (isConnected: boolean) => set({ isConnected }),
  updatePlayers: (players: any[]) => set({ players }),
  setGameStarted: (gameStarted: boolean) => set({ gameStarted }),
  initGameState: (gameState: any) => set({ gameState }),
  nextPrompt: () => null,
  previousPrompt: () => null,
  skipPrompt: () => {},
  updateHeatLevel: () => {},
  advanceTurn: () => {},
  endGame: () => ({}),
  resetGame: () => {},
  reset: () => set({ roomId: null, joinCode: null, gameSlug: null, isHost: false, isConnected: false, players: [], gameStarted: false, gameState: null }),
}));