import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== PROMPT TYPES & FLAGS =====
export const promptTypes = ["truth", "dare", "challenge", "confession", "vote", "rule"] as const;
export type PromptType = typeof promptTypes[number];

export const promptFlagsSchema = z.object({
  isFlirty: z.boolean().optional(),
  isBold: z.boolean().optional(),
  isKinkyTease: z.boolean().optional(),
  isCoupleExclusive: z.boolean().optional(),
  isConfession: z.boolean().optional(),
  isNSFW: z.boolean().optional(),
  requiresMovement: z.boolean().optional(),
  safeForRemote: z.boolean().optional(),
});

export type PromptFlags = z.infer<typeof promptFlagsSchema>;

// ===== ROOM STATUS =====
export const roomStatuses = ["waiting", "in-progress", "finished"] as const;
export type RoomStatus = typeof roomStatuses[number];

// ===== DATABASE TABLES =====

// Users table
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Games table
export const games = pgTable("games", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  minPlayers: integer("min_players").notNull().default(2),
  maxPlayers: integer("max_players").notNull().default(10),
  supportsOnline: boolean("supports_online").default(true),
  supportsLocal: boolean("supports_local").default(true),
  tags: text("tags").array().default([]),
  isSpicy: boolean("is_spicy").default(true),
  isCoupleFocused: boolean("is_couple_focused").default(false),
  iconName: text("icon_name").default("flame"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Packs table
export const packs = pgTable("packs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id", { length: 36 }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  intensity: integer("intensity").notNull().default(3),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prompts table
export const prompts = pgTable("prompts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id", { length: 36 }).notNull(),
  packId: varchar("pack_id", { length: 36 }),
  text: text("text").notNull(),
  type: text("type").notNull().$type<PromptType>(),
  intensity: integer("intensity").notNull().default(3),
  flags: jsonb("flags").$type<PromptFlags>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rooms table
export const rooms = pgTable("rooms", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id", { length: 36 }).notNull(),
  hostId: varchar("host_id", { length: 36 }).notNull(),
  joinCode: varchar("join_code", { length: 8 }).notNull().unique(),
  status: text("status").notNull().$type<RoomStatus>().default("waiting"),
  settings: jsonb("settings").$type<RoomSettings>().default({
    intensity: 3,
    allowNSFW: false,
    allowMovement: true,
    coupleMode: false,
    packs: [],
  }),
  currentPromptId: varchar("current_prompt_id", { length: 36 }),
  usedPromptIds: text("used_prompt_ids").array().default([]),
  round: integer("round").default(1),
  turnIndex: integer("turn_index").default(0),
  heatLevel: integer("heat_level").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Room Players table
export const roomPlayers = pgTable("room_players", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id", { length: 36 }).notNull(),
  odId: varchar("user_id", { length: 36 }),
  nickname: text("nickname").notNull(),
  isHost: boolean("is_host").default(false),
  isReady: boolean("is_ready").default(false),
  avatarColor: text("avatar_color").default("#FF008A"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// ===== TYPESCRIPT TYPES =====

export interface RoomSettings {
  intensity: number;
  allowNSFW: boolean;
  allowMovement: boolean;
  coupleMode: boolean;
  packs: string[];
}

export interface Player {
  id: string;
  odId: string | null;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  avatarColor: string;
  joinedAt: Date;
}

// ===== INSERT SCHEMAS =====

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertPackSchema = createInsertSchema(packs).omit({
  id: true,
  createdAt: true,
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  joinCode: true,
});

export const insertRoomPlayerSchema = createInsertSchema(roomPlayers).omit({
  id: true,
  joinedAt: true,
});

// ===== INSERT TYPES =====

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type InsertPack = z.infer<typeof insertPackSchema>;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertRoomPlayer = z.infer<typeof insertRoomPlayerSchema>;

// ===== SELECT TYPES =====

export type User = typeof users.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Pack = typeof packs.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type RoomPlayer = typeof roomPlayers.$inferSelect;

// ===== API TYPES =====

export interface GameWithPacks extends Game {
  packs: Pack[];
  promptCount: number;
}

export interface RoomWithPlayers extends Room {
  players: RoomPlayer[];
  game: Game;
}

// ===== LOCAL GAME STATE =====

export interface LocalGameState {
  gameId: string;
  players: { nickname: string; avatarColor: string }[];
  settings: RoomSettings;
  currentPromptIndex: number;
  prompts: Prompt[];
  usedPromptIds: string[];
  round: number;
  turnIndex: number;
  heatLevel: number;
  stats: GameStats;
}

export interface GameStats {
  roundsPlayed: number;
  promptsByType: Record<PromptType, number>;
  playerPicks: Record<string, number>;
  skippedCount: number;
}

// ===== VALIDATION SCHEMAS =====

export const joinRoomSchema = z.object({
  joinCode: z.string().length(6),
  nickname: z.string().min(1).max(20),
});

export const createRoomSchema = z.object({
  gameId: z.string(),
  nickname: z.string().min(1).max(20),
  settings: z.object({
    intensity: z.number().min(1).max(5),
    allowNSFW: z.boolean(),
    allowMovement: z.boolean(),
    coupleMode: z.boolean(),
    packs: z.array(z.string()),
  }),
});

export const guestAuthSchema = z.object({
  nickname: z.string().min(1).max(20),
});

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// ===== VELVET LUDO TYPES =====

export type LudoColor = "red" | "blue" | "green" | "yellow";

export interface LudoPiece {
  id: string;
  color: LudoColor;
  position: number; // -1 = home base, 0-51 = board, 52-57 = home stretch
  player: string;
  isHome: boolean;
}

export interface LudoPlayer {
  id: string;
  nickname: string;
  avatarColor: string;
  color: LudoColor;
  pieces: LudoPiece[];
  hasFinished: boolean;
}

export type VelvetSpaceType = "dare" | "truth" | "kiss" | "massage" | "compliment" | "heat" | "bond" | "freeze" | "wild";

export interface VelvetSpace {
  position: number;
  type: VelvetSpaceType;
  description: string;
}

export interface LudoGameState {
  boardSize: number;
  players: LudoPlayer[];
  currentTurn: number;
  diceValue: number | null;
  canRollAgain: boolean;
  velvetSpaces: VelvetSpace[];
  currentPrompt: Prompt | null;
  winner: string | null;
  gamePhase: "rolling" | "moving" | "prompt" | "finished";
  turnCount: number;
}

export const LUDO_BOARD_SIZE = 52;
export const LUDO_HOME_STRETCH_SIZE = 6;

export const VELVET_SPACE_POSITIONS = [6, 13, 20, 27, 34, 41, 48]; // Every 7th space

export const LUDO_START_POSITIONS: Record<LudoColor, number> = {
  red: 0,
  blue: 13,
  green: 26,
  yellow: 39,
};

export const LUDO_HOME_ENTRY: Record<LudoColor, number> = {
  red: 51,
  blue: 12,
  green: 25,
  yellow: 38,
};
