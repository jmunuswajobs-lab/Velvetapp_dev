import type { Express } from "express";
import type { Server as HTTPServer } from "http";
import { storage } from "./storage";
import { games, packs, prompts, rooms, roomPlayers, users, type InsertRoom, type InsertRoomPlayer, type RoomSettings, type VelvetSpaceType, type LudoColor, LUDO_START_INDICES } from "@shared/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { WebSocketServer, WebSocket } from "ws";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createRoomSchema, joinRoomSchema, insertPromptSchema } from "@shared/schema";
import { sanitizeNickname, validateRoomId, validatePlayerId } from "./utils";

// Store active WebSocket connections by roomId and playerId
const roomConnections = new Map<string, Map<string, WebSocket>>();

// Rate limiting map: playerId -> last action timestamp
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 100; // Minimum 100ms between actions

function isRateLimited(playerId: string): boolean {
  const now = Date.now();
  const lastAction = rateLimitMap.get(playerId) || 0;
  
  if (now - lastAction < RATE_LIMIT_MS) {
    return true;
  }
  
  rateLimitMap.set(playerId, now);
  return false;
}

function log(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [websocket] ${message}`);
}

function broadcastToRoom(roomId: string, message: object, excludePlayerId?: string) {
  const connections = roomConnections.get(roomId);
  if (!connections) return;

  const data = JSON.stringify(message);
  connections.forEach((ws, playerId) => {
    if (playerId !== excludePlayerId && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

export async function registerRoutes(
  httpServer: HTTPServer,
  app: Express
): Promise<HTTPServer> {

  // Set up WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: "/ws"
  });

  const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
  const host = process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'localhost:5000';
  log(`WebSocket server ready at ${protocol}://${host}/ws`);

  wss.on("connection", (ws, req) => {
    log(`WebSocket connected from ${req.socket.remoteAddress}`);
    let currentRoomId: string | null = null;
    let currentPlayerId: string | null = null;

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Validate message structure
        if (!message || typeof message !== 'object' || !message.type) {
          log(`Invalid message format received`);
          ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
          return;
        }

        // Rate limiting (except for join_room)
        if (message.type !== "join_room" && currentPlayerId && isRateLimited(currentPlayerId)) {
          log(`Rate limit exceeded for player ${currentPlayerId}`);
          return;
        }

        log(`Received message: ${message.type} from room ${message.roomId || 'unknown'}`);

        switch (message.type) {
          case "join_room": {
            const { roomId, playerId } = message;
            currentRoomId = roomId;
            currentPlayerId = playerId;
            // Add connection to room with playerId as key
            if (!roomConnections.has(roomId)) {
              roomConnections.set(roomId, new Map());
            }

            if (playerId) {
              log(`Player ${playerId} joining room ${roomId}`);
              roomConnections.get(roomId)!.set(playerId, ws);
            } else {
              log(`Warning: Player joining room ${roomId} without playerId`);
              roomConnections.get(roomId)!.set(`temp_${Date.now()}`, ws);
            }

            // Get room and players
            const room = await storage.getRoom(roomId);
            const players = await storage.getRoomPlayers(roomId);

            log(`Room ${roomId} has ${players.length} players`);

            // Get game info
            const game = room ? await storage.getGame(room.gameId) : null;

            // Broadcast updated player list to all connections in the room
            const connections = roomConnections.get(roomId);
            if (connections) {
              const update = JSON.stringify({
                type: "room_update",
                players: players.map((p) => ({
                  id: p.id,
                  nickname: p.nickname,
                  avatarColor: p.avatarColor,
                  isHost: p.isHost,
                  isReady: p.isReady,
                })),
                gameSlug: game?.slug,
              });

              log(`Broadcasting to ${connections.size} connections`);
              connections.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(update);
                }
              });
            }
            break;
          }

          case "toggle_ready": {
            const toggleRoomId = message.roomId || currentRoomId;
            const togglePlayerId = message.playerId || currentPlayerId;

            if (!toggleRoomId || !togglePlayerId) {
              log(`Cannot toggle ready: roomId=${toggleRoomId}, playerId=${togglePlayerId}`);
              ws.send(JSON.stringify({
                type: "error",
                message: "Invalid room or player ID"
              }));
              break;
            }

            log(`Toggle ready for player ${togglePlayerId} in room ${toggleRoomId}`);

            // Get all players to find the current player
            const players = await storage.getRoomPlayers(toggleRoomId);
            const player = players.find(p => p.id === togglePlayerId);

            if (!player) {
              log(`Player ${togglePlayerId} not found in database`);
              ws.send(JSON.stringify({
                type: "error",
                message: "Player not found"
              }));
              break;
            }

            // Toggle ready state
            const newReadyState = !player.isReady;
            log(`Toggling ready state for ${player.nickname} to ${newReadyState}`);

            await storage.updateRoomPlayer(togglePlayerId, { isReady: newReadyState });

            // Broadcast the updated player list
            const updatedPlayers = await storage.getRoomPlayers(toggleRoomId);

            broadcastToRoom(toggleRoomId, {
              type: "room_update",
              players: updatedPlayers.map((p) => ({
                id: p.id,
                nickname: p.nickname,
                avatarColor: p.avatarColor,
                isHost: p.isHost,
                isReady: p.isReady,
              })),
            });
            break;
          }

          case "start_game": {
            // SECURITY: Use only the authenticated currentRoomId and currentPlayerId
            // to prevent privilege escalation via spoofed message.playerId
            if (!currentRoomId || !currentPlayerId) {
              log(`Cannot start game: not authenticated to a room`);
              ws.send(JSON.stringify({ type: "error", message: "Not connected to a room" }));
              return;
            }

            const room = await storage.getRoom(currentRoomId);
            if (!room) {
              log(`Room ${currentRoomId} not found`);
              ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
              return;
            }

            // Validate that the requesting player is the host using authenticated ID
            const players = await storage.getRoomPlayers(currentRoomId);
            const requestingPlayer = players.find(p => p.id === currentPlayerId);
            
            if (!requestingPlayer) {
              log(`Player ${currentPlayerId} not found in room ${currentRoomId}`);
              ws.send(JSON.stringify({ type: "error", message: "Player not found in room" }));
              return;
            }
            
            if (!requestingPlayer.isHost) {
              log(`Non-host player ${currentPlayerId} attempted to start game in room ${currentRoomId}`);
              ws.send(JSON.stringify({ type: "error", message: "Only the host can start the game" }));
              return;
            }

            // Check if all players are ready (except host who is always ready)
            const allReady = players.every(p => p.isReady || p.isHost);
            if (!allReady) {
              log(`Cannot start game: not all players are ready`);
              ws.send(JSON.stringify({ type: "error", message: "Not all players are ready" }));
              return;
            }

            await storage.updateRoom(currentRoomId, { status: "in-progress" });

            // Get game and prompts
            const game = await storage.getGame(room.gameId);
            const prompts = await storage.getPromptsByGameId(room.gameId, {
              intensity: (room.settings as any)?.intensity || 3,
            });

            // Shuffle prompts
            const shuffledPrompts = [...prompts].sort(() => Math.random() - 0.5);

            broadcastToRoom(currentRoomId, {
              type: "game_started",
              prompts: shuffledPrompts,
              players: players.map((p) => ({
                id: p.id,
                nickname: p.nickname,
                avatarColor: p.avatarColor,
                isHost: p.isHost,
                isReady: p.isReady,
              })),
              gameSlug: game?.slug,
            });
            break;
          }

          case "next_prompt": {
            if (!currentRoomId) return;

            const room = await storage.getRoom(currentRoomId);
            if (!room) return;

            const newTurnIndex = ((room.turnIndex || 0) + 1);
            await storage.updateRoom(currentRoomId, { 
              turnIndex: newTurnIndex,
              heatLevel: Math.min(100, (room.heatLevel || 0) + 5),
            });

            broadcastToRoom(currentRoomId, {
              type: "game_update",
              turnIndex: newTurnIndex,
              heatLevel: Math.min(100, (room.heatLevel || 0) + 5),
            });
            break;
          }

          case "end_game": {
            if (!currentRoomId) return;

            await storage.updateRoom(currentRoomId, { status: "finished" });

            broadcastToRoom(currentRoomId, {
              type: "game_ended",
            });
            break;
          }

          // ===== VELVET LUDO EVENTS =====
          case "ludo_roll_dice": {
            const ludoRoomId = message.roomId || currentRoomId;
            const ludoPlayerId = message.playerId || currentPlayerId;
            if (!ludoRoomId) return;

            const diceValue = Math.floor(Math.random() * 6) + 1;
            const canRollAgain = diceValue === 6;

            log(`Ludo dice rolled: ${diceValue} by player ${ludoPlayerId}`);

            broadcastToRoom(ludoRoomId, {
              type: "ludo_dice_result",
              diceValue,
              playerId: ludoPlayerId,
              canRollAgain,
            });
            break;
          }

          case "ludo_move_piece": {
            const moveRoomId = message.roomId || currentRoomId;
            const { pieceId, currentPosition, diceValue } = message;

            if (!moveRoomId) return;

            // SERVER-SIDE VALIDATION: Calculate valid position
            let newPosition: number;
            if (currentPosition === -1) {
              // Coming out of home - must roll 6
              if (diceValue !== 6) {
                ws.send(JSON.stringify({ type: "error", message: "Must roll 6 to start" }));
                return;
              }
              // Get player's start position based on piece color
              const pieceColor = pieceId.split('-')[0] as LudoColor;
              newPosition = LUDO_START_INDICES[pieceColor];
            } else {
              newPosition = (currentPosition + diceValue) % 52;
            }

            // Check for special tiles
            const VELVET_POSITIONS = [6, 13, 20, 27, 34, 41, 48];
            const velvetSpaceTypes: VelvetSpaceType[] = ["heat", "dare", "truth", "bond", "kiss", "freeze", "wild"];
            const velvetIndex = VELVET_POSITIONS.indexOf(newPosition);
            const isVelvetSpace = velvetIndex !== -1;
            let tileType: VelvetSpaceType | null = null;
            
            if (isVelvetSpace) {
              tileType = velvetSpaceTypes[velvetIndex % velvetSpaceTypes.length];
            }

            log(`Ludo piece ${pieceId} moved from ${currentPosition} to position ${newPosition}, tile: ${tileType || 'normal'}`);

            // Get prompt for special tiles
            let prompt = null;
            if (isVelvetSpace && tileType) {
              const room = await storage.getRoom(moveRoomId);
              if (room) {
                const prompts = await storage.getPromptsByGameId(room.gameId);
                if (prompts.length > 0) {
                  // Filter by tile type if applicable
                  const filtered = prompts.filter(p => {
                    if (tileType === "heat") return p.intensity >= 4;
                    if (tileType === "bond") return p.flags?.isCoupleExclusive;
                    return true;
                  });
                  const pool = filtered.length > 0 ? filtered : prompts;
                  prompt = pool[Math.floor(Math.random() * pool.length)];
                }
              }
            }

            broadcastToRoom(moveRoomId, {
              type: "ludo_piece_moved",
              pieceId,
              newPosition,
              isValidMove: true,
              tileType,
              landedOnVelvet: isVelvetSpace,
              prompt,
            });
            break;
          }

          case "ludo_next_turn": {
            const turnRoomId = message.roomId || currentRoomId;
            const { nextPlayerIndex } = message;

            if (!turnRoomId) return;

            log(`Ludo next turn: player index ${nextPlayerIndex}`);

            broadcastToRoom(turnRoomId, {
              type: "ludo_turn_changed",
              currentTurn: nextPlayerIndex,
            });
            break;
          }

          case "ludo_prompt_complete": {
            const promptRoomId = message.roomId || currentRoomId;
            if (!promptRoomId) return;

            log(`Ludo prompt completed`);

            broadcastToRoom(promptRoomId, {
              type: "ludo_prompt_done",
            });
            break;
          }

          case "ludo_game_over": {
            const overRoomId = message.roomId || currentRoomId;
            const { winnerId, winnerName } = message;

            if (!overRoomId) return;

            log(`Ludo game over - winner: ${winnerName}`);

            await storage.updateRoom(overRoomId, { status: "finished" });

            broadcastToRoom(overRoomId, {
              type: "ludo_winner",
              winnerId,
              winnerName,
            });
            break;
          }
        }
      } catch (error) {
        log(`Error processing message: ${error}`);
        // Send a generic error message to the client
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "error", message: "An unexpected error occurred. Please try again." }));
        }
      }
    });

    ws.on("close", () => {
      log(`WebSocket closed for player ${currentPlayerId} in room ${currentRoomId}`);
      if (currentRoomId) {
        const connections = roomConnections.get(currentRoomId);
        if (connections) {
          // Remove by playerId if available, otherwise remove this ws instance
          if (currentPlayerId) {
            connections.delete(currentPlayerId);
          } else {
            // Fallback: remove by ws reference
            const entries = Array.from(connections.entries());
            for (const [key, value] of entries) {
              if (value === ws) {
                connections.delete(key);
                break;
              }
            }
          }

          if (connections.size === 0) {
            roomConnections.delete(currentRoomId);
            log(`Room ${currentRoomId} has no more connections`);
          }
        }
      }
    });

    ws.on("error", (error) => {
      log(`WebSocket error for player ${currentPlayerId}: ${error.message}`);
    });
  });

  // ===== GAMES API =====

  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:slug", async (req, res) => {
    try {
      const game = await storage.getGameBySlug(req.params.slug);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });

  // ===== PACKS API =====

  app.get("/api/packs", async (req, res) => {
    try {
      const packs = await storage.getPacks();
      res.json(packs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch packs" });
    }
  });

  app.get("/api/packs/:gameId", async (req, res) => {
    try {
      const packs = await storage.getPacksByGameId(req.params.gameId);
      res.json(packs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch packs" });
    }
  });

  // ===== PROMPTS API =====

  app.get("/api/prompts", async (req, res) => {
    try {
      const { gameId, intensity, packId } = req.query;

      if (gameId) {
        const prompts = await storage.getPromptsByGameId(
          gameId as string, 
          { 
            intensity: intensity ? parseInt(intensity as string) : undefined,
            packId: packId as string | undefined,
          }
        );
        return res.json(prompts);
      }

      const prompts = await storage.getPrompts();
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prompts" });
    }
  });

  app.post("/api/prompts", async (req, res) => {
    try {
      const parsed = insertPromptSchema.parse(req.body);
      const prompt = await storage.createPrompt(parsed);
      res.status(201).json(prompt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create prompt" });
    }
  });

  app.patch("/api/prompts/:id", async (req, res) => {
    try {
      const prompt = await storage.updatePrompt(req.params.id, req.body);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.json(prompt);
    } catch (error) {
      res.status(500).json({ error: "Failed to update prompt" });
    }
  });

  app.delete("/api/prompts/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePrompt(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete prompt" });
    }
  });

  // ===== ROOMS API =====

  app.post("/api/rooms", async (req, res) => {
    try {
      const parsed = createRoomSchema.parse(req.body);

      // Create room
      const room = await storage.createRoom({
        gameId: parsed.gameId,
        hostId: "temp-host", // Will be replaced with actual user ID
        status: "waiting",
        settings: parsed.settings,
        currentPromptId: null,
        usedPromptIds: [],
        round: 1,
        turnIndex: 0,
        heatLevel: 0,
      });

      // Add host as player
      const avatarColors = ["#FF008A", "#FF2E6D", "#FF5E33", "#B00F2F", "#7B2CB3", "#E3C089"];
      const player = await storage.addRoomPlayer({
        roomId: room.id,
        odId: null,
        nickname: sanitizeNickname(parsed.nickname),
        isHost: true,
        isReady: true,
        avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      });

      res.status(201).json({ 
        roomId: room.id, 
        joinCode: room.joinCode,
        playerId: player.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  app.post("/api/rooms/join", async (req, res) => {
    try {
      const parsed = joinRoomSchema.parse(req.body);

      const room = await storage.getRoomByJoinCode(parsed.joinCode);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (room.status !== "waiting") {
        return res.status(400).json({ error: "Game already in progress" });
      }

      const players = await storage.getRoomPlayers(room.id);
      if (players.length >= 10) {
        return res.status(400).json({ error: "Room is full" });
      }

      // Check for duplicate nickname
      if (players.some((p) => p.nickname.toLowerCase() === parsed.nickname.toLowerCase())) {
        return res.status(400).json({ error: "Nickname already taken" });
      }

      const avatarColors = ["#FF008A", "#FF2E6D", "#FF5E33", "#B00F2F", "#7B2CB3", "#E3C089"];
      const player = await storage.addRoomPlayer({
        roomId: room.id,
        odId: null,
        nickname: parsed.nickname,
        isHost: false,
        isReady: false,
        avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      });

      res.json({ 
        roomId: room.id,
        playerId: player.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to join room" });
    }
  });

  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const players = await storage.getRoomPlayers(room.id);
      const game = await storage.getGame(room.gameId);

      res.json({
        ...room,
        players,
        game,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room" });
    }
  });

  app.delete("/api/rooms/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRoom(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete room" });
    }
  });

  // ===== LUDO LOCAL GAME API =====

  // In-memory store for local Ludo games
  const localLudoGames = new Map<string, any>();

  app.post("/api/ludo/init-local", async (req, res) => {
    try {
      const { players, gameMode } = req.body;

      if (!players || !Array.isArray(players) || players.length < 2 || players.length > 4) {
        return res.status(400).json({ error: "Must have 2-4 players" });
      }

      const roomId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const PLAYER_COLORS: LudoColor[] = ["red", "blue", "green", "yellow"];

      const ludoPlayers = players.map((p: { nickname: string; avatarColor: string }, idx: number) => {
        const color = PLAYER_COLORS[idx];
        const tokens = Array.from({ length: 4 }, (_, i) => ({
          id: `${color}_token_${i}`,
          playerId: `player_${idx}`,
          color,
          position: "home",
          pathProgress: -1,
        }));

        return {
          id: `player_${idx}`,
          nickname: p.nickname,
          color,
          avatarColor: p.avatarColor,
          tokens,
          finishedTokens: 0,
        };
      });

      const state = {
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
        frozenPlayers: [],
      };

      localLudoGames.set(roomId, state);
      res.json(state);
    } catch (error) {
      console.error("Error initializing local Ludo game:", error);
      res.status(500).json({ error: "Failed to initialize game" });
    }
  });

  app.post("/api/ludo/roll", async (req, res) => {
    try {
      const { roomId } = req.body;
      const state = localLudoGames.get(roomId);

      if (!state) {
        return res.status(404).json({ error: "Game not found" });
      }

      if (!state.canRoll || state.winnerId) {
        return res.status(400).json({ error: "Cannot roll at this time" });
      }

      const currentPlayer = state.players[state.currentPlayerIndex];

      // Check if player is frozen
      if (state.frozenPlayers.includes(currentPlayer.id)) {
        state.frozenPlayers = state.frozenPlayers.filter((id: string) => id !== currentPlayer.id);
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        state.turnNumber++;
        localLudoGames.set(roomId, state);
        return res.json(state);
      }

      const diceValue = Math.floor(Math.random() * 6) + 1;
      const validMoves = calculateLudoValidMoves(state, currentPlayer, diceValue);

      state.diceValue = diceValue;
      state.canRoll = false;
      state.canMove = validMoves.length > 0;
      state.validMoves = validMoves;

      // If no valid moves, advance turn
      if (!state.canMove) {
        if (diceValue !== 6) {
          state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
          state.turnNumber++;
        }
        state.canRoll = true;
        state.diceValue = null;
      }

      localLudoGames.set(roomId, state);
      res.json(state);
    } catch (error) {
      console.error("Error rolling dice:", error);
      res.status(500).json({ error: "Failed to roll dice" });
    }
  });

  app.post("/api/ludo/move", async (req, res) => {
    try {
      const { roomId, tokenId, moveIndex } = req.body;
      const state = localLudoGames.get(roomId);

      if (!state) {
        return res.status(404).json({ error: "Game not found" });
      }

      if (!state.canMove || moveIndex >= state.validMoves.length) {
        return res.status(400).json({ error: "Invalid move" });
      }

      const move = state.validMoves[moveIndex];
      if (move.tokenId !== tokenId) {
        return res.status(400).json({ error: "Token mismatch" });
      }

      const currentPlayer = state.players[state.currentPlayerIndex];

      // Update token position
      for (const player of state.players) {
        if (player.id === currentPlayer.id) {
          for (const token of player.tokens) {
            if (token.id === tokenId) {
              token.position = move.targetTileId;
              token.pathProgress = move.targetProgress;
              if (move.targetTileId === "finished") {
                player.finishedTokens++;
              }
            }
          }
        }

        // Handle capture
        if (move.willCapture && move.capturedTokenId) {
          for (const token of player.tokens) {
            if (token.id === move.capturedTokenId) {
              token.position = "home";
              token.pathProgress = -1;
            }
          }
        }
      }

      // Check for special tile effects
      const specialEffect = checkLudoSpecialEffect(move.targetTileId, currentPlayer.id);
      state.specialEffect = specialEffect;

      // Check win condition
      const winner = state.players.find((p: any) => p.finishedTokens === 4);
      if (winner) {
        state.winnerId = winner.id;
      }

      // Determine next turn
      const rolledSix = state.diceValue === 6;
      const shouldContinue = rolledSix && !winner;

      if (!shouldContinue) {
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        state.turnNumber++;
      }

      state.diceValue = null;
      state.canRoll = !specialEffect;
      state.canMove = false;
      state.validMoves = [];

      localLudoGames.set(roomId, state);
      res.json(state);
    } catch (error) {
      console.error("Error applying move:", error);
      res.status(500).json({ error: "Failed to apply move" });
    }
  });

  app.post("/api/ludo/dismiss-effect", async (req, res) => {
    try {
      const { roomId } = req.body;
      const state = localLudoGames.get(roomId);

      if (!state) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Apply freeze effect if applicable
      if (state.specialEffect?.type === "freeze") {
        state.frozenPlayers.push(state.specialEffect.playerId);
      }

      state.specialEffect = null;
      state.canRoll = true;

      localLudoGames.set(roomId, state);
      res.json(state);
    } catch (error) {
      console.error("Error dismissing effect:", error);
      res.status(500).json({ error: "Failed to dismiss effect" });
    }
  });

  app.post("/api/ludo/rescue", async (req, res) => {
    try {
      const { roomId, rescuedPlayerId } = req.body;
      const state = localLudoGames.get(roomId);

      if (!state) {
        return res.status(404).json({ error: "Game not found" });
      }

      state.frozenPlayers = state.frozenPlayers.filter((id: string) => id !== rescuedPlayerId);

      localLudoGames.set(roomId, state);
      res.json(state);
    } catch (error) {
      console.error("Error rescuing player:", error);
      res.status(500).json({ error: "Failed to rescue player" });
    }
  });

  // Helper functions for Ludo logic
  function calculateLudoValidMoves(state: any, player: any, diceValue: number) {
    const moves: any[] = [];

    for (const token of player.tokens) {
      // Token at home
      if (token.position === "home") {
        if (diceValue === 6) {
          const startIndex = LUDO_START_INDICES[player.color as LudoColor];
          const startTileId = `main_${startIndex}`;
          const captureInfo = checkLudoCapture(state, startTileId, player.id);

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
      const maxProgress = 52 + 5; // Main path + safe zone

      // Can't overshoot finish
      if (newProgress > maxProgress) {
        continue;
      }

      const targetTileId = calculateLudoTargetTile(player.color, token.pathProgress, diceValue);
      const captureInfo = checkLudoCapture(state, targetTileId, player.id);

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

  function calculateLudoTargetTile(playerColor: LudoColor, currentProgress: number, diceValue: number): string {
    const newProgress = currentProgress + diceValue;

    // Still on main path
    if (newProgress < 52) {
      const mainIndex = (LUDO_START_INDICES[playerColor] + newProgress) % 52;
      return `main_${mainIndex}`;
    }

    // Entered safe zone
    if (newProgress < 52 + 5) {
      const safeIndex = newProgress - 52;
      return `safe_${playerColor}_${safeIndex}`;
    }

    // Reached finish
    return "finished";
  }

  function checkLudoCapture(state: any, targetTileId: string, movingPlayerId: string): { willCapture: boolean; capturedTokenId?: string } {
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

  function checkLudoSpecialEffect(tileId: string, playerId: string): any {
    if (!tileId.startsWith("main_")) {
      return null;
    }

    const mainIndex = parseInt(tileId.split("_")[1]);
    const specialTileTypes: Record<number, string> = {
      5: "heat",
      12: "bond",
      18: "freeze",
      25: "heat",
      31: "bond",
      38: "freeze",
      44: "heat",
      51: "bond",
    };

    const effectType = specialTileTypes[mainIndex];
    if (!effectType) {
      return null;
    }

    return {
      type: effectType,
      tileId,
      playerId,
    };
  }

  return httpServer;
}