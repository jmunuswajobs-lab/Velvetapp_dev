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
      {
        id: randomUUID(),
        slug: "spin-the-bottle",
        name: "Spin the Bottle",
        description: "The timeless classic with a modern twist. Spin and let fate decide your next move!",
        minPlayers: 4,
        maxPlayers: 10,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["classic", "party", "flirty", "luck"],
        isSpicy: true,
        isCoupleFocused: false,
        iconName: "globe",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "would-you-rather",
        name: "Would You Rather",
        description: "Impossible choices and hilarious dilemmas. Discover what others would choose!",
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
      // NEW COUPLES GAMES
      {
        id: randomUUID(),
        slug: "deep-sync",
        name: "Deep Sync",
        description: "Build emotional intimacy through meaningful questions and heartfelt confessions. Perfect for couples who want to connect on a deeper level.",
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "emotional", "connection", "intimate"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "sparkles",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "temptation-trails",
        name: "Temptation Trails",
        description: "A progressive journey of escalating dares and sensual challenges. Each round brings you closer together.",
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "dares", "progressive", "sensual"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "route",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "fantasy-signals",
        name: "Fantasy Signals",
        description: "Communicate desires without words. Use gestures, looks, and touches to express your deepest fantasies.",
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: false,
        supportsLocal: true,
        tags: ["couples", "nonverbal", "sensual", "intimate"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "eye",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "dare-or-devotion",
        name: "Dare or Devotion",
        description: "Choose between bold dares or sweet acts of devotion. Balance playfulness with romance.",
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "choice", "romantic", "dares"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "heart-handshake",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "heat-check",
        name: "Heat Check",
        description: "Watch the temperature rise as you complete increasingly heated challenges. How hot can you handle?",
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "intensity", "progressive", "spicy"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "thermometer",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "velvet-roulette",
        name: "Velvet Roulette",
        description: "Spin the wheel of desire! Random romantic activities await. From sweet gestures to daring moments.",
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: false,
        supportsLocal: true,
        tags: ["couples", "random", "romantic", "exciting"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "circle-dot",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "neon-conspiracy",
        name: "Neon Conspiracy",
        description: "Work together on secret missions of love. Complete romantic objectives as a team.",
        minPlayers: 2,
        maxPlayers: 2,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["couples", "cooperative", "missions", "team"],
        isSpicy: true,
        isCoupleFocused: true,
        iconName: "target",
        createdAt: new Date(),
      },
      // VELVET LUDO
      {
        id: randomUUID(),
        slug: "velvet-ludo",
        name: "Velvet Ludo",
        description: "A romantic twist on the classic board game. Race your pieces home while landing on special velvet spaces for intimate challenges.",
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
      // CRAZYGAMES-INSPIRED REMIXES
      {
        id: randomUUID(),
        slug: "couples-duel-arena",
        name: "Couples Duel Arena",
        description: "Quick minigame battles with flirty consequences. Tap-based combat with charge and defend mechanics.",
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
        slug: "neon-drift-couple",
        name: "Neon Drift—Couple Mode",
        description: "1v1 or cooperative drift racing on neon arena. Share control and navigate conflicts together!",
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
        slug: "truth-bomb-run",
        name: "Truth Bomb Run",
        description: "Obstacle runner where reaching gates reveals spicy truths. Fail an obstacle, get a spice penalty!",
        minPlayers: 2,
        maxPlayers: 4,
        supportsOnline: true,
        supportsLocal: true,
        tags: ["party", "action", "truth", "arcade"],
        isSpicy: true,
        isCoupleFocused: false,
        iconName: "run",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        slug: "emotion-ping-pong",
        name: "Emotion Ping-Pong",
        description: "Neon pong where paddle hits trigger prompt categories. Winner chooses the spicy card!",
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
        slug: "velvet-memory-flip",
        name: "Velvet Memory Flip",
        description: "Couple-themed memory match. Matching pairs unlock sweet or spicy choices with velvet textures.",
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
        slug: "neon-guessing-game",
        name: "Neon Guessing Game",
        description: "Guess your partner's feelings and preferences. Heat meter climbs for accurate guesses!",
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
        description: "Couple rhythm-tap game with shared score. Heat sparks on perfect streaks!",
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

    // Add Deep Sync prompts (games[6])
    const deepSyncId = games[6].id;
    const deepSyncPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: deepSyncId, packId: null, text: "Share a moment when you felt most connected to your partner.", type: "truth", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: deepSyncId, packId: null, text: "What's something your partner does that makes you feel truly loved?", type: "truth", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: deepSyncId, packId: null, text: "Describe your partner using only positive adjectives for 30 seconds.", type: "challenge", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: deepSyncId, packId: null, text: "What's a fear you haven't shared with your partner yet?", type: "confession", intensity: 3, flags: { isCoupleExclusive: true, safeForRemote: true, isConfession: true } },
      { gameId: deepSyncId, packId: null, text: "Share a childhood memory that shaped who you are today.", type: "truth", intensity: 2, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: deepSyncId, packId: null, text: "What's the most romantic thing your partner has ever done for you?", type: "truth", intensity: 2, flags: { isCoupleExclusive: true, safeForRemote: true, isFlirty: true } },
      { gameId: deepSyncId, packId: null, text: "Look into your partner's eyes and tell them three things you've never said before.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isConfession: true } },
      { gameId: deepSyncId, packId: null, text: "What's a dream you want to achieve together?", type: "truth", intensity: 2, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: deepSyncId, packId: null, text: "Describe the moment you knew you were falling in love.", type: "confession", intensity: 2, flags: { isCoupleExclusive: true, safeForRemote: true, isConfession: true } },
      { gameId: deepSyncId, packId: null, text: "What's something you admire about your partner that you've never told them?", type: "confession", intensity: 3, flags: { isCoupleExclusive: true, safeForRemote: true, isConfession: true } },
      { gameId: deepSyncId, packId: null, text: "Share your deepest desire for your relationship's future.", type: "truth", intensity: 4, flags: { isCoupleExclusive: true, safeForRemote: true, isBold: true } },
      { gameId: deepSyncId, packId: null, text: "What's a vulnerability you're still working on sharing?", type: "confession", intensity: 5, flags: { isCoupleExclusive: true, safeForRemote: true, isConfession: true, isBold: true } },
    ];
    deepSyncPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // Add Temptation Trails prompts (games[7])
    const temptationId = games[7].id;
    const temptationPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: temptationId, packId: null, text: "Hold your partner's hand and trace slow circles on their palm for 30 seconds.", type: "dare", intensity: 1, flags: { isCoupleExclusive: true } },
      { gameId: temptationId, packId: null, text: "Whisper something sweet in your partner's ear.", type: "dare", intensity: 1, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: temptationId, packId: null, text: "Give your partner a gentle neck massage.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: temptationId, packId: null, text: "Kiss your partner's neck softly three times.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: temptationId, packId: null, text: "Slowly run your fingers through your partner's hair.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: temptationId, packId: null, text: "Give your partner a slow, lingering kiss.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: temptationId, packId: null, text: "Trace your finger slowly down your partner's arm.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: temptationId, packId: null, text: "Give your partner butterfly kisses on their face.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: temptationId, packId: null, text: "Whisper your favorite thing about your partner's body in their ear.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: temptationId, packId: null, text: "Give your partner a back massage for 2 minutes.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true, requiresMovement: true } },
      { gameId: temptationId, packId: null, text: "Kiss your partner's shoulder and collarbone area.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: temptationId, packId: null, text: "Let your partner blindfold you and guide your hands where they want.", type: "dare", intensity: 5, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true, isKinkyTease: true } },
    ];
    temptationPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // Add Fantasy Signals prompts (games[8])
    const fantasySignalsId = games[8].id;
    const fantasyPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: fantasySignalsId, packId: null, text: "Without speaking, show your partner how you like to be kissed.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: fantasySignalsId, packId: null, text: "Use only your eyes to communicate 'I want you'.", type: "challenge", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: fantasySignalsId, packId: null, text: "Guide your partner's hand to where you want to be touched (over clothes).", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: fantasySignalsId, packId: null, text: "Communicate a fantasy using only gestures. Partner guesses.", type: "challenge", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: fantasySignalsId, packId: null, text: "Show your partner your favorite way to be held.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true } },
      { gameId: fantasySignalsId, packId: null, text: "Use body language to express how you felt on your first date.", type: "challenge", intensity: 2, flags: { isCoupleExclusive: true } },
      { gameId: fantasySignalsId, packId: null, text: "Give your partner a look that says 'I love you' without speaking.", type: "challenge", intensity: 1, flags: { isCoupleExclusive: true } },
      { gameId: fantasySignalsId, packId: null, text: "Demonstrate your favorite type of embrace.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true } },
      { gameId: fantasySignalsId, packId: null, text: "Use only touches to tell your partner they're beautiful/handsome.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: fantasySignalsId, packId: null, text: "Silently show your partner the pace you enjoy.", type: "dare", intensity: 5, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
    ];
    fantasyPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // Add Dare or Devotion prompts (games[9])
    const dareDevotionId = games[9].id;
    const dareDevotionPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: dareDevotionId, packId: null, text: "DARE: Kiss your partner in a spot you've never kissed before. DEVOTION: Write a love note to your partner.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: dareDevotionId, packId: null, text: "DARE: Give your partner a 30-second lap dance. DEVOTION: Slow dance together to your song.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true, requiresMovement: true } },
      { gameId: dareDevotionId, packId: null, text: "DARE: Feed your partner something sensually. DEVOTION: Cook something special together.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true } },
      { gameId: dareDevotionId, packId: null, text: "DARE: Whisper something naughty. DEVOTION: Whisper your wedding vows (or make them up).", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: dareDevotionId, packId: null, text: "DARE: Remove one piece of your partner's clothing. DEVOTION: Dress your partner in something special.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: dareDevotionId, packId: null, text: "DARE: Kiss your partner passionately for 1 minute. DEVOTION: Hold hands and share your dreams.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: dareDevotionId, packId: null, text: "DARE: Blindfold your partner and tease them. DEVOTION: Plan your next date night together.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: dareDevotionId, packId: null, text: "DARE: Act out a romantic movie scene. DEVOTION: Recreate your first kiss.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: dareDevotionId, packId: null, text: "DARE: Give a sensual massage. DEVOTION: Give a loving foot rub.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: dareDevotionId, packId: null, text: "DARE: Describe your hottest fantasy. DEVOTION: Share your favorite memory of us.", type: "truth", intensity: 5, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true, safeForRemote: true } },
    ];
    dareDevotionPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // Add Heat Check prompts (games[10])
    const heatCheckId = games[10].id;
    const heatCheckPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: heatCheckId, packId: null, text: "WARM: Give your partner a forehead kiss.", type: "dare", intensity: 1, flags: { isCoupleExclusive: true } },
      { gameId: heatCheckId, packId: null, text: "WARM: Hold your partner close for 30 seconds.", type: "dare", intensity: 1, flags: { isCoupleExclusive: true } },
      { gameId: heatCheckId, packId: null, text: "TOASTY: Kiss your partner's hand like royalty.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: heatCheckId, packId: null, text: "TOASTY: Whisper three things you find attractive about your partner.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: heatCheckId, packId: null, text: "HOT: Kiss your partner's neck for 10 seconds.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: heatCheckId, packId: null, text: "HOT: Give your partner a slow, deep kiss.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: heatCheckId, packId: null, text: "SIZZLING: Trace your lips across your partner's shoulders.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: heatCheckId, packId: null, text: "SIZZLING: Give your partner a teasing massage.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: heatCheckId, packId: null, text: "ON FIRE: Pin your partner against the wall and kiss them passionately.", type: "dare", intensity: 5, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: heatCheckId, packId: null, text: "ON FIRE: Take control and show your partner exactly what you want.", type: "dare", intensity: 5, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true, isKinkyTease: true } },
    ];
    heatCheckPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // Add Velvet Roulette prompts (games[11])
    const velvetRouletteId = games[11].id;
    const velvetRoulettePrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: velvetRouletteId, packId: null, text: "Spin landed on: SWEET GESTURE - Give your partner an unexpected compliment.", type: "dare", intensity: 1, flags: { isCoupleExclusive: true } },
      { gameId: velvetRouletteId, packId: null, text: "Spin landed on: COZY MOMENT - Cuddle for 2 minutes without phones.", type: "dare", intensity: 1, flags: { isCoupleExclusive: true } },
      { gameId: velvetRouletteId, packId: null, text: "Spin landed on: KISS CHALLENGE - Give 5 different types of kisses.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: velvetRouletteId, packId: null, text: "Spin landed on: MEMORY LANE - Reenact how you first met.", type: "challenge", intensity: 2, flags: { isCoupleExclusive: true } },
      { gameId: velvetRouletteId, packId: null, text: "Spin landed on: TEASE TIME - Give your partner a 30-second tease.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: velvetRouletteId, packId: null, text: "Spin landed on: CONFESSION CORNER - Share a secret desire.", type: "confession", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isConfession: true } },
      { gameId: velvetRouletteId, packId: null, text: "Spin landed on: MASSAGE PARLOR - 3-minute back massage.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true } },
      { gameId: velvetRouletteId, packId: null, text: "Spin landed on: ROLE PLAY - Act out your partner's favorite movie scene.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: velvetRouletteId, packId: null, text: "Spin landed on: WILD CARD - Partner's choice of any romantic activity.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: velvetRouletteId, packId: null, text: "Spin landed on: JACKPOT - Fulfill one of your partner's fantasies (within comfort).", type: "dare", intensity: 5, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
    ];
    velvetRoulettePrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // Add Neon Conspiracy prompts (games[12])
    const neonConspiracyId = games[12].id;
    const neonConspiracyPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: neonConspiracyId, packId: null, text: "MISSION: Exchange a secret code phrase only you two understand.", type: "challenge", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: neonConspiracyId, packId: null, text: "MISSION: Plan a surprise date for each other within 2 minutes.", type: "challenge", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: neonConspiracyId, packId: null, text: "MISSION: Create a secret handshake with romantic elements.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true } },
      { gameId: neonConspiracyId, packId: null, text: "MISSION: Together, come up with a romantic bucket list (3 items).", type: "challenge", intensity: 2, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: neonConspiracyId, packId: null, text: "MISSION: Agree on a 'signal' that means 'I want you' in public.", type: "challenge", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true, safeForRemote: true } },
      { gameId: neonConspiracyId, packId: null, text: "MISSION: Create a 5-step seduction plan together.", type: "challenge", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true, safeForRemote: true } },
      { gameId: neonConspiracyId, packId: null, text: "MISSION: Write each other love notes to be opened later.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: neonConspiracyId, packId: null, text: "MISSION: Plan a romantic getaway together (hypothetical or real).", type: "challenge", intensity: 2, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: neonConspiracyId, packId: null, text: "MISSION: Create matching playlist songs for 'your song'.", type: "challenge", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: neonConspiracyId, packId: null, text: "MISSION: Design your dream bedroom together (describe it in detail).", type: "challenge", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true, safeForRemote: true } },
    ];
    neonConspiracyPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // Add Velvet Ludo prompts (games[13])
    const velvetLudoId = games[13].id;
    const velvetLudoPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      // Couple Mode - Romantic Challenges
      { gameId: velvetLudoId, packId: null, text: "💋 VELVET KISS: Give your partner a soft kiss on the cheek.", type: "dare", intensity: 1, flags: { isCoupleExclusive: true } },
      { gameId: velvetLudoId, packId: null, text: "💕 VELVET COMPLIMENT: Tell your partner something you love about them.", type: "dare", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: velvetLudoId, packId: null, text: "✨ VELVET TRUTH: Share your favorite memory of your relationship.", type: "truth", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: velvetLudoId, packId: null, text: "🫂 VELVET EMBRACE: Hold your partner close for 30 seconds.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true } },
      { gameId: velvetLudoId, packId: null, text: "🌹 VELVET WHISPER: Whisper something sweet in your partner's ear.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: velvetLudoId, packId: null, text: "🤚 VELVET TOUCH: Gently trace your fingers along your partner's arm.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: velvetLudoId, packId: null, text: "💆 VELVET MASSAGE: Give your partner a short shoulder massage.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: velvetLudoId, packId: null, text: "💏 VELVET DEEP: Kiss your partner slowly and deeply.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: velvetLudoId, packId: null, text: "🔥 VELVET CONFESSION: Share a secret desire with your partner.", type: "confession", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isConfession: true } },
      { gameId: velvetLudoId, packId: null, text: "😈 VELVET TEASE: Give your partner a playful tease.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: velvetLudoId, packId: null, text: "💋 VELVET PASSION: Kiss your partner on the neck for 10 seconds.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: velvetLudoId, packId: null, text: "🔥 VELVET FIRE: Show your partner exactly how you want to be kissed.", type: "dare", intensity: 5, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },

      // Friends Mode - Fun Challenges
      { gameId: velvetLudoId, packId: null, text: "🎭 IMPROV: Do your best celebrity impression!", type: "dare", intensity: 1, flags: {} },
      { gameId: velvetLudoId, packId: null, text: "🎤 SING IT: Sing the chorus of your favorite song.", type: "dare", intensity: 2, flags: {} },
      { gameId: velvetLudoId, packId: null, text: "🕺 DANCE MOVE: Show us your signature dance move!", type: "dare", intensity: 2, flags: { requiresMovement: true } },
      { gameId: velvetLudoId, packId: null, text: "🤣 JOKE TIME: Tell your best joke to make everyone laugh.", type: "dare", intensity: 1, flags: {} },
      { gameId: velvetLudoId, packId: null, text: "🎨 TRUTH: What's your hidden talent?", type: "truth", intensity: 1, flags: { safeForRemote: true } },
      { gameId: velvetLudoId, packId: null, text: "🌟 CONFESSION: Share your most embarrassing moment.", type: "confession", intensity: 3, flags: { isConfession: true, safeForRemote: true } },
      { gameId: velvetLudoId, packId: null, text: "🎯 CHALLENGE: Name 5 things in the room that are blue!", type: "challenge", intensity: 1, flags: {} },
      { gameId: velvetLudoId, packId: null, text: "🧠 TRIVIA: What's the capital of Australia?", type: "challenge", intensity: 2, flags: { safeForRemote: true } },

      // Bonus moves (both modes)
      { gameId: velvetLudoId, packId: null, text: "🎲 BONUS ROLL: You landed on a lucky space! Roll again.", type: "rule", intensity: 1, flags: { safeForRemote: true } },
      { gameId: velvetLudoId, packId: null, text: "🔄 SWITCH: Swap positions with one of opponent's pieces.", type: "rule", intensity: 2, flags: { safeForRemote: true } },
      { gameId: velvetLudoId, packId: null, text: "🛡️ SHIELD: Protect one of your pieces from being captured next turn.", type: "rule", intensity: 2, flags: { safeForRemote: true } },
      { gameId: velvetLudoId, packId: null, text: "⚡ SPEED: Move an extra 2 spaces with your next move!", type: "rule", intensity: 2, flags: { safeForRemote: true } },
    ];
    velvetLudoPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    // CrazyGames-inspired remixes are already seeded at games[14-20]
    const couplesDuelId = games[14].id;
    const couplesDuelPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: couplesDuelId, packId: null, text: "CHARGE ATTACK: Winner chooses a romantic dare for loser.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: couplesDuelId, packId: null, text: "DEFEND SUCCESS: Defender receives a compliment from attacker.", type: "dare", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: couplesDuelId, packId: null, text: "PERFECT BLOCK: Both players share a secret.", type: "confession", intensity: 3, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: couplesDuelId, packId: null, text: "COMBO BREAKER: Loser gives winner a 30-second massage.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: couplesDuelId, packId: null, text: "CRITICAL HIT: Winner gets a passionate kiss.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
    ];
    couplesDuelPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    const neonDriftId = games[15].id;
    const neonDriftPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: neonDriftId, packId: null, text: "DRIFT TOGETHER: Both players must agree on next move - if you can't, kiss to resolve.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: neonDriftId, packId: null, text: "COLLISION: Crashed? Tell your partner why you love them.", type: "truth", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: neonDriftId, packId: null, text: "PERFECT LAP: Winners choose where to take the next date.", type: "challenge", intensity: 2, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: neonDriftId, packId: null, text: "BOOST ACTIVATED: Share your wildest travel fantasy together.", type: "truth", intensity: 3, flags: { isCoupleExclusive: true, safeForRemote: true } },
    ];
    neonDriftPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    const truthBombId = games[16].id;
    const truthBombPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: truthBombId, packId: null, text: "GATE REACHED: What's something you've never told anyone here?", type: "truth", intensity: 3, flags: { safeForRemote: true, isConfession: true } },
      { gameId: truthBombId, packId: null, text: "OBSTACLE FAILED: Remove one accessory or reveal one secret.", type: "dare", intensity: 3, flags: { isBold: true } },
      { gameId: truthBombId, packId: null, text: "CHECKPOINT: Who here would you most want to kiss?", type: "truth", intensity: 4, flags: { isFlirty: true, safeForRemote: true } },
      { gameId: truthBombId, packId: null, text: "FINISH LINE: Confess your biggest turn-on to the group.", type: "confession", intensity: 5, flags: { isFlirty: true, isBold: true, safeForRemote: true } },
    ];
    truthBombPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    const emotionPingPongId = games[17].id;
    const emotionPingPongPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: emotionPingPongId, packId: null, text: "LOVE HIT: Share what you love most about your partner.", type: "truth", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: emotionPingPongId, packId: null, text: "FLIRT SERVE: Compliment your partner with a wink.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: emotionPingPongId, packId: null, text: "TEASE RALLY: Winner picks a playful dare for loser.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: emotionPingPongId, packId: null, text: "PASSION POINT: Kiss your partner passionately.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: emotionPingPongId, packId: null, text: "GAME WINNER: Loser fulfills one fantasy request.", type: "dare", intensity: 5, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
    ];
    emotionPingPongPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    const velvetMemoryId = games[18].id;
    const velvetMemoryPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: velvetMemoryId, packId: null, text: "SWEET MATCH: Share your favorite date memory.", type: "truth", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: velvetMemoryId, packId: null, text: "FLIRTY PAIR: Give your partner a soft kiss.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: velvetMemoryId, packId: null, text: "SPICY COMBO: Whisper something naughty in their ear.", type: "dare", intensity: 4, flags: { isCoupleExclusive: true, isFlirty: true, isBold: true } },
      { gameId: velvetMemoryId, packId: null, text: "PERFECT MATCH: Both choose one thing to do tonight.", type: "challenge", intensity: 3, flags: { isCoupleExclusive: true, safeForRemote: true } },
    ];
    velvetMemoryPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    const neonGuessingId = games[19].id;
    const neonGuessingPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: neonGuessingId, packId: null, text: "CORRECT GUESS: Your partner reveals their current mood.", type: "truth", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: neonGuessingId, packId: null, text: "WRONG ANSWER: Give your partner a compliment.", type: "dare", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: neonGuessingId, packId: null, text: "STREAK BONUS: Both share what attracted you to each other.", type: "truth", intensity: 2, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: neonGuessingId, packId: null, text: "PERFECT READ: Your partner reveals a hidden desire.", type: "confession", intensity: 4, flags: { isCoupleExclusive: true, safeForRemote: true, isFlirty: true } },
    ];
    neonGuessingPrompts.forEach((prompt) => {
      const id = randomUUID();
      this.prompts.set(id, { ...prompt, id, createdAt: new Date() });
    });

    const duoRhythmId = games[20].id;
    const duoRhythmPrompts: Omit<Prompt, "id" | "createdAt">[] = [
      { gameId: duoRhythmId, packId: null, text: "PERFECT SYNC: Dance together for 30 seconds.", type: "dare", intensity: 2, flags: { isCoupleExclusive: true, requiresMovement: true } },
      { gameId: duoRhythmId, packId: null, text: "COMBO STREAK: Share your favorite song memory together.", type: "truth", intensity: 1, flags: { isCoupleExclusive: true, safeForRemote: true } },
      { gameId: duoRhythmId, packId: null, text: "HEAT SPARK: Kiss in rhythm to the music.", type: "dare", intensity: 3, flags: { isCoupleExclusive: true, isFlirty: true } },
      { gameId: duoRhythmId, packId: null, text: "HARMONY BONUS: Create a couples dance move together.", type: "challenge", intensity: 2, flags: { isCoupleExclusive: true } },
    ];
    duoRhythmPrompts.forEach((prompt) => {
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
    console.log(`[storage] Fetching game by slug: "${slug}"`);

    const game = Array.from(this.games.values()).find((g) => g.slug === slug);

    if (!game) {
      console.log(`[storage] No game found with slug: "${slug}"`);
      return undefined;
    }

    console.log(`[storage] Found game: ${game.name} (ID: ${game.id})`);

    const packs = await this.getPacksByGameId(game.id);
    const prompts = await this.getPromptsByGameId(game.id);

    console.log(`[storage] Game has ${packs.length} packs and ${prompts.length} prompts`);

    return {
      ...game,
      packs,
      promptCount: prompts.length,
    };
  }

  async createGame(game: InsertGame): Promise<Game> {
    const id = randomUUID();
    const newGame: Game = { 
      id, 
      name: game.name,
      slug: game.slug,
      description: game.description,
      minPlayers: game.minPlayers ?? 2,
      maxPlayers: game.maxPlayers ?? 10,
      supportsOnline: game.supportsOnline ?? true,
      supportsLocal: game.supportsLocal ?? true,
      tags: game.tags ?? null,
      isSpicy: game.isSpicy ?? false,
      isCoupleFocused: game.isCoupleFocused ?? false,
      iconName: game.iconName ?? null,
      createdAt: new Date() 
    };
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
    const newPack: Pack = { 
      id, 
      name: pack.name,
      gameId: pack.gameId,
      description: pack.description ?? null,
      intensity: pack.intensity ?? 3,
      isDefault: pack.isDefault ?? false,
      createdAt: new Date() 
    };
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
    const newPrompt: Prompt = { 
      id, 
      text: prompt.text,
      type: prompt.type as "truth" | "dare" | "challenge" | "confession" | "vote" | "rule",
      gameId: prompt.gameId,
      packId: prompt.packId ?? null,
      intensity: prompt.intensity ?? 3,
      flags: prompt.flags ?? null,
      createdAt: new Date() 
    };
    this.prompts.set(id, newPrompt);
    return newPrompt;
  }

  async updatePrompt(id: string, updates: Partial<InsertInsertPrompt>): Promise<Prompt | undefined> {
    const prompt = this.prompts.get(id);
    if (!prompt) return undefined;

    const updatedPrompt: Prompt = { 
      ...prompt, 
      ...updates,
      type: (updates.type ?? prompt.type) as "truth" | "dare" | "challenge" | "confession" | "vote" | "rule"
    };
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
      id,
      gameId: room.gameId,
      hostId: room.hostId,
      joinCode,
      status: (room.status ?? "waiting") as "waiting" | "in-progress" | "finished",
      round: room.round ?? 0,
      settings: room.settings ?? null,
      currentPromptId: room.currentPromptId ?? null,
      usedPromptIds: room.usedPromptIds ?? [],
      turnIndex: room.turnIndex ?? 0,
      heatLevel: room.heatLevel ?? 0,
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
    const newPlayer: RoomPlayer = { 
      id, 
      roomId: player.roomId,
      nickname: player.nickname,
      odId: player.odId ?? null,
      isHost: player.isHost ?? false,
      isReady: player.isReady ?? false,
      avatarColor: player.avatarColor ?? null,
      joinedAt: new Date() 
    };
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