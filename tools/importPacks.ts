import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { MemStorage } from "../server/storage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface PackData {
  id: string;
  name: string;
  description: string;
  gameId: string;
  intensity: number;
  prompts: Array<{
    id: string;
    text: string;
    type: string;
    intensity: number;
    flags: Record<string, boolean>;
  }>;
}

async function importPacks() {
  console.log("🎯 Starting pack import...");

  try {
    // Initialize storage
    const storage = new MemStorage();

    // Get Truth or Dare game
    const games = await storage.getGames();
    const game = games.find((g) => g.slug === "truth-or-dare");

    if (!game) {
      throw new Error("Truth or Dare game not found. Please create it first.");
    }

    const gameId = game.id;
    console.log(`✓ Found game: ${game.name} (${gameId})`);

    // Read all pack files
    const packsDir = path.join(__dirname, "../content/packs");
    const packFiles = await readdir(packsDir);

    let totalPromptsImported = 0;
    let packsImported = 0;

    for (const file of packFiles) {
      if (!file.endsWith(".json")) continue;

      const filePath = path.join(packsDir, file);
      const fileContent = await readFile(filePath, "utf-8");
      const packData = JSON.parse(fileContent) as PackData;

      // Validate pack data
      if (!packData.id || !packData.name || !packData.prompts) {
        console.warn(`⚠️  Skipping invalid pack file: ${file}`);
        continue;
      }

      if (!Array.isArray(packData.prompts) || packData.prompts.length === 0) {
        console.warn(`⚠️  Pack ${packData.name} has no prompts, skipping`);
        continue;
      }

      // Validate all prompts
      for (const prompt of packData.prompts) {
        if (!prompt.text || !prompt.type || !prompt.id) {
          throw new Error(
            `Invalid prompt in ${packData.name}: missing required fields`
          );
        }
        if (![1, 2, 3, 4, 5].includes(prompt.intensity)) {
          throw new Error(
            `Invalid intensity ${prompt.intensity} in ${packData.name}`
          );
        }
      }

      console.log(`\n📦 Importing pack: ${packData.name}`);

      // Create pack
      const createdPack = await storage.createPack({
        gameId,
        name: packData.name,
        description: packData.description,
        intensity: packData.intensity,
        isDefault: false,
      });

      console.log(`  ✓ Created pack with ID: ${createdPack.id}`);

      // Create all prompts
      for (const promptData of packData.prompts) {
        await storage.createPrompt({
          gameId,
          packId: createdPack.id,
          text: promptData.text,
          type: promptData.type as any,
          intensity: promptData.intensity,
          flags: promptData.flags || {},
        });
      }

      console.log(`  ✓ Imported ${packData.prompts.length} prompts`);
      totalPromptsImported += packData.prompts.length;
      packsImported++;
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   📦 ${packsImported} packs imported`);
    console.log(`   🎴 ${totalPromptsImported} total prompts added`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Import failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run import
importPacks();
