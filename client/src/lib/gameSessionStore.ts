
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Prompt, RoomSettings } from "@shared/schema";

export type GameType = "local-prompts" | "ludo" | "online-prompts";
export type GameMode = "local" | "online";

export interface BaseGameSession {
  id: string;
  gameType: GameType;
  gameId: string; // Game definition ID (truth-or-dare, velvet-ludo, etc.)
  mode: GameMode;
  createdAt: number;
  players: Array<{
    nickname: string;
    avatarColor: string;
  }>;
  config: RoomSettings;
}

export interface LocalPromptsSession extends BaseGameSession {
  gameType: "local-prompts";
  prompts: Prompt[];
  currentPromptIndex: number;
  usedPromptIds: string[];
  round: number;
  turnIndex: number;
  heatLevel: number;
  stats: {
    roundsPlayed: number;
    promptsByType: Record<string, number>;
    playerPicks: Record<string, number>;
    skippedCount: number;
  };
}

export interface LudoSession extends BaseGameSession {
  gameType: "ludo";
  roomId: string;
  ludoState: any; // Full ludo game state from server
}

export interface OnlinePromptsSession extends BaseGameSession {
  gameType: "online-prompts";
  roomId: string;
  joinCode: string;
  isHost: boolean;
}

export type GameSession = LocalPromptsSession | LudoSession | OnlinePromptsSession;

interface GameSessionStore {
  sessions: Record<string, GameSession>;
  activeSessionId: string | null;
  
  // Session management
  createSession: (session: GameSession) => string;
  getSession: (sessionId: string) => GameSession | null;
  updateSession: (sessionId: string, updates: Partial<GameSession>) => void;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string | null) => void;
  clearAllSessions: () => void;
}

export const useGameSessionStore = create<GameSessionStore>()(
  persist(
    (set, get) => ({
      sessions: {},
      activeSessionId: null,

      createSession: (session) => {
        const sessionId = session.id;
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: session,
          },
          activeSessionId: sessionId,
        }));
        return sessionId;
      },

      getSession: (sessionId) => {
        return get().sessions[sessionId] || null;
      },

      updateSession: (sessionId, updates) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: { ...session, ...updates } as GameSession,
            },
          };
        });
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const { [sessionId]: deleted, ...remaining } = state.sessions;
          return {
            sessions: remaining,
            activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
          };
        });
      },

      setActiveSession: (sessionId) => {
        set({ activeSessionId: sessionId });
      },

      clearAllSessions: () => {
        set({ sessions: {}, activeSessionId: null });
      },
    }),
    {
      name: "velvetplay-sessions",
      version: 1,
    }
  )
);

// Helper to generate session IDs
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
