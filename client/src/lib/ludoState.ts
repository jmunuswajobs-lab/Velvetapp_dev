import { create } from "zustand";
import type { LudoGameState, LudoPlayer, GameMode, Prompt } from "@shared/schema";

interface LudoStore {
  gameState: LudoGameState | null;
  isOnline: boolean;
  roomId: string | null;
  playerId: string | null;
  ws: WebSocket | null;

  initLocalGame: (players: { nickname: string; avatarColor: string }[], gameMode: GameMode) => void;
  initOnlineGame: (roomId: string, playerId: string, ws: WebSocket) => void;
  rollDice: () => void;
  selectMove: (tokenId: string, moveIndex: number) => void;
  dismissSpecialEffect: () => void;
  rescuePlayer: (playerId: string) => void;
  endGame: () => void;
  setGameState: (state: LudoGameState) => void;
}

export const useLudoStore = create<LudoStore>((set, get) => ({
  gameState: null,
  isOnline: false,
  roomId: null,
  playerId: null,
  ws: null,

  initLocalGame: async (players, gameMode) => {
    try {
      const response = await fetch("/api/ludo/init-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players, gameMode }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize local game");
      }

      const state: LudoGameState = await response.json();
      set({
        gameState: {
          ...state,
          frozenPlayers: new Set(state.frozenPlayers),
        },
        isOnline: false,
        roomId: state.roomId,
      });
    } catch (error) {
      console.error("Error initializing local game:", error);
    }
  },

  initOnlineGame: (roomId, playerId, ws) => {
    set({ roomId, playerId, isOnline: true, ws });

    // Request initial state
    ws.send(JSON.stringify({ type: "ludo:get-state", roomId }));
  },

  rollDice: () => {
    const { isOnline, ws, roomId, playerId, gameState } = get();

    if (!gameState || gameState.winnerId) return;

    if (isOnline && ws && roomId) {
      ws.send(JSON.stringify({ type: "ludo:roll", roomId, playerId }));
    } else if (!isOnline && roomId) {
      fetch("/api/ludo/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })
        .then(res => res.json())
        .then(state => set({ gameState: { ...state, frozenPlayers: new Set(state.frozenPlayers) } }));
    }
  },

  selectMove: (tokenId, moveIndex) => {
    const { isOnline, ws, roomId, playerId, gameState } = get();

    if (!gameState || !gameState.canMove) return;

    if (isOnline && ws && roomId) {
      ws.send(JSON.stringify({ type: "ludo:move", roomId, playerId, tokenId, moveIndex }));
    } else if (!isOnline && roomId) {
      fetch("/api/ludo/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, tokenId, moveIndex }),
      })
        .then(res => res.json())
        .then(state => set({ gameState: { ...state, frozenPlayers: new Set(state.frozenPlayers) } }));
    }
  },

  dismissSpecialEffect: () => {
    const { isOnline, ws, roomId, playerId, gameState } = get();

    if (!gameState || !gameState.specialEffect) return;

    if (isOnline && ws && roomId) {
      ws.send(JSON.stringify({ type: "ludo:dismiss-effect", roomId, playerId }));
    } else if (!isOnline && roomId) {
      fetch("/api/ludo/dismiss-effect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })
        .then(res => res.json())
        .then(state => set({ gameState: { ...state, frozenPlayers: new Set(state.frozenPlayers) } }));
    }
  },

  rescuePlayer: (rescuedPlayerId) => {
    const { isOnline, ws, roomId, playerId } = get();

    if (isOnline && ws && roomId) {
      ws.send(JSON.stringify({ type: "ludo:rescue", roomId, playerId, rescuedPlayerId }));
    } else if (!isOnline && roomId) {
      fetch("/api/ludo/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, rescuedPlayerId }),
      })
        .then(res => res.json())
        .then(state => set({ gameState: { ...state, frozenPlayers: new Set(state.frozenPlayers) } }));
    }
  },

  endGame: () => {
    set({ gameState: null, isOnline: false, roomId: null, playerId: null, ws: null });
  },

  setGameState: (state) => {
    set({ 
      gameState: {
        ...state,
        frozenPlayers: new Set(state.frozenPlayers),
      }
    });
  },
}));