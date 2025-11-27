import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, SkipForward, X, 
  Flame, Users, RotateCcw
} from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { PromptCard } from "@/components/velvet/VelvetCard";
import { HeatMeter } from "@/components/velvet/HeatMeter";
import { PlayerAvatar } from "@/components/velvet/PlayerAvatar";
import { FadeIn, SlideIn } from "@/components/velvet/PageTransition";
import { useLocalGame, useOnlineRoom } from "@/lib/gameState";
import type { Prompt } from "@shared/schema";

export default function Gameplay() {
  const { slug, roomId } = useParams<{ slug?: string; roomId?: string }>();
  const isOnlineMode = !!roomId;
  const [, setLocation] = useLocation();

  // Use different state management based on mode
  const localGame = useLocalGame();
  const onlineGame = useOnlineRoom();

  const gameState = isOnlineMode ? null : localGame.gameState; // For now, online mode uses WebSocket
  const nextPrompt = isOnlineMode ? () => {} : localGame.nextPrompt;
  const skipPrompt = isOnlineMode ? () => {} : localGame.skipPrompt;
  const updateHeatLevel = isOnlineMode ? () => {} : localGame.updateHeatLevel;
  const advanceTurn = isOnlineMode ? () => {} : localGame.advanceTurn;
  const endGame = isOnlineMode ? () => ({ roundsPlayed: 0, promptsByType: {}, playerPicks: {}, skippedCount: 0 }) : localGame.endGame;
  const resetGame = isOnlineMode ? () => {} : localGame.resetGame;


  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (isOnlineMode) {
      // TODO: Implement online game logic once WebSocket is ready
      // For now, if online mode is detected, redirect to a placeholder loading state
      return;
    }

    if (!gameState) {
      setLocation(`/games/${slug}/local`);
      return;
    }
    // Set initial prompt
    if (gameState.prompts.length > 0) {
      setCurrentPrompt(gameState.prompts[gameState.currentPromptIndex]);
    }
  }, [gameState, slug, setLocation, isOnlineMode]);

  const handleNext = useCallback(() => {
    setIsCardFlipped(false);
    setTimeout(() => {
      const prompt = nextPrompt();
      if (prompt) {
        setCurrentPrompt(prompt);
        advanceTurn();
        // Increase heat based on intensity
        updateHeatLevel(prompt.intensity * 2);
      } else {
        // No more prompts, go to summary
        setLocation(isOnlineMode ? `/games/${roomId}/summary` : `/games/${slug}/summary`);
      }
    }, 200);
  }, [nextPrompt, advanceTurn, updateHeatLevel, setLocation, slug, isOnlineMode, roomId]);

  const handlePrevious = useCallback(() => {
    setIsCardFlipped(false);
    setTimeout(() => {
      const prompt = previousPrompt();
      if (prompt) {
        setCurrentPrompt(prompt);
      }
    }, 200);
  }, [previousPrompt]);

  const handleSkip = useCallback(() => {
    setIsCardFlipped(false);
    setTimeout(() => {
      skipPrompt();
      const prompt = gameState?.prompts[gameState.currentPromptIndex + 1];
      if (prompt) {
        setCurrentPrompt(prompt);
        advanceTurn();
      } else {
        setLocation(isOnlineMode ? `/games/${roomId}/summary` : `/games/${slug}/summary`);
      }
    }, 200);
  }, [skipPrompt, gameState, advanceTurn, setLocation, slug, isOnlineMode, roomId]);

  const handleExit = useCallback(() => {
    endGame();
    resetGame();
    setLocation("/");
  }, [endGame, resetGame, setLocation]);

  const handleEndGame = useCallback(() => {
    setLocation(isOnlineMode ? `/games/${roomId}/summary` : `/games/${slug}/summary`);
  }, [setLocation, slug, isOnlineMode, roomId]);

  if (isOnlineMode) {
    // Online mode - show placeholder for now
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-neon-magenta/30 border-t-neon-magenta mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h1 className="text-2xl font-display font-bold mb-2">Loading Game...</h1>
          <p className="text-muted-foreground">Setting up your online game</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Flame className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">No Active Game</h1>
          <p className="text-muted-foreground mb-6">Start a new game to begin playing</p>
          <Link href="/">
            <VelvetButton velvetVariant="neon">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </VelvetButton>
          </Link>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.turnIndex];
  const promptsRemaining = gameState.prompts.length - gameState.currentPromptIndex - 1;

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(176, 15, 47, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 70%, rgba(59, 15, 92, 0.3) 0%, transparent 50%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={20} />

      {/* Exit confirmation modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-noir-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card rounded-2xl p-6 max-w-sm mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-xl font-display font-bold mb-3">End Game?</h2>
              <p className="text-muted-foreground mb-6">
                Your progress will be saved. You can view your stats in the summary.
              </p>
              <div className="flex gap-3">
                <VelvetButton
                  velvetVariant="ghost-glow"
                  className="flex-1"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Continue Playing
                </VelvetButton>
                <VelvetButton
                  velvetVariant="velvet"
                  className="flex-1"
                  onClick={handleEndGame}
                  data-testid="button-confirm-end"
                >
                  See Summary
                </VelvetButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="glass border-b border-plum-deep/30 shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
              data-testid="button-exit"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Round</span>
              <span className="font-semibold">{gameState.round}</span>
              <span className="text-muted-foreground mx-1">•</span>
              <span className="text-muted-foreground">{promptsRemaining} left</span>
            </div>

            <HeatMeter value={gameState.heatLevel} showLabel={false} size="sm" className="w-24" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">
        {/* Current player */}
        <FadeIn className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">It's your turn</p>
          <div className="flex items-center justify-center gap-3">
            <PlayerAvatar
              nickname={currentPlayer.nickname}
              color={currentPlayer.avatarColor}
              isCurrentTurn
              size="lg"
            />
            <span className="text-xl font-display font-semibold gradient-text">
              {currentPlayer.nickname}
            </span>
          </div>
        </FadeIn>

        {/* Prompt card */}
        <div className="flex-1 flex items-center justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPrompt.id}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-sm"
            >
              <PromptCard
                text={currentPrompt.text}
                type={currentPrompt.type}
                intensity={currentPrompt.intensity}
                isFlipped={isCardFlipped}
                onFlip={() => setIsCardFlipped(!isCardFlipped)}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Players bar */}
        <div className="flex justify-center gap-2 mb-6 overflow-x-auto py-2">
          {gameState.players.map((player, index) => (
            <PlayerAvatar
              key={player.nickname}
              nickname={player.nickname}
              color={player.avatarColor}
              isCurrentTurn={index === gameState.turnIndex}
              size="sm"
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <VelvetButton
            velvetVariant="ghost-glow"
            size="icon"
            onClick={handlePrevious}
            disabled={gameState.currentPromptIndex === 0}
            data-testid="button-previous"
          >
            <ArrowLeft className="w-5 h-5" />
          </VelvetButton>

          <VelvetButton
            velvetVariant="ghost-glow"
            onClick={handleSkip}
            data-testid="button-skip"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip
          </VelvetButton>

          <VelvetButton
            velvetVariant="neon"
            className="px-8"
            onClick={handleNext}
            data-testid="button-next"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </VelvetButton>
        </div>
      </main>
    </div>
  );
}