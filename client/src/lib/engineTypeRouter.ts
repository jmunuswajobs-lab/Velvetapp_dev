import type { EngineType } from "@shared/schema";

export const ENGINE_TYPE_MAP: Record<string, EngineType> = {
  // Core prompt party games
  "truth-or-dare": "prompt-party",
  "never-have-i-ever": "prompt-party",
  "hot-seat": "prompt-party",
  "would-you-rather": "prompt-party",

  // Couples intimacy game
  "couples-challenge": "prompt-couple",

  // Board/Puzzle/Arcade
  "velvet-ludo": "board-ludo",
  "velvet-memory-flip": "memory-match",
  "emotion-ping-pong": "pong",
  "neon-drift-couple": "racer",
  "couples-duel-arena": "tap-duel",
  "neon-guessing-game": "guessing",
  "duo-rhythm-sync": "rhythm",

  // Roulette/Tools
  "spin-the-bottle": "roulette",
  "velvet-roulette": "tool-randomizer",

  // New party games
  "shot-roulette": "roulette",
  "button-mash-brawl": "tap-duel",
  "flip-clash": "tool-randomizer",
  "stacked-reactions": "guessing",
};

export function getEngineType(slug: string): EngineType {
  return ENGINE_TYPE_MAP[slug] || "prompt-party";
}
