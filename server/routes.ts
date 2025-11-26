import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertPromptSchema, 
  createRoomSchema, 
  joinRoomSchema,
} from "@shared/schema";
import { z } from "zod";

// Room WebSocket connections
const roomConnections = new Map<string, Map<string, WebSocket>>();

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
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // WebSocket server for real-time room sync
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    let currentRoomId: string | null = null;
    let currentPlayerId: string | null = null;

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "join_room": {
            const { roomId, playerId } = message;
            currentRoomId = roomId;
            currentPlayerId = playerId || `guest-${Date.now()}`;

            if (!roomConnections.has(roomId)) {
              roomConnections.set(roomId, new Map());
            }
            roomConnections.get(roomId)!.set(currentPlayerId, ws);

            // Send current room state
            const room = await storage.getRoom(roomId);
            const players = await storage.getRoomPlayers(roomId);
            
            ws.send(JSON.stringify({
              type: "room_update",
              room,
              players: players.map((p) => ({
                id: p.id,
                nickname: p.nickname,
                avatarColor: p.avatarColor,
                isHost: p.isHost,
                isReady: p.isReady,
              })),
            }));

            // Notify others
            broadcastToRoom(roomId, {
              type: "player_joined",
              playerId: currentPlayerId,
            }, currentPlayerId);
            break;
          }

          case "toggle_ready": {
            if (!currentRoomId || !currentPlayerId) return;
            
            const players = await storage.getRoomPlayers(currentRoomId);
            const player = players.find((p) => p.id === currentPlayerId);
            
            if (player) {
              await storage.updateRoomPlayer(player.id, { isReady: !player.isReady });
              
              const updatedPlayers = await storage.getRoomPlayers(currentRoomId);
              broadcastToRoom(currentRoomId, {
                type: "room_update",
                players: updatedPlayers.map((p) => ({
                  id: p.id,
                  nickname: p.nickname,
                  avatarColor: p.avatarColor,
                  isHost: p.isHost,
                  isReady: p.isReady,
                })),
              });
            }
            break;
          }

          case "start_game": {
            if (!currentRoomId) return;
            
            const room = await storage.getRoom(currentRoomId);
            if (!room) return;

            await storage.updateRoom(currentRoomId, { status: "in-progress" });
            
            // Get prompts for the game
            const prompts = await storage.getPromptsByGameId(room.gameId, {
              intensity: (room.settings as any)?.intensity || 3,
            });

            // Shuffle prompts
            const shuffledPrompts = [...prompts].sort(() => Math.random() - 0.5);

            broadcastToRoom(currentRoomId, {
              type: "game_started",
              prompts: shuffledPrompts,
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
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message" }));
      }
    });

    ws.on("close", async () => {
      if (currentRoomId && currentPlayerId) {
        const connections = roomConnections.get(currentRoomId);
        if (connections) {
          connections.delete(currentPlayerId);
          if (connections.size === 0) {
            roomConnections.delete(currentRoomId);
          }
        }

        // Notify others
        broadcastToRoom(currentRoomId, {
          type: "player_left",
          playerId: currentPlayerId,
        });
      }
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
        nickname: parsed.nickname,
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

  return httpServer;
}
