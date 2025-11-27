import { create } from "zustand";
import type { LudoGameState, LudoPlayer, LudoPiece, LudoColor, VelvetSpace, Prompt } from "@shared/schema";
import { LUDO_BOARD_SIZE, LUDO_START_POSITIONS, VELVET_SPACE_POSITIONS, LUDO_HOME_ENTRY } from "@shared/schema";
import { nanoid } from "nanoid";

interface LudoStore {
  gameState: LudoGameState | null;
  isOnline: boolean;
  roomId: string | null;
  playerId: string | null;
  ws: WebSocket | null;
  
  initLocalGame: (players: { nickname: string; avatarColor: string }[]) => void;
  initOnlineGame: (roomId: string, playerId: string) => void;
  rollDice: () => void;
  movePiece: (pieceId: string) => void;
  completePrompt: () => void;
  endGame: () => void;
  setWs: (ws: WebSocket) => void;
  handleWsMessage: (message: any) => void;
}

const LUDO_COLORS: LudoColor[] = ["red", "blue", "green", "yellow"];

function createVelvetSpaces(): VelvetSpace[] {
  const types: Array<VelvetSpaceType> = ["heat", "dare", "truth", "bond", "kiss", "freeze", "wild"];
  const descriptions: Record<VelvetSpaceType, string> = {
    heat: "Heat Tile - Triggers spicy prompt",
    bond: "Bond Tile - Cooperative action",
    freeze: "Freeze Tile - Skip turn unless partner saves you",
    wild: "Wild Tile - Random effect",
    dare: "Dare Tile - Bold challenge",
    truth: "Truth Tile - Reveal secrets",
    kiss: "Kiss Tile - Romantic moment",
    massage: "Massage Tile - Sensual touch",
    compliment: "Compliment Tile - Sweet words",
  };
  
  return VELVET_SPACE_POSITIONS.map((pos, idx) => ({
    position: pos,
    type: types[idx % types.length],
    description: descriptions[types[idx % types.length]],
  }));
}

function createPlayer(nickname: string, avatarColor: string, color: LudoColor, index: number): LudoPlayer {
  const pieces: LudoPiece[] = Array.from({ length: 4 }, (_, i) => ({
    id: `${color}-${i}`,
    color,
    position: -1,
    player: `player-${index}`,
    isHome: false,
  }));

  return {
    id: `player-${index}`,
    nickname,
    avatarColor,
    color,
    pieces,
    hasFinished: false,
  };
}

