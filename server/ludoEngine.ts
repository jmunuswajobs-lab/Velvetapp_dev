
import type {
  LudoGameState,
  LudoPlayer,
  LudoToken,
  LudoColor,
  LudoTileId,
  ValidMove,
  LudoSpecialEffect,
  GameMode,
  TileType,
} from "@shared/schema";
import {
  LUDO_MAIN_PATH_LENGTH,
  LUDO_SAFE_PATH_LENGTH,
  LUDO_TOKENS_PER_PLAYER,
  LUDO_START_INDICES,
  LUDO_SAFE_ENTRY_INDICES,
  LUDO_SPECIAL_TILES,
} from "@shared/schema";

const PLAYER_COLORS: LudoColor[] = ["red", "blue", "green", "yellow"];

export function createInitialState(
  roomId: string,
  players: Array<{ id: string; nickname: string; avatarColor: string }>,
  gameMode: GameMode
): LudoGameState {
  const ludoPlayers: LudoPlayer[] = players.map((p, idx) => {
    const color = PLAYER_COLORS[idx];
    const tokens: LudoToken[] = Array.from({ length: LUDO_TOKENS_PER_PLAYER }, (_, i) => ({
      id: `${color}_token_${i}`,
      playerId: p.id,
      color,
      position: "home",
      pathProgress: -1,
    }));

    return {
      id: p.id,
      nickname: p.nickname,
      color,
      avatarColor: p.avatarColor,
      tokens,
      finishedTokens: 0,
    };
  });

  return {
    roomId,
    players: ludoPlayers,
    currentPlayerIndex: 0,
    diceValue: null,
    canRoll: true,
    canMove: false,
    validMoves: [],
    specialEffect: null,
    winnerId: null,
    turnNumber: 1,
    gameMode,
    frozenPlayers: new Set(),
  };
}

