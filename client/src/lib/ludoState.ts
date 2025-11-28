
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LudoGameState, LudoPlayer, GameMode } from "@shared/schema";

interface LudoStore {
  gameState: LudoGameState | null;
  isOnline: boolean;
  roomId: string | null;
  playerId: string | null;

  initLocalGame: (players: { nickname: string; avatarColor: string }[], gameMode: GameMode) => Promise<void>;
  rollDice: () => Promise<void>;
  selectMove: (tokenId: string, moveIndex: number) => Promise<void>;
  dismissSpecialEffect: () => Promise<void>;
  rescuePlayer: (playerId: string) => Promise<void>;
  endGame: () => void;
  setGameState: (state: LudoGameState) => void;
}

export const useLudoStore = create<LudoStore>()(
  persist(
    (set, get) => ({
      gameState: null,
      isOnline: false,
      roomId: null,
      playerId: null,

      initLocalGame: async (players, gameMode) => {
        try {
          const response = await fetch("/api/ludo/init-local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ players, gameMode }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Ludo init failed:", errorText);
            throw new Error(`Failed to initialize: ${response.statusText}`);
          }

          const state: any = await response.json();
          
          set({
            gameState: {
              ...state,
              frozenPlayers: new Set(state.frozenPlayers || []),
            },
            isOnline: false,
            roomId: state.roomId,
          });
        } catch (error) {
          console.error("Error initializing local game:", error);
          throw error;
        }
      },

      rollDice: async () => {
        const { roomId, gameState } = get();
        if (!gameState || !roomId || gameState.winnerId) return;

        try {
          const response = await fetch("/api/ludo/roll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId }),
          });

          if (!response.ok) throw new Error("Failed to roll dice");

          const state = await response.json();
          set({ 
            gameState: { 
              ...state, 
              frozenPlayers: new Set(state.frozenPlayers || []) 
            } 
          });
        } catch (error) {
          console.error("Error rolling dice:", error);
        }
      },

      selectMove: async (tokenId, moveIndex) => {
        const { roomId, gameState } = get();
        if (!gameState || !roomId || !gameState.canMove) return;

        try {
          const response = await fetch("/api/ludo/move", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, tokenId, moveIndex }),
          });

          if (!response.ok) throw new Error("Failed to move piece");

          const state = await response.json();
          set({ 
            gameState: { 
              ...state, 
              frozenPlayers: new Set(state.frozenPlayers || []) 
            } 
          });
        } catch (error) {
          console.error("Error moving piece:", error);
        }
      },

      dismissSpecialEffect: async () => {
        const { roomId, gameState } = get();
        if (!gameState || !roomId || !gameState.specialEffect) return;

        try {
          const response = await fetch("/api/ludo/dismiss-effect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId }),
          });

          if (!response.ok) throw new Error("Failed to dismiss effect");

          const state = await response.json();
          set({ 
            gameState: { 
              ...state, 
              frozenPlayers: new Set(state.frozenPlayers || []) 
            } 
          });
        } catch (error) {
          console.error("Error dismissing effect:", error);
        }
      },

      rescuePlayer: async (rescuedPlayerId) => {
        const { roomId } = get();
        if (!roomId) return;

        try {
          const response = await fetch("/api/ludo/rescue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, rescuedPlayerId }),
          });

          if (!response.ok) throw new Error("Failed to rescue player");

          const state = await response.json();
          set({ 
            gameState: { 
              ...state, 
              frozenPlayers: new Set(state.frozenPlayers || []) 
            } 
          });
        } catch (error) {
          console.error("Error rescuing player:", error);
        }
      },

      endGame: () => {
        set({ gameState: null, isOnline: false, roomId: null, playerId: null });
      },

      setGameState: (state) => {
        set({ 
          gameState: {
            ...state,
            frozenPlayers: new Set(state.frozenPlayers || []),
          }
        });
      },
    }),
    {
      name: "velvetplay-ludo",
    }
  )
);
