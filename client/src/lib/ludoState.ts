
import { useGameSessionStore, generateSessionId, type LudoSession } from "./gameSessionStore";
import type { GameMode } from "@shared/schema";

export async function createLudoGameSession(
  players: { nickname: string; avatarColor: string }[],
  gameMode: GameMode
): Promise<string> {
  if (!players || players.length < 2 || players.length > 4) {
    throw new Error("Must have 2-4 players for Ludo");
  }

  try {
    const response = await fetch("/api/ludo/init-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players, gameMode }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to initialize: ${errorText}`);
    }

    const ludoState = await response.json();
    const sessionId = generateSessionId();

    const session: LudoSession = {
      id: sessionId,
      gameType: "ludo",
      gameId: "c71522c3-b8b0-4fbe-b823-2f76cfbd66f9", // Velvet Ludo game ID
      mode: "local",
      createdAt: Date.now(),
      players: players.map(p => ({ ...p })),
      config: { intensity: 3, allowNSFW: false, allowMovement: true, coupleMode: gameMode === "couple", packs: [] },
      roomId: ludoState.roomId,
      ludoState: {
        ...ludoState,
        frozenPlayers: Array.from(ludoState.frozenPlayers || []),
      },
    };

    useGameSessionStore.getState().createSession(session);
    return sessionId;
  } catch (error) {
    console.error("Error creating Ludo session:", error);
    throw error;
  }
}

export function useLudoGameSession(sessionId: string) {
  const session = useGameSessionStore((state) => 
    state.sessions[sessionId] as LudoSession | undefined
  );

  const updateSession = useGameSessionStore((state) => state.updateSession);

  if (!session || session.gameType !== "ludo") {
    return null;
  }

  return {
    session,
    gameState: session.ludoState,

    rollDice: async () => {
      try {
        const response = await fetch("/api/ludo/roll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: session.roomId }),
        });

        if (!response.ok) throw new Error("Failed to roll dice");

        const state = await response.json();
        updateSession(sessionId, {
          ludoState: {
            ...state,
            frozenPlayers: Array.from(state.frozenPlayers || []),
          },
        } as Partial<LudoSession>);
      } catch (error) {
        console.error("Error rolling dice:", error);
      }
    },

    selectMove: async (tokenId: string, moveIndex: number) => {
      try {
        const response = await fetch("/api/ludo/move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: session.roomId, tokenId, moveIndex }),
        });

        if (!response.ok) throw new Error("Failed to move piece");

        const state = await response.json();
        updateSession(sessionId, {
          ludoState: {
            ...state,
            frozenPlayers: Array.from(state.frozenPlayers || []),
          },
        } as Partial<LudoSession>);
      } catch (error) {
        console.error("Error moving piece:", error);
      }
    },

    dismissSpecialEffect: async () => {
      try {
        const response = await fetch("/api/ludo/dismiss-effect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: session.roomId }),
        });

        if (!response.ok) throw new Error("Failed to dismiss effect");

        const state = await response.json();
        updateSession(sessionId, {
          ludoState: {
            ...state,
            frozenPlayers: Array.from(state.frozenPlayers || []),
          },
        } as Partial<LudoSession>);
      } catch (error) {
        console.error("Error dismissing effect:", error);
      }
    },

    rescuePlayer: async (playerId: string) => {
      try {
        const response = await fetch("/api/ludo/rescue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: session.roomId, rescuedPlayerId: playerId }),
        });

        if (!response.ok) throw new Error("Failed to rescue player");

        const state = await response.json();
        updateSession(sessionId, {
          ludoState: {
            ...state,
            frozenPlayers: Array.from(state.frozenPlayers || []),
          },
        } as Partial<LudoSession>);
      } catch (error) {
        console.error("Error rescuing player:", error);
      }
    },

    endGame: () => {
      useGameSessionStore.getState().deleteSession(sessionId);
    },
  };
}

// Legacy export for compatibility
export const useLudoStore = () => ({
  gameState: null,
  initLocalGame: async () => {},
  rollDice: async () => {},
  selectMove: async () => {},
  dismissSpecialEffect: async () => {},
  rescuePlayer: async () => {},
  endGame: () => {},
  setGameState: () => {},
});
