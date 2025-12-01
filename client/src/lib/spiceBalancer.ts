import type { Prompt } from "@shared/schema";

export interface SpiceStats {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  total: number;
  average: number;
  distribution: Record<number, number>;
}

export interface SpiceRecommendation {
  targetLevel: number;
  distribution: Record<number, number>;
}

/**
 * Calculate spice level distribution for a set of prompts
 */
export function calculateSpiceDistribution(prompts: Prompt[]): SpiceStats {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  let totalIntensity = 0;

  for (const prompt of prompts) {
    const intensity = Math.max(1, Math.min(5, prompt.intensity || 3));
    distribution[intensity]++;
    totalIntensity += intensity;
  }

  const total = prompts.length;
  const average = total > 0 ? totalIntensity / total : 3;

  return {
    level1: distribution[1],
    level2: distribution[2],
    level3: distribution[3],
    level4: distribution[4],
    level5: distribution[5],
    total,
    average,
    distribution,
  };
}

/**
 * Get recommended spice level based on couple preference and history
 * Avoids extreme levels and encourages gradual escalation
 */
export function getRecommendedSpiceLevel(
  couplePrefLevel: number = 3,
  usedPromptCount: number = 0
): number {
  // Clamp preference between 1-5
  const pref = Math.max(1, Math.min(5, couplePrefLevel));

  // Gradually allow higher spice with more prompts played
  if (usedPromptCount < 5) {
    // Start conservative
    return Math.max(1, pref - 1);
  } else if (usedPromptCount < 15) {
    // Build up to preference
    return pref;
  } else {
    // Can go slightly beyond after 15+ prompts
    return Math.min(5, pref + 1);
  }
}

/**
 * Generate weighted distribution based on target spice level
 * Returns probability weights for each spice level (0-1, sums to 1)
 */
export function getSpiceWeights(
  targetLevel: number = 3
): Record<number, number> {
  const target = Math.max(1, Math.min(5, targetLevel));

  // Base probability mass - centered on target
  const weights: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  // Main distribution: 70% at target, 20% ±1, 10% as wild card
  weights[target] = 0.7;

  if (target > 1) {
    weights[target - 1] = 0.1;
  } else {
    weights[target + 1] = 0.1;
  }

  if (target < 5) {
    weights[target + 1] = (weights[target + 1] || 0) + 0.1;
  } else if (target > 1) {
    weights[target - 1] = (weights[target - 1] || 0) + 0.1;
  }

  // Distribute remaining probability across all levels
  const remaining = 0.1;
  const remainingLevels = Object.keys(weights)
    .map(Number)
    .filter((level) => level !== target);

  for (const level of remainingLevels) {
    weights[level] = (weights[level] || 0) + remaining / remainingLevels.length;
  }

  // Normalize to ensure sum = 1
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  for (const level in weights) {
    weights[Number(level)] = weights[Number(level)] / sum;
  }

  return weights;
}

/**
 * Select a prompt by intensity with weighted randomness
 * Ensures variety while respecting target spice level
 */
export function selectBySpiceWeight(
  prompts: Prompt[],
  targetSpice: number = 3,
  alreadyUsedIds: Set<string> = new Set()
): Prompt | null {
  if (prompts.length === 0) return null;

  // Filter out already used prompts
  const availablePrompts = prompts.filter((p) => !alreadyUsedIds.has(p.id));

  if (availablePrompts.length === 0) {
    return null;
  }

  // Get weights for each spice level
  const weights = getSpiceWeights(targetSpice);

  // Group prompts by intensity
  const byIntensity: Record<number, Prompt[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  for (const prompt of availablePrompts) {
    const intensity = Math.max(1, Math.min(5, prompt.intensity || 3));
    byIntensity[intensity].push(prompt);
  }

  // Select intensity level based on weights
  let randomValue = Math.random();
  let selectedIntensity = 3;

  for (let level = 1; level <= 5; level++) {
    randomValue -= weights[level];
    if (randomValue <= 0) {
      selectedIntensity = level;
      break;
    }
  }

  // Get prompts at this intensity, or adjacent levels
  let candidates = byIntensity[selectedIntensity];
  if (candidates.length === 0) {
    // Try adjacent levels
    if (selectedIntensity > 1 && byIntensity[selectedIntensity - 1].length > 0) {
      candidates = byIntensity[selectedIntensity - 1];
    } else if (selectedIntensity < 5 && byIntensity[selectedIntensity + 1].length > 0) {
      candidates = byIntensity[selectedIntensity + 1];
    } else {
      // Fallback to any available
      candidates = availablePrompts;
    }
  }

  if (candidates.length === 0) return null;

  // Random selection from candidates
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Check if spice distribution is too skewed
 * Returns true if any level dominates (>60% of total)
 */
export function isSpiceDistributionSkewed(stats: SpiceStats): boolean {
  const threshold = 0.6;
  for (const level in stats.distribution) {
    const ratio = stats.distribution[Number(level)] / stats.total;
    if (ratio > threshold) {
      return true;
    }
  }
  return false;
}
