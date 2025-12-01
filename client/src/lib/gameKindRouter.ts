import type { GameKind } from "@shared/schema";

export const GAME_KIND_MAP: Record<string, GameKind> = {
  "truth-or-dare": "prompt-round",
  "never-have-i-ever": "prompt-round",
  "couples-challenge": "couple-prompts",
  "hot-seat": "prompt-round",
  "spin-the-bottle": "prompt-round",
  "would-you-rather": "prompt-round",
  "deep-sync": "couple-prompts",
  "temptation-trails": "couple-prompts",
  "fantasy-signals": "couple-prompts",
  "dare-or-devotion": "couple-prompts",
  "heat-check": "couple-prompts",
  "velvet-roulette": "couple-prompts",
  "neon-conspiracy": "couple-prompts",
  "velvet-ludo": "board-ludo",
  "couples-duel-arena": "mini-duel",
  "neon-drift-couple": "racing",
  "truth-bomb-run": "prompt-round",
  "emotion-ping-pong": "pong",
  "velvet-memory-flip": "memory-match",
  "neon-guessing-game": "prompt-round",
  "duo-rhythm-sync": "prompt-round",
};

export function getGameKind(slug: string): GameKind {
  return GAME_KIND_MAP[slug] || "prompt-round";
}
