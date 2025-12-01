import { PromptCard } from "./VelvetCard";
import { VelvetButton } from "./VelvetButton";
import { HeatMeter } from "./HeatMeter";
import { BeerPongGame } from "./BeerPongGame";
import type { LocalPromptsSession, Game } from "@shared/schema";

// PROMPT-BASED GAMES
export function PromptGameScreen({
  session,
  game,
  onNext,
  onPrevious,
  onSkip,
  onEnd,
}: {
  session: LocalPromptsSession;
  game: Game;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onEnd: () => void;
}) {
  const currentPrompt = session.prompts[session.currentPromptIndex];
  const currentPlayer = session.players[session.turnIndex];
  const promptsRemaining = session.prompts.length - session.currentPromptIndex - 1;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-4">
        {currentPrompt && (
          <PromptCard prompt={currentPrompt} player={currentPlayer} />
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <HeatMeter value={session.heatLevel} showLabel />
          <span className="text-sm text-muted-foreground">
            {promptsRemaining} remaining
          </span>
        </div>

        <div className="flex gap-2 justify-center">
          <VelvetButton velvetVariant="ghost" onClick={onPrevious}>
            Previous
          </VelvetButton>
          <VelvetButton velvetVariant="neon" onClick={onNext}>
            Next
          </VelvetButton>
          <VelvetButton velvetVariant="ghost" onClick={onSkip}>
            Skip
          </VelvetButton>
          <VelvetButton velvetVariant="velvet" onClick={onEnd}>
            End Game
          </VelvetButton>
        </div>
      </div>
    </div>
  );
}

// MEMORY MATCH GAME
export function MemoryMatchScreen() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="grid grid-cols-4 gap-2 mb-8">
        {Array(16)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-lg bg-gradient-to-br from-neon-magenta to-ember-red cursor-pointer hover:scale-105 transition-transform flex items-center justify-center text-white font-bold"
            >
              ♥
            </div>
          ))}
      </div>
      <VelvetButton velvetVariant="velvet">Game logic coming soon</VelvetButton>
    </div>
  );
}

// BEER PONG GAME
export function PongScreen() {
  return (
    <div className="flex flex-col h-full items-center justify-center p-4">
      <BeerPongGame />
    </div>
  );
}

// RACING GAME
export function RacingScreen() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="w-full max-w-2xl h-64 bg-gradient-to-r from-neon-magenta/20 to-ember-red/20 rounded-lg flex items-center justify-center mb-8 relative">
        <div className="text-center">
          <div className="text-5xl mb-4">🏁</div>
          <p className="text-white text-lg font-bold">Neon Drift Couple Mode</p>
          <div className="flex justify-around mt-4 px-4">
            <div>P1 Lane</div>
            <div>P2 Lane</div>
          </div>
        </div>
      </div>
      <VelvetButton velvetVariant="neon">Start Racing</VelvetButton>
    </div>
  );
}

// MINI DUEL GAME
export function MiniDuelScreen() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="flex gap-16 mb-8">
        <div className="text-center">
          <div className="text-6xl mb-2">⚔️</div>
          <p className="text-lg font-bold">Player 1</p>
          <p className="text-2xl text-neon-magenta font-bold mt-2">100 HP</p>
        </div>
        <div className="text-center">
          <div className="text-6xl mb-2">⚔️</div>
          <p className="text-lg font-bold">Player 2</p>
          <p className="text-2xl text-ember-red font-bold mt-2">100 HP</p>
        </div>
      </div>
      <div className="flex gap-4">
        <VelvetButton velvetVariant="velvet">Attack</VelvetButton>
        <VelvetButton velvetVariant="ghost">Defend</VelvetButton>
        <VelvetButton velvetVariant="neon">Charge</VelvetButton>
      </div>
    </div>
  );
}

// BOARD GAME (LUDO)
export function BoardGameScreen() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <p className="text-white text-xl mb-4">Velvet Ludo Board</p>
      <div className="grid grid-cols-4 gap-2">
        {Array(16)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded border-2 border-neon-magenta/30 flex items-center justify-center text-xs"
            >
              {i}
            </div>
          ))}
      </div>
      <div className="mt-8">
        <VelvetButton velvetVariant="neon">Roll Dice</VelvetButton>
      </div>
    </div>
  );
}
