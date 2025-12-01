import type { Prompt } from "../../shared/schema";
import { selectBySpiceWeight } from "./spiceBalancer";

export interface PromptFilter {
  packIds?: string[];
  minSpice?: number;
  maxSpice?: number;
  tagsInclude?: string[];
  tagsExclude?: string[];
  alreadyUsedIds?: string[];
  types?: string[];
}

export interface PromptOptions {
  targetSpice?: number;
  preferVariety?: boolean;
}

/**
 * Main prompt selection engine with weighted randomness
 * Considers spice level, variety, and user preferences
 */
export function getNextPrompt(
  allPrompts: Prompt[],
  filter: PromptFilter = {},
  options: PromptOptions = {}
): Prompt | null {
  if (!allPrompts || allPrompts.length === 0) return null;

  const {
    packIds,
    minSpice = 1,
    maxSpice = 5,
    tagsInclude = [],
    tagsExclude = [],
    alreadyUsedIds = [],
    types = ["truth", "dare", "challenge", "confession", "vote", "rule"],
  } = filter;

  const { targetSpice = 3, preferVariety = true } = options;

  // Convert to Set for O(1) lookup
  const usedIds = new Set(alreadyUsedIds);

  // Apply filters
  let candidates = allPrompts.filter((prompt) => {
    // Skip already used
    if (usedIds.has(prompt.id)) return false;

    // Filter by pack
    if (packIds && packIds.length > 0 && !packIds.includes(prompt.packId || "")) {
      return false;
    }

    // Filter by intensity/spice
    const intensity = prompt.intensity || 3;
    if (intensity < minSpice || intensity > maxSpice) return false;

    // Filter by type
    if (!types.includes(prompt.type)) return false;

    return true;
  });

  if (candidates.length === 0) return null;

  // Apply tag-based filtering
  if (tagsInclude.length > 0 || tagsExclude.length > 0) {
    candidates = candidates.filter((prompt) => {
      const promptTags = getPromptTags(prompt);

      // Must include at least one of these tags
      if (tagsInclude.length > 0) {
        const hasIncluded = tagsInclude.some((tag) => promptTags.has(tag));
        if (!hasIncluded) return false;
      }

      // Must not include any of these tags
      if (tagsExclude.length > 0) {
        const hasExcluded = tagsExclude.some((tag) => promptTags.has(tag));
        if (hasExcluded) return false;
      }

      return true;
    });
  }

  if (candidates.length === 0) return null;

  // Apply variety preference - prefer different types
  if (preferVariety && candidates.length > 1) {
    // Boost non-truth/dare prompts if we have them
    const diverseTypes = candidates.filter(
      (p) => p.type !== "truth" && p.type !== "dare"
    );
    if (diverseTypes.length > 0 && Math.random() < 0.3) {
      candidates = diverseTypes;
    }
  }

  // Use weighted selection by spice level
  const selected = selectBySpiceWeight(
    candidates,
    targetSpice,
    usedIds
  );

  return selected;
}

/**
 * Extract tags from prompt flags for filtering
 */
function getPromptTags(prompt: Prompt): Set<string> {
  const tags = new Set<string>();

  if (!prompt.flags) return tags;

  // Map flags to human-readable tags
  if (prompt.flags.isFlirty) tags.add("flirty");
  if (prompt.flags.isBold) tags.add("bold");
  if (prompt.flags.isKinkyTease) tags.add("kinky-tease");
  if (prompt.flags.isCoupleExclusive) tags.add("couple-only");
  if (prompt.flags.isConfession) tags.add("emotional");
  if (prompt.flags.isNSFW) tags.add("nsfw");
  if (prompt.flags.requiresMovement) tags.add("physical");
  if (prompt.flags.safeForRemote) tags.add("remote-safe");

  return tags;
}

/**
 * Get statistics about available prompts for UI
 */
export function getPromptStats(prompts: Prompt[]) {
  let truthCount = 0;
  let dareCount = 0;
  let challengeCount = 0;
  let avgIntensity = 0;

  for (const prompt of prompts) {
    if (prompt.type === "truth") truthCount++;
    else if (prompt.type === "dare") dareCount++;
    else if (prompt.type === "challenge") challengeCount++;

    avgIntensity += prompt.intensity || 3;
  }

  avgIntensity = prompts.length > 0 ? avgIntensity / prompts.length : 3;

  return {
    total: prompts.length,
    truthCount,
    dareCount,
    challengeCount,
    avgIntensity: Math.round(avgIntensity * 10) / 10,
    typesAvailable: [truthCount, dareCount, challengeCount].filter((c) => c > 0)
      .length,
  };
}

/**
 * Shuffle array using Fisher-Yates
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Batch get next N prompts (useful for pre-loading)
 */
export function getNextPrompts(
  allPrompts: Prompt[],
  count: number,
  filter: PromptFilter = {},
  options: PromptOptions = {}
): Prompt[] {
  const result: Prompt[] = [];
  const usedIds = new Set(filter.alreadyUsedIds || []);

  for (let i = 0; i < count; i++) {
    const prompt = getNextPrompt(
      allPrompts,
      { ...filter, alreadyUsedIds: Array.from(usedIds) },
      options
    );

    if (!prompt) break;

    result.push(prompt);
    usedIds.add(prompt.id);
  }

  return result;
}
