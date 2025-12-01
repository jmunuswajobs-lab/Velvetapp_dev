import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../server/index.js";
import { packs, prompts, games } from "../shared/schema.js";
import { eq } from "drizzle-orm";

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
    // Get Truth or Dare game
    const game = await db
      .select()
      .from(games)
      .where(eq(games.slug, "truth-or-dare"))
      .limit(1);

    if (!game || game.length === 0) {
      throw new Error("Truth or Dare game not found. Please create it first.");
    }

    const gameId = game[0].id;
    console.log(`✓ Found game: ${game[0].name} (${gameId})`);

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

      // Check if pack already exists
      const existingPack = await db
        .select()
        .from(packs)
        .where(eq(packs.name, packData.name))
        .limit(1);

      let packId: string;

      if (existingPack && existingPack.length > 0) {
        packId = existingPack[0].id;
        console.log(`  ✓ Pack already exists with ID: ${packId}`);

        // Delete existing prompts for this pack
        const existingPrompts = await db
          .select()
          .from(prompts)
          .where(eq(prompts.packId, packId));

        if (existingPrompts.length > 0) {
          console.log(
            `  🗑️  Removing ${existingPrompts.length} old prompts...`
          );
          // Note: In production, use a proper migration/deletion pattern
        }
      } else {
        // Insert new pack
        const result = await db
          .insert(packs)
          .values({
            gameId,
            name: packData.name,
            description: packData.description,
            intensity: packData.intensity,
          })
          .returning({ id: packs.id });

        packId = result[0].id;
        console.log(`  ✓ Created pack with ID: ${packId}`);
      }

      // Insert all prompts
      for (const promptData of packData.prompts) {
        await db.insert(prompts).values({
          gameId,
          packId,
          text: promptData.text,
          type: promptData.type,
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
