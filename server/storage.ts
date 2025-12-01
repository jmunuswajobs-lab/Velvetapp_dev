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
    // Seed games - PRUNED TO REAL MINIGAMES + CORE PROMPTS
    const games: Game[] = [
      // ===== PROMPT PARTY GAMES (4) =====
      {
        id: randomUUID(),
        slug: "truth-or-dare",
        name: "Truth or Dare",
        description: "The classic party game where players choose between revealing truths or completing daring challenges. Get ready to spill secrets and push boundaries!",
        engineType: "prompt-party" as any,
        audience: "both" as any,
        vibe: "party" as any,
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
        engineType: "prompt-party" as any,
        audience: "both" as any,
        vibe: "party" as any,
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
        slug: "would-you-rather",
        name: "Would You Rather",
        description: "Impossible choices and hilarious dilemmas. Discover what others would choose!",
        engineType: "prompt-party" as any,
        audience: "both" as any,
        vibe: "party" as any,
        minPlayers: 2,
        maxPlayers: 12,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["party", "questions", "choices"],
        isSpicy: false,
        isCoupleFocused: false,
        iconName: "scale",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "hot-seat",
        name: "Hot Seat",
        description: "One player takes the hot seat while others ask probing questions. How much can they handle?",
        engineType: "prompt-party" as any,
        audience: "both" as any,
        vibe: "party" as any,
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

      // ===== PROMPT COUPLE GAME (1) =====
      {
        id: randomUUID(),
        slug: "couples-challenge",
        name: "Couples Challenge",
        description: "Intimate challenges designed for two. Perfect for date nights and deepening your connection.",
        engineType: "prompt-couple" as any,
        audience: "couple" as any,
        vibe: "romantic" as any,
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

      // ===== ARCADE/BOARD GAMES (7) =====
      {
        id: randomUUID(),
        slug: "velvet-ludo",
        name: "Velvet Ludo",
        description: "A romantic twist on the classic board game. Race your pieces home while landing on special velvet spaces for intimate challenges.",
        engineType: "board-ludo" as any,
        audience: "couple" as any,
        vibe: "romantic" as any,
        minPlayers: 2,
        maxPlayers: 4,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "board-game", "strategy", "romantic"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "dice-5",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "velvet-memory-flip",
        name: "Velvet Memory Flip",
        description: "Couple-themed memory match. Matching pairs unlock sweet or spicy choices with velvet textures.",
        engineType: "memory-match" as any,
        audience: "couple" as any,
        vibe: "romantic" as any,
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "memory", "puzzle", "romantic"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "brain",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "emotion-ping-pong",
        name: "Emotion Ping-Pong",
        description: "Neon pong arcade game. Hit the ball back and forth - winning rallies trigger spicy consequences!",
        engineType: "pong" as any,
        audience: "couple" as any,
        vibe: "wild" as any,
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "arcade", "competitive", "flirty"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "gamepad",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "neon-drift-couple",
        name: "Neon Drift—Couple Mode",
        description: "1v1 cooperative drift racing on neon arena. Avoid obstacles and reach the finish line together!",
        engineType: "racer" as any,
        audience: "couple" as any,
        vibe: "wild" as any,
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "racing", "cooperative", "arcade"],
        isSpicy: false,
        isCoupleFocused: true,
        iconName: "car",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "couples-duel-arena",
        name: "Couples Duel Arena",
        description: "Quick tap-based combat duels. Attack, defend, charge - fastest fingers wins!",
        engineType: "tap-duel" as any,
        audience: "couple" as any,
        vibe: "wild" as any,
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "action", "competitive", "quick"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "swords",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "neon-guessing-game",
        name: "Neon Guessing Game",
        description: "Guess your partner's feelings and preferences. Heat meter climbs for accurate guesses!",
        engineType: "guessing" as any,
        audience: "couple" as any,
        vibe: "romantic" as any,
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "trivia", "connection", "remote-safe"],
        isSpicy: false,
        isCoupleFocused: true,
        iconName: "lightbulb",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "duo-rhythm-sync",
        name: "Duo Rhythm Sync",
        description: "Tap in time with the beat. Higher streaks = higher heat!",
        engineType: "rhythm" as any,
        audience: "couple" as any,
        vibe: "romantic" as any,
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "rhythm", "music", "cooperative"],
        isSpicy: false,
        isCoupleFocused: true,
        iconName: "music",
        createdAt: new Date(),
      },

      // ===== ROULETTE/RANDOMIZER TOOLS (2) =====
      {
        id: randomUUID(),
        slug: "shot-roulette",
        name: "Shot Roulette",
        description: "Spin the wheel for silly party tasks and drink assignments. Wild party fun!",
        engineType: "roulette" as any,
        audience: "both" as any,
        vibe: "wild" as any,
        minPlayers: 2,
        maxPlayers: 10,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["party", "drinking", "wild", "fun"],
        isSpicy: true,
        isCoupleFocused: false,
        iconName: "circle-dot",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "flip-clash",
        name: "Flip Clash",
        description: "Coin flip predictions - winner assigns a fun party task to the loser!",
        engineType: "tool-randomizer" as any,
        audience: "both" as any,
        vibe: "party" as any,
        minPlayers: 2,
        maxPlayers: 4,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["party", "luck", "fun", "competitive"],
        isSpicy: false,
        isCoupleFocused: false,
        iconName: "coins",
        createdAt: new Date(),
      },

      // ===== NEW PARTY MINIGAMES (2) =====
      {
        id: randomUUID(),
        slug: "button-mash-brawl",
        name: "Button Mash Brawl",
        description: "Tap-mashing race - fill your bar first to win and assign consequences!",
        engineType: "tap-duel" as any,
        audience: "both" as any,
        vibe: "wild" as any,
        minPlayers: 2,
        maxPlayers: 4,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["party", "action", "arcade", "wild"],
        isSpicy: true,
        isCoupleFocused: false,
        iconName: "zap",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "stacked-reactions",
        name: "Stacked Reactions",
        description: "Everyone secretly picks an emoji reaction to a prompt - reveal and laugh at the chaos!",
        engineType: "guessing" as any,
        audience: "both" as any,
        vibe: "party" as any,
        minPlayers: 3,
        maxPlayers: 8,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["party", "fun", "social", "reactions"],
        isSpicy: false,
        isCoupleFocused: false,
        iconName: "smile",
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

    // Add Would You Rather prompts
    const wyriId = games[2].id;
    const wyrPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: wyriId, packId: null, text: "Would you rather always know what people really think of you or never know?", type: "truth", intensity: 2, flags: {} },
      { gameId: wyriId, packId: null, text: "Would you rather give up texting or social media for a year?", type: "truth", intensity: 1, flags: {} },
      { gameId: wyriId, packId: null, text: "Would you rather have the ability to fly or be invisible?", type: "truth", intensity: 1, flags: {} },
      { gameId: wyriId, packId: null, text: "Would you rather always say what you think or never speak again?", type: "truth", intensity: 3, flags: {} },
      { gameId: wyriId, packId: null, text: "Would you rather be stuck in an elevator with your crush or your worst enemy?", type: "truth", intensity: 2, flags: { isFlirty: true } },
    ];

    wyrPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // Add Hot Seat prompts
    const hotSeatId = games[3].id;
    const hotSeatPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: hotSeatId, packId: null, text: "What do you think is my biggest flaw?", type: "truth", intensity: 2, flags: {} },
      { gameId: hotSeatId, packId: null, text: "If you had to set me up on a date, who would it be and why?", type: "truth", intensity: 3, flags: { isFlirty: true } },
      { gameId: hotSeatId, packId: null, text: "What's something I do that annoys you?", type: "truth", intensity: 2, flags: {} },
      { gameId: hotSeatId, packId: null, text: "If you could describe me in one word, what would it be?", type: "truth", intensity: 1, flags: {} },
      { gameId: hotSeatId, packId: null, text: "What's your honest first impression of me when we met?", type: "truth", intensity: 2, flags: {} },
    ];

    hotSeatPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // Add Couples Challenge prompts
    const couplesId = games[4].id;
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

  // ===== User Methods =====
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  // ===== Game Methods =====
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
    return { ...game, packs };
  }

  async createGame(game: InsertGame): Promise<Game> {
    const id = randomUUID();
    const newGame: Game = { ...game, id: id as any, createdAt: new Date() };
    this.games.set(id, newGame);
    return newGame;
  }

  async updateGame(id: string, updates: Partial<InsertGame>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    const updated = { ...game, ...updates };
    this.games.set(id, updated);
    return updated;
  }

  async deleteGame(id: string): Promise<boolean> {
    return this.games.delete(id);
  }

  // ===== Pack Methods =====
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
    const newPack: Pack = { ...pack, id: id as any, createdAt: new Date() };
    this.packs.set(id, newPack);
    return newPack;
  }

  async deletePack(id: string): Promise<boolean> {
    return this.packs.delete(id);
  }

  // ===== Prompt Methods =====
  async getPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values());
  }

  async getPromptsByGameId(
    gameId: string,
    options?: { intensity?: number; packId?: string }
  ): Promise<Prompt[]> {
    let filtered = Array.from(this.prompts.values()).filter((p) => p.gameId === gameId);

    if (options?.intensity) {
      filtered = filtered.filter(
        (p) => Math.abs(p.intensity - options.intensity!) <= 1
      );
    }

    if (options?.packId) {
      filtered = filtered.filter((p) => p.packId === options.packId);
    }

    return filtered;
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const id = randomUUID();
    const newPrompt: Prompt = { ...prompt, id: id as any, createdAt: new Date() };
    this.prompts.set(id, newPrompt);
    return newPrompt;
  }

  async updatePrompt(id: string, updates: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const prompt = this.prompts.get(id);
    if (!prompt) return undefined;
    const updated = { ...prompt, ...updates };
    this.prompts.set(id, updated);
    return updated;
  }

  async deletePrompt(id: string): Promise<boolean> {
    return this.prompts.delete(id);
  }

  // ===== Room Methods =====
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
    const newRoom: Room = {
      ...room,
      id: id as any,
      joinCode: room.joinCode || generateJoinCode(),
      createdAt: new Date(),
    };
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    const updated = { ...room, ...updates };
    this.rooms.set(id, updated);
    return updated;
  }

  async deleteRoom(id: string): Promise<boolean> {
    return this.rooms.delete(id);
  }

  // ===== Room Player Methods =====
  async getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
    return Array.from(this.roomPlayers.values()).filter((p) => p.roomId === roomId);
  }

  async addRoomPlayer(player: InsertRoomPlayer): Promise<RoomPlayer> {
    const id = randomUUID();
    const newPlayer: RoomPlayer = { ...player, id: id as any, createdAt: new Date() };
    this.roomPlayers.set(id, newPlayer);
    return newPlayer;
  }

  async updateRoomPlayer(id: string, updates: Partial<RoomPlayer>): Promise<RoomPlayer | undefined> {
    const player = this.roomPlayers.get(id);
    if (!player) return undefined;
    const updated = { ...player, ...updates };
    this.roomPlayers.set(id, updated);
    return updated;
  }

  async removeRoomPlayer(id: string): Promise<boolean> {
    return this.roomPlayers.delete(id);
  }
}

export const storage = new MemStorage();