export const useLudoStore = create<LudoStore>((set, get) => ({
  gameState: null,
  isOnline: false,
  roomId: null,
  playerId: null,
  ws: null,

  initLocalGame: (players) => {
    const ludoPlayers: LudoPlayer[] = players.map((p, idx) => 
      createPlayer(p.nickname, p.avatarColor, LUDO_COLORS[idx], idx)
    );

    set({
      gameState: {
        boardSize: LUDO_BOARD_SIZE,
        players: ludoPlayers,
        currentTurn: 0,
        diceValue: null,
        canRollAgain: false,
        velvetSpaces: createVelvetSpaces(),
        currentPrompt: null,
        winner: null,
        gamePhase: "rolling",
        turnCount: 0,
      },
      isOnline: false,
    });
  },

  initOnlineGame: (roomId, playerId) => {
    set({ roomId, playerId, isOnline: true });
  },

  rollDice: () => {
    const { gameState, isOnline, ws, roomId, playerId } = get();
    if (!gameState || gameState.gamePhase !== "rolling") return;

    if (isOnline && ws) {
      ws.send(JSON.stringify({ type: "ludo_roll_dice", roomId, playerId }));
    } else {
      const diceValue = Math.floor(Math.random() * 6) + 1;
      const canRollAgain = diceValue === 6;

      set({
        gameState: {
          ...gameState,
          diceValue,
          canRollAgain,
          gamePhase: "moving",
        },
      });
    }
  },

  movePiece: (pieceId) => {
    const { gameState, isOnline, ws, roomId } = get();
    if (!gameState || gameState.gamePhase !== "moving" || !gameState.diceValue) return;

    const currentPlayer = gameState.players[gameState.currentTurn];
    const piece = currentPlayer.pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const diceValue = gameState.diceValue;
    let newPosition: number;
    let canMove = false;

    if (piece.position === -1) {
      if (diceValue === 6) {
        newPosition = LUDO_START_POSITIONS[currentPlayer.color];
        canMove = true;
      } else {
        return;
      }
    } else {
      newPosition = (piece.position + diceValue) % LUDO_BOARD_SIZE;
      canMove = true;
    }

    if (!canMove) return;

    const landedOnVelvet = VELVET_SPACE_POSITIONS.includes(newPosition);

    let capturedPiece: string | null = null;
    const updatedPlayers = gameState.players.map((player, pIdx) => {
      if (pIdx === gameState.currentTurn) {
        return {
          ...player,
          pieces: player.pieces.map(p => 
            p.id === pieceId ? { ...p, position: newPosition } : p
          ),
        };
      } else {
        const captured = player.pieces.find(p => p.position === newPosition && p.position !== -1);
        if (captured) {
          capturedPiece = captured.id;
          return {
            ...player,
            pieces: player.pieces.map(p =>
              p.id === captured.id ? { ...p, position: -1 } : p
            ),
          };
        }
        return player;
      }
    });

    if (isOnline && ws) {
      ws.send(JSON.stringify({
        type: "ludo_move_piece",
        roomId,
        pieceId,
        currentPosition: piece.position,
        diceValue,
      }));
    } else {
      let nextPhase: "rolling" | "moving" | "prompt" | "finished" = "rolling";
      let nextTurn = gameState.currentTurn;

      if (landedOnVelvet) {
        nextPhase = "prompt";
      } else if (!gameState.canRollAgain) {
        nextTurn = (gameState.currentTurn + 1) % gameState.players.length;
      }

      set({
        gameState: {
          ...gameState,
          players: updatedPlayers,
          diceValue: null,
          gamePhase: nextPhase,
          currentTurn: nextTurn,
          turnCount: gameState.turnCount + 1,
        },
      });
    }
  },

  completePrompt: () => {
    const { gameState, isOnline, ws, roomId } = get();
    if (!gameState) return;

    if (isOnline && ws) {
      ws.send(JSON.stringify({ type: "ludo_prompt_complete", roomId }));
    } else {
      const nextTurn = gameState.canRollAgain 
        ? gameState.currentTurn 
        : (gameState.currentTurn + 1) % gameState.players.length;

      set({
        gameState: {
          ...gameState,
          gamePhase: "rolling",
          currentPrompt: null,
          currentTurn: nextTurn,
        },
      });
    }
  },

  endGame: () => {
    set({ gameState: null, isOnline: false, roomId: null, playerId: null });
  },

  setWs: (ws) => set({ ws }),

  handleWsMessage: (message) => {
    const { gameState } = get();
    if (!gameState) return;

    switch (message.type) {
      case "ludo_dice_result":
        set({
          gameState: {
            ...gameState,
            diceValue: message.diceValue,
            canRollAgain: message.canRollAgain,
            gamePhase: "moving",
          },
        });
        break;

      case "ludo_piece_moved":
        set({
          gameState: {
            ...gameState,
            gamePhase: message.landedOnVelvet ? "prompt" : "rolling",
            currentPrompt: message.prompt || null,
          },
        });
        break;

      case "ludo_turn_changed":
        set({
          gameState: {
            ...gameState,
            currentTurn: message.currentTurn,
            gamePhase: "rolling",
            diceValue: null,
          },
        });
        break;

      case "ludo_prompt_done":
        set({
          gameState: {
            ...gameState,
            gamePhase: "rolling",
            currentPrompt: null,
          },
        });
        break;

      case "ludo_winner":
        set({
          gameState: {
            ...gameState,
            winner: message.winnerId,
            gamePhase: "finished",
          },
        });
        break;
    }
  },
}));
