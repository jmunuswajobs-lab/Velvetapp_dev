import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, SkipForward, X, 
  Flame, Users, RotateCcw, ArrowRight, Home
} from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { PromptCard } from "@/components/velvet/VelvetCard";
import { HeatMeter } from "@/components/velvet/HeatMeter";
import { PlayerAvatar } from "@/components/velvet/PlayerAvatar";
import { FadeIn, SlideIn } from "@/components/velvet/PageTransition";
import { useLocalGame, useOnlineRoom } from "@/lib/gameState"; // Assuming these are the correct hooks based on context
import type { Prompt } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Placeholder for actual hook implementations if they are different from useLocalGame/useOnlineRoom
// In a real scenario, these would be imported from their respective files.
const useLocalGameState = useLocalGame;
const useOnlineGameState = useOnlineRoom;


export default function Gameplay() {
  const { slug, roomId } = useParams<{ slug: string; roomId?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const isOnlineMode = Boolean(roomId);

  // Local game state - always call hooks
  const localGame = useLocalGameState();

  // Online game state - always call hooks
  const onlineGame = useOnlineGameState();

  // Memoize current game state based on mode
  const currentGameState = useMemo(() => {
    return isOnlineMode ? onlineGame.gameState : localGame.gameState;
  }, [isOnlineMode, onlineGame.gameState, localGame.gameState]);

  const currentPrompt = useMemo(() => {
    return isOnlineMode ? onlineGame.currentPrompt : localGame.currentPrompt;
  }, [isOnlineMode, onlineGame.currentPrompt, localGame.currentPrompt]);

  const currentPlayer = useMemo(() => {
    return isOnlineMode ? onlineGame.currentPlayer : localGame.currentPlayer;
  }, [isOnlineMode, onlineGame.currentPlayer, localGame.currentPlayer]);

  const nextPromptAction = useCallback(() => {
    if (isOnlineMode) {
      onlineGame.nextPrompt();
    } else {
      localGame.nextPrompt();
    }
  }, [isOnlineMode, onlineGame, localGame]);

  const handleEndGameRoute = useCallback(() => {
    setLocation(isOnlineMode ? `/games/${roomId}/summary` : `/games/${slug}/summary`);
  }, [setLocation, slug, isOnlineMode, roomId]);


  // Redirect if no game state
  useEffect(() => {
    if (!currentGameState) {
      console.log("No game state found", {
        isOnlineMode,
        hasLocalState: !!localGame.gameState,
        hasOnlineState: !!onlineGame.gameState,
        localPrompts: localGame.gameState?.prompts?.length,
        onlinePrompts: onlineGame.gameState?.prompts?.length
      });
      // Give a small delay to allow state to propagate
      const timer = setTimeout(() => {
        const checkState = isOnlineMode ? onlineGame.gameState : localGame.gameState;
        if (!checkState) {
          console.log("Redirecting to home - no game state after timeout");
          toast({
            title: "No Active Game",
            description: "Please start a new game",
            variant: "destructive",
          });
          setLocation("/");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentGameState, setLocation, isOnlineMode, localGame.gameState, onlineGame.gameState, toast]);

  // Early return with loading state - must be before accessing properties
  if (!currentGameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-neon-magenta/30 border-t-neon-magenta mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h1 className="text-2xl font-display font-bold mb-2">Loading Game...</h1>
        </div>
      </div>
    );
  }

  // Now safe to access properties
  const currentRound = currentGameState?.round || 1;
  const currentHeatLevel = currentGameState?.heatLevel || 0;
  const currentPrompts = currentGameState?.prompts || [];
  const currentPlayerIndex = currentGameState?.turnIndex || 0;
  const promptsRemaining = (currentGameState?.prompts?.length || 0) - (currentGameState?.currentPromptIndex || 0) - 1;

  // Actions that differ between modes
  const skipPromptAction = isOnlineMode ? onlineGame.skipPrompt : localGame.skipPrompt;
  const updateHeatLevelAction = isOnlineMode ? onlineGame.updateHeatLevel : localGame.updateHeatLevel;
  const advanceTurnAction = isOnlineMode ? onlineGame.advanceTurn : localGame.advanceTurn;
  const endGameAction = isOnlineMode ? onlineGame.endGame : localGame.endGame;
  const resetGameAction = isOnlineMode ? onlineGame.resetGame : localGame.resetGame;
  const previousPromptAction = isOnlineMode ? onlineGame.previousPrompt : localGame.previousPrompt;


  const [currentPromptState, setCurrentPromptState] = useState<Prompt | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const prompt = currentGameState.prompts[currentGameState.currentPromptIndex];
    if (prompt) {
      setCurrentPromptState(prompt);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      setIsCardFlipped(false);
    };
  }, [currentGameState?.currentPromptIndex, currentGameState.prompts]);

  const handleNext = useCallback(() => {
    setIsCardFlipped(false);
    setTimeout(() => {
      const prompt = nextPromptAction();
      if (prompt) {
        setCurrentPromptState(prompt);
        advanceTurnAction();
        // Increase heat based on intensity
        updateHeatLevelAction(prompt.intensity * 2);
      } else {
        // No more prompts, go to summary
        setLocation(isOnlineMode ? `/games/${roomId}/summary` : `/games/${slug}/summary`);
      }
    }, 200);
  }, [nextPromptAction, advanceTurnAction, updateHeatLevelAction, setLocation, slug, isOnlineMode, roomId]);

  const handlePrevious = useCallback(() => {
    setIsCardFlipped(false);
    setTimeout(() => {
      const prompt = previousPromptAction();
      if (prompt) {
        setCurrentPromptState(prompt);
      }
    }, 200);
  }, [previousPromptAction]);

  const handleSkip = useCallback(() => {
    setIsCardFlipped(false);
    setTimeout(() => {
      skipPromptAction();
      const prompt = currentPrompts?.[currentGameState?.currentPromptIndex + 1];
      if (prompt) {
        setCurrentPromptState(prompt);
        advanceTurnAction();
      } else {
        setLocation(isOnlineMode ? `/games/${roomId}/summary` : `/games/${slug}/summary`);
      }
    }, 200);
  }, [skipPromptAction, currentGameState, advanceTurnAction, setLocation, slug, isOnlineMode, roomId, currentPrompts]);

  const handleEndGame = useCallback(() => {
    endGameAction();
    resetGameAction();
    setLocation("/");
  }, [endGameAction, resetGameAction, setLocation]);

  if (isOnlineMode && !onlineGame.gameState) {
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

  if (!currentGameState || !currentPromptState || !currentPlayer) {
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

  const activePlayer = currentPlayer;


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
                  onClick={handleEndGameRoute}
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

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Round</span>
              <span className="font-semibold">{currentRound}</span>
              <span className="text-muted-foreground mx-1">•</span>
              <span className="text-muted-foreground">{promptsRemaining} left</span>
            </div>

            <HeatMeter value={currentHeatLevel} showLabel={false} size="sm" className="w-24" />
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
              nickname={activePlayer.nickname}
              color={activePlayer.avatarColor}
              isCurrentTurn
              size="lg"
            />
            <span className="text-xl font-display font-semibold gradient-text">
              {activePlayer.nickname}
            </span>
          </div>
        </FadeIn>

        {/* Prompt card */}
        <div className="flex-1 flex items-center justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPromptState.id}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-sm"
            >
              <PromptCard
                text={currentPromptState.text}
                type={currentPromptState.type}
                intensity={currentPromptState.intensity}
                isFlipped={isCardFlipped}
                onFlip={() => setIsCardFlipped(!isCardFlipped)}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Players bar */}
        <div className="flex justify-center gap-2 mb-6 overflow-x-auto py-2">
          {useMemo(() => currentGameState.players.map((player, index) => (
            <PlayerAvatar
              key={player.nickname}
              nickname={player.nickname}
              color={player.avatarColor}
              isCurrentTurn={index === currentPlayerIndex}
              size="sm"
            />
          )), [currentGameState.players, currentPlayerIndex])}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <VelvetButton
            velvetVariant="ghost-glow"
            size="icon"
            onClick={handlePrevious}
            disabled={currentGameState.currentPromptIndex === 0}
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