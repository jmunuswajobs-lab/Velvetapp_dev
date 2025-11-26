import { 
  type User, type InsertUser,
  type Game, type InsertGame,
  type Pack, type InsertPack,
  type Prompt, type InsertPrompt,
  type Room, type InsertRoom,
  type RoomPlayer, type InsertRoomPlayer,
  type RoomSettings, type GameWithPacks,
} from "@shared/schema";
import { randomUUID } from "crypto";

// Generate 6-character join code
function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Games
  getGames(): Promise<Game[]>;
  getGame(id: string): Promise<Game | undefined>;
  getGameBySlug(slug: string): Promise<GameWithPacks | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: string, game: Partial<InsertGame>): Promise<Game | undefined>;
  deleteGame(id: string): Promise<boolean>;
  
  // Packs
  getPacks(): Promise<Pack[]>;
  getPacksByGameId(gameId: string): Promise<Pack[]>;
  getPack(id: string): Promise<Pack | undefined>;
  createPack(pack: InsertPack): Promise<Pack>;
  deletePack(id: string): Promise<boolean>;
  
  // Prompts
  getPrompts(): Promise<Prompt[]>;
  getPromptsByGameId(gameId: string, options?: { intensity?: number; packId?: string }): Promise<Prompt[]>;
  getPrompt(id: string): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: string, prompt: Partial<InsertPrompt>): Promise<Prompt | undefined>;
  deletePrompt(id: string): Promise<boolean>;
  
  // Rooms
  getRooms(): Promise<Room[]>;
  getRoom(id: string): Promise<Room | undefined>;
  getRoomByJoinCode(joinCode: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: string, room: Partial<Room>): Promise<Room | undefined>;
  deleteRoom(id: string): Promise<boolean>;
  
  // Room Players
  getRoomPlayers(roomId: string): Promise<RoomPlayer[]>;
  addRoomPlayer(player: InsertRoomPlayer): Promise<RoomPlayer>;
  updateRoomPlayer(id: string, updates: Partial<RoomPlayer>): Promise<RoomPlayer | undefined>;
  removeRoomPlayer(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private games: Map<string, Game>;
  private packs: Map<string, Pack>;
  private prompts: Map<string, Prompt>;
  private rooms: Map<string, Room>;
  private roomPlayers: Map<string, RoomPlayer>;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.packs = new Map();
    this.prompts = new Map();
    this.rooms = new Map();
    this.roomPlayers = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Seed games
    const games: Game[] = [
      {
        id: randomUUID(),
        slug: "truth-or-dare",
        name: "Truth or Dare",
        description: "The classic party game where players choose between revealing truths or completing daring challenges. Get ready to spill secrets and push boundaries!",
        minPlayers: 2,
        maxPlayers: 10,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["classic", "party", "flirty"],
        isSpicy: true,
        isCoupleFocused: false,
        iconName: "flame",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "never-have-i-ever",
        name: "Never Have I Ever",
        description: "Discover what your friends have (or haven't) done. Make statements and watch who takes a drink!",
        minPlayers: 3,
        maxPlayers: 12,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["drinking", "party", "reveal"],
        isSpicy: true,
        isCoupleFocused: false,
        iconName: "message",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "couples-challenge",
        name: "Couples Challenge",
        description: "Intimate challenges designed for two. Perfect for date nights and deepening your connection.",
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "intimate", "romantic"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "heart",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "hot-seat",
        name: "Hot Seat",
        description: "One player takes the hot seat while others ask probing questions. How much can they handle?",
        minPlayers: 4,
        maxPlayers: 8,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["party", "questions", "revealing"],
        isSpicy: true,
        isCoupleFocused: false,
        iconName: "zap",
        createdAt: new Date(),
      },
    ];

    games.forEach((game) => this.games.set(game.id, game));

    // Seed prompts for Truth or Dare
    const truthOrDareId = games[0].id;
    const samplePrompts: Omit<Prompt, "id" | "createdAt">[] = [
      // Truths - Mild
      { gameId: truthOrDareId, packId: null, text: "What's the most embarrassing song on your playlist?", type: "truth", intensity: 1, flags: {} },
      { gameId: truthOrDareId, packId: null, text: "Have you ever had a crush on a friend's partner?", type: "truth", intensity: 1, flags: { isFlirty: true } },
      { gameId: truthOrDareId, packId: null, text: "What's your guilty pleasure TV show?", type: "truth", intensity: 1, flags: {} },
      { gameId: truthOrDareId, packId: null, text: "When was the last time you told a white lie?", type: "truth", intensity: 1, flags: {} },
      
      // Truths - Medium
      { gameId: truthOrDareId, packId: null, text: "What's your biggest turn-on?", type: "truth", intensity: 3, flags: { isFlirty: true } },
      { gameId: truthOrDareId, packId: null, text: "Have you ever had a dream about someone in this room?", type: "truth", intensity: 3, flags: { isFlirty: true } },
      { gameId: truthOrDareId, packId: null, text: "What's the wildest thing on your bucket list?", type: "truth", intensity: 3, flags: { isBold: true } },
      { gameId: truthOrDareId, packId: null, text: "What's a secret you've never told anyone?", type: "truth", intensity: 3, flags: { isConfession: true } },
      
      // Truths - Spicy
      { gameId: truthOrDareId, packId: null, text: "Describe your most memorable kiss in detail.", type: "truth", intensity: 4, flags: { isFlirty: true } },
      { gameId: truthOrDareId, packId: null, text: "What's your biggest fantasy?", type: "truth", intensity: 5, flags: { isFlirty: true, isBold: true } },
      { gameId: truthOrDareId, packId: null, text: "What's the most daring thing you've done in the bedroom?", type: "truth", intensity: 5, flags: { isFlirty: true, isBold: true } },
      
      // Dares - Mild
      { gameId: truthOrDareId, packId: null, text: "Do your best impression of someone in the room.", type: "dare", intensity: 1, flags: {} },
      { gameId: truthOrDareId, packId: null, text: "Send the last photo in your camera roll to the group chat.", type: "dare", intensity: 1, flags: {} },
      { gameId: truthOrDareId, packId: null, text: "Speak in an accent for the next 3 rounds.", type: "dare", intensity: 1, flags: {} },
      
      // Dares - Medium
      { gameId: truthOrDareId, packId: null, text: "Give someone in the room a shoulder massage for 30 seconds.", type: "dare", intensity: 3, flags: { isFlirty: true, requiresMovement: true } },
      { gameId: truthOrDareId, packId: null, text: "Whisper something seductive in someone's ear.", type: "dare", intensity: 3, flags: { isFlirty: true } },
      { gameId: truthOrDareId, packId: null, text: "Let someone go through your phone for 1 minute.", type: "dare", intensity: 3, flags: { isBold: true } },
      
      // Dares - Spicy
      { gameId: truthOrDareId, packId: null, text: "Give your most convincing lap dance.", type: "dare", intensity: 4, flags: { isFlirty: true, isBold: true, requiresMovement: true } },
      { gameId: truthOrDareId, packId: null, text: "Remove one article of clothing (your choice).", type: "dare", intensity: 5, flags: { isBold: true, isKinkyTease: true } },
      { gameId: truthOrDareId, packId: null, text: "Let someone trace an ice cube anywhere they want on your body.", type: "dare", intensity: 5, flags: { isFlirty: true, isBold: true, isKinkyTease: true } },
      
      // Challenges
      { gameId: truthOrDareId, packId: null, text: "Maintain eye contact with someone for 60 seconds without laughing.", type: "challenge", intensity: 2, flags: {} },
      { gameId: truthOrDareId, packId: null, text: "Make someone blush within 30 seconds.", type: "challenge", intensity: 3, flags: { isFlirty: true } },
      
      // Confessions
      { gameId: truthOrDareId, packId: null, text: "Confess: Who in this room would you most want to be stranded on an island with?", type: "confession", intensity: 2, flags: { isFlirty: true } },
      { gameId: truthOrDareId, packId: null, text: "Confess: What's something you've always wanted to tell someone here but haven't?", type: "confession", intensity: 3, flags: { isConfession: true } },
      
      // Votes
      { gameId: truthOrDareId, packId: null, text: "Vote: Who is the biggest flirt in the room?", type: "vote", intensity: 2, flags: {} },
      { gameId: truthOrDareId, packId: null, text: "Vote: Who has the best lips here?", type: "vote", intensity: 3, flags: { isFlirty: true } },
    ];

    samplePrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // Add Never Have I Ever prompts
    const nhieiId = games[1].id;
    const nhieiPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: nhieiId, packId: null, text: "Never have I ever sent a text to the wrong person.", type: "truth", intensity: 1, flags: {} },
      { gameId: nhieiId, packId: null, text: "Never have I ever kissed someone on the first date.", type: "truth", intensity: 2, flags: { isFlirty: true } },
      { gameId: nhieiId, packId: null, text: "Never have I ever lied about my age.", type: "truth", intensity: 1, flags: {} },
      { gameId: nhieiId, packId: null, text: "Never have I ever had a one-night stand.", type: "truth", intensity: 4, flags: { isBold: true } },
      { gameId: nhieiId, packId: null, text: "Never have I ever stalked an ex on social media.", type: "truth", intensity: 2, flags: {} },
      { gameId: nhieiId, packId: null, text: "Never have I ever ghosted someone.", type: "truth", intensity: 2, flags: {} },
      { gameId: nhieiId, packId: null, text: "Never have I ever faked an orgasm.", type: "truth", intensity: 5, flags: { isBold: true } },
      { gameId: nhieiId, packId: null, text: "Never have I ever been skinny dipping.", type: "truth", intensity: 3, flags: { isBold: true } },
      { gameId: nhieiId, packId: null, text: "Never have I ever had a friends with benefits situation.", type: "truth", intensity: 4, flags: { isBold: true } },
      { gameId: nhieiId, packId: null, text: "Never have I ever had a crush on a coworker.", type: "truth", intensity: 2, flags: { isFlirty: true } },
    ];

    nhieiPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // Add Couples Challenge prompts
    const couplesId = games[2].id;
    const couplesPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: couplesId, packId: null, text: "Share your favorite memory together.", type: "truth", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: couplesId, packId: null, text: "What first attracted you to your partner?", type: "truth", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: couplesId, packId: null, text: "Give your partner a passionate kiss for 30 seconds.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: couplesId, packId: null, text: "Describe what you love most about your partner's body.", type: "truth", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true, safeForRemote: true } },
      { gameId: couplesId, packId: null, text: "Give your partner a sensual massage for 2 minutes.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: couplesId, packId: null, text: "What's one thing you wish you did more often together?", type: "truth", intensity: 2, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: couplesId, packId: null, text: "Blindfold your partner and kiss them somewhere unexpected.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: couplesId, packId: null, text: "What's your biggest fantasy involving your partner?", type: "truth", intensity: 5, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true, safeForRemote: true } },
    ];

    couplesPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: false, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Game methods
  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGameBySlug(slug: string): Promise<GameWithPacks | undefined> {
    const game = Array.from(this.games.values()).find((g) => g.slug === slug);
    if (!game) return undefined;

    const packs = await this.getPacksByGameId(game.id);
    const prompts = await this.getPromptsByGameId(game.id);
    
    return {
      ...game,
      packs,
      promptCount: prompts.length,
    };
  }

  async createGame(game: InsertGame): Promise<Game> {
    const id = randomUUID();
    const newGame: Game = { ...game, id, createdAt: new Date() };
    this.games.set(id, newGame);
    return newGame;
  }

  async updateGame(id: string, updates: Partial<InsertGame>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;

    const updatedGame = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async deleteGame(id: string): Promise<boolean> {
    return this.games.delete(id);
  }

  // Pack methods
  async getPacks(): Promise<Pack[]> {
    return Array.from(this.packs.values());
  }

  async getPacksByGameId(gameId: string): Promise<Pack[]> {
    return Array.from(this.packs.values()).filter((p) => p.gameId === gameId);
  }

  async getPack(id: string): Promise<Pack | undefined> {
    return this.packs.get(id);
  }

  async createPack(pack: InsertPack): Promise<Pack> {
    const id = randomUUID();
    const newPack: Pack = { ...pack, id, createdAt: new Date() };
    this.packs.set(id, newPack);
    return newPack;
  }

  async deletePack(id: string): Promise<boolean> {
    return this.packs.delete(id);
  }

  // Prompt methods
  async getPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values());
  }

  async getPromptsByGameId(gameId: string, options?: { intensity?: number; packId?: string }): Promise<Prompt[]> {
    let prompts = Array.from(this.prompts.values()).filter((p) => p.gameId === gameId);
    
    if (options?.intensity) {
      prompts = prompts.filter((p) => p.intensity <= options.intensity!);
    }
    
    if (options?.packId) {
      prompts = prompts.filter((p) => p.packId === options.packId);
    }
    
    return prompts;
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const id = randomUUID();
    const newPrompt: Prompt = { ...prompt, id, createdAt: new Date() };
    this.prompts.set(id, newPrompt);
    return newPrompt;
  }

  async updatePrompt(id: string, updates: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const prompt = this.prompts.get(id);
    if (!prompt) return undefined;

    const updatedPrompt = { ...prompt, ...updates };
    this.prompts.set(id, updatedPrompt);
    return updatedPrompt;
  }

  async deletePrompt(id: string): Promise<boolean> {
    return this.prompts.delete(id);
  }

  // Room methods
  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomByJoinCode(joinCode: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find((r) => r.joinCode === joinCode);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const id = randomUUID();
    let joinCode = generateJoinCode();
    
    // Ensure unique join code
    while (await this.getRoomByJoinCode(joinCode)) {
      joinCode = generateJoinCode();
    }

    const newRoom: Room = { 
      ...room, 
      id, 
      joinCode,
      createdAt: new Date() 
    };
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;

    const updatedRoom = { ...room, ...updates };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async deleteRoom(id: string): Promise<boolean> {
    // Also remove all players
    const players = await this.getRoomPlayers(id);
    players.forEach((p) => this.roomPlayers.delete(p.id));
    return this.rooms.delete(id);
  }

  // Room Player methods
  async getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
    return Array.from(this.roomPlayers.values()).filter((p) => p.roomId === roomId);
  }

  async addRoomPlayer(player: InsertRoomPlayer): Promise<RoomPlayer> {
    const id = randomUUID();
    const newPlayer: RoomPlayer = { ...player, id, joinedAt: new Date() };
    this.roomPlayers.set(id, newPlayer);
    return newPlayer;
  }

  async updateRoomPlayer(id: string, updates: Partial<RoomPlayer>): Promise<RoomPlayer | undefined> {
    const player = this.roomPlayers.get(id);
    if (!player) return undefined;

    const updatedPlayer = { ...player, ...updates };
    this.roomPlayers.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async removeRoomPlayer(id: string): Promise<boolean> {
    return this.roomPlayers.delete(id);
  }
}

export const storage = new MemStorage();