export function rollDice(state: LudoGameState): LudoGameState {
  if (!state.canRoll || state.winnerId) {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  
  // Check if player is frozen
  if (state.frozenPlayers.has(currentPlayer.id)) {
    // Unfreeze and skip turn
    const newFrozen = new Set(state.frozenPlayers);
    newFrozen.delete(currentPlayer.id);
    
    return {
      ...state,
      frozenPlayers: newFrozen,
      currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
      turnNumber: state.turnNumber + 1,
      canRoll: true,
      canMove: false,
      diceValue: null,
      validMoves: [],
    };
  }

  const diceValue = Math.floor(Math.random() * 6) + 1;
  const validMoves = calculateValidMoves(state, currentPlayer, diceValue);

  return {
    ...state,
    diceValue,
    canRoll: false,
    canMove: validMoves.length > 0,
    validMoves,
  };
}

function calculateValidMoves(
  state: LudoGameState,
  player: LudoPlayer,
  diceValue: number
): ValidMove[] {
  const moves: ValidMove[] = [];

  for (const token of player.tokens) {
    // Token at home
    if (token.position === "home") {
      if (diceValue === 6) {
        const startIndex = LUDO_START_INDICES[player.color];
        const startTileId = `main_${startIndex}`;
        const captureInfo = checkCapture(state, startTileId, player.id);
        
        moves.push({
          tokenId: token.id,
          targetTileId: startTileId,
          targetProgress: 0,
          willCapture: captureInfo.willCapture,
          capturedTokenId: captureInfo.capturedTokenId,
        });
      }
      continue;
    }

    // Token already finished
    if (token.position === "finished") {
      continue;
    }

    // Token on board
    const newProgress = token.pathProgress + diceValue;
    const maxProgress = LUDO_MAIN_PATH_LENGTH + LUDO_SAFE_PATH_LENGTH;
    
    // Can't overshoot finish
    if (newProgress > maxProgress) {
      continue;
    }

    const targetTileId = calculateTargetTile(player.color, token.pathProgress, diceValue);
    const captureInfo = checkCapture(state, targetTileId, player.id);

    moves.push({
      tokenId: token.id,
      targetTileId,
      targetProgress: newProgress,
      willCapture: captureInfo.willCapture,
      capturedTokenId: captureInfo.capturedTokenId,
    });
  }

  return moves;
}

function calculateTargetTile(
  playerColor: LudoColor,
  currentProgress: number,
  diceValue: number
): LudoTileId {
  const newProgress = currentProgress + diceValue;
  const safeEntryIndex = LUDO_SAFE_ENTRY_INDICES[playerColor];

  // Still on main path
  if (newProgress < LUDO_MAIN_PATH_LENGTH) {
    const mainIndex = (LUDO_START_INDICES[playerColor] + newProgress) % LUDO_MAIN_PATH_LENGTH;
    return `main_${mainIndex}`;
  }

  // Entered safe zone
  if (newProgress < LUDO_MAIN_PATH_LENGTH + LUDO_SAFE_PATH_LENGTH) {
    const safeIndex = newProgress - LUDO_MAIN_PATH_LENGTH;
    return `safe_${playerColor}_${safeIndex}`;
  }

  // Reached finish
  return "finished";
}

function checkCapture(
  state: LudoGameState,
  targetTileId: LudoTileId,
  movingPlayerId: string
): { willCapture: boolean; capturedTokenId?: string } {
  // Can't capture on safe tiles or special tiles
  if (targetTileId.startsWith("safe_") || targetTileId === "home" || targetTileId === "finished") {
    return { willCapture: false };
  }

  // Check if this is a start tile (safe from capture)
  const mainIndex = parseInt(targetTileId.split("_")[1]);
  const isStartTile = Object.values(LUDO_START_INDICES).includes(mainIndex);
  if (isStartTile) {
    return { willCapture: false };
  }

  // Look for opponent tokens on this tile
  for (const player of state.players) {
    if (player.id === movingPlayerId) continue;

    for (const token of player.tokens) {
      if (token.position === targetTileId) {
        return { willCapture: true, capturedTokenId: token.id };
      }
    }
  }

  return { willCapture: false };
}

export function applyMove(
  state: LudoGameState,
  tokenId: string,
  moveIndex: number
): LudoGameState {
  if (!state.canMove || moveIndex >= state.validMoves.length) {
    return state;
  }

  const move = state.validMoves[moveIndex];
  if (move.tokenId !== tokenId) {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  
  // Update token position
  const updatedPlayers = state.players.map((player) => {
    if (player.id === currentPlayer.id) {
      return {
        ...player,
        tokens: player.tokens.map((token) => {
          if (token.id === tokenId) {
            return {
              ...token,
              position: move.targetTileId,
              pathProgress: move.targetProgress,
            };
          }
          return token;
        }),
        finishedTokens: move.targetTileId === "finished" 
          ? player.finishedTokens + 1 
          : player.finishedTokens,
      };
    }

    // Handle capture
    if (move.willCapture && move.capturedTokenId) {
      return {
        ...player,
        tokens: player.tokens.map((token) => {
          if (token.id === move.capturedTokenId) {
            return {
              ...token,
              position: "home",
              pathProgress: -1,
            };
          }
          return token;
        }),
      };
    }

    return player;
  });

  // Check for special tile effects
  const specialEffect = checkSpecialEffect(state, move.targetTileId, currentPlayer.id);

  // Check win condition
  const winner = updatedPlayers.find(p => p.finishedTokens === LUDO_TOKENS_PER_PLAYER);

  // Determine next turn
  const rolledSix = state.diceValue === 6;
  const shouldContinue = rolledSix && !winner;
  const nextPlayerIndex = shouldContinue 
    ? state.currentPlayerIndex 
    : (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    diceValue: null,
    canRoll: true,
    canMove: false,
    validMoves: [],
    specialEffect,
    winnerId: winner?.id || null,
    turnNumber: state.turnNumber + (shouldContinue ? 0 : 1),
  };
}

function checkSpecialEffect(
  state: LudoGameState,
  tileId: LudoTileId,
  playerId: string
): LudoSpecialEffect | null {
  if (!tileId.startsWith("main_")) {
    return null;
  }

  const mainIndex = parseInt(tileId.split("_")[1]);
  const specialTile = LUDO_SPECIAL_TILES.find(t => t.index === mainIndex);

  if (!specialTile) {
    return null;
  }

  return {
    type: specialTile.type as "heat" | "bond" | "freeze",
    tileId,
    playerId,
  };
}

export function clearSpecialEffect(state: LudoGameState): LudoGameState {
  // Apply freeze effect if it was a freeze tile
  if (state.specialEffect?.type === "freeze") {
    const newFrozen = new Set(state.frozenPlayers);
    newFrozen.add(state.specialEffect.playerId);
    
    return {
      ...state,
      specialEffect: null,
      frozenPlayers: newFrozen,
    };
  }

  return {
    ...state,
    specialEffect: null,
  };
}

export function rescuePlayer(state: LudoGameState, rescuedPlayerId: string): LudoGameState {
  const newFrozen = new Set(state.frozenPlayers);
  newFrozen.delete(rescuedPlayerId);
  
  return {
    ...state,
    frozenPlayers: newFrozen,
  };
}
