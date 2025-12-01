import { useEffect, useMemo } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, SkipForward, X, 
  Home, ArrowRight, Flame
} from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { PromptCard } from "@/components/velvet/VelvetCard";
import { HeatMeter } from "@/components/velvet/HeatMeter";
import { PlayerAvatar } from "@/components/velvet/PlayerAvatar";
import { FadeIn } from "@/components/velvet/PageTransition";
import { useLocalGameSession, useOnlineRoom } from "@/lib/gameState";
import { useToast } from "@/hooks/use-toast";

export default function Gameplay() {
  const { slug, sessionId } = useParams<{ slug: string; sessionId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const gameSession = useLocalGameSession(sessionId || "");
  const onlineRoom = useOnlineRoom();
  
  // Determine if this is a local or online game
  const isOnlineGame = onlineRoom.gameState && !gameSession;
  const gameState = gameSession?.session || onlineRoom.gameState;

  // Redirect if session not found
  useEffect(() => {
    if (!sessionId && !onlineRoom.gameState) {
      toast({
        title: "No Active Game",
        description: "Start a new game to begin playing",
        variant: "destructive",
      });
      setLocation(`/games/${slug}`);
    }
  }, [sessionId, onlineRoom.gameState, setLocation, slug, toast]);

  // Show loading state
  if (!gameState || (isOnlineGame && onlineRoom.isConnecting)) {
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

  // Show error state
  if (onlineRoom.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Flame className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Error Loading Game</h1>
          <p className="text-muted-foreground mb-6">{onlineRoom.error}</p>
          <Link href={`/games/${slug}`}>
            <VelvetButton velvetVariant="neon">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game
            </VelvetButton>
          </Link>
        </div>
      </div>
    );
  }

  // Validate required data
  if (!gameState.prompts || gameState.prompts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Flame className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">No Prompts Available</h1>
          <p className="text-muted-foreground mb-6">This game has no prompts loaded.</p>
          <Link href={`/games/${slug}`}>
            <VelvetButton velvetVariant="neon">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game
            </VelvetButton>
          </Link>
        </div>
      </div>
    );
  }

  if (!gameState.players || gameState.players.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Flame className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">No Players Found</h1>
          <p className="text-muted-foreground mb-6">The game session has no players.</p>
          <Link href={`/games/${slug}`}>
            <VelvetButton velvetVariant="neon">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game
            </VelvetButton>
          </Link>
        </div>
      </div>
    );
  }

  const currentPrompt = gameState.prompts[gameState.currentPromptIndex];
  const currentPlayer = gameState.players[gameState.turnIndex];
  const promptsRemaining = gameState.prompts.length - gameState.currentPromptIndex - 1;

  const handleNext = () => {
    if (isOnlineGame) {
      // Online games handled via WebSocket - just move to next
      if (gameState.currentPromptIndex >= gameState.prompts.length - 1) {
        setLocation(`/games/${slug}/summary/${sessionId}`);
        return;
      }
      // Send move to server
      console.log("Move to next prompt in online game");
    } else {
      // Local game
      const prompt = gameSession?.nextPrompt();
      if (!prompt) {
        setLocation(`/games/${slug}/summary/${sessionId}`);
        return;
      }
      gameSession?.advanceTurn();
      gameSession?.updateHeatLevel((prompt.intensity || 0) * 2);
    }
  };

  const handlePrevious = () => {
    if (!isOnlineGame) {
      gameSession?.previousPrompt();
    }
  };

  const handleSkip = () => {
    if (!isOnlineGame) {
      gameSession?.skipPrompt();
    }
    handleNext();
  };

  const handleEndGame = () => {
    setLocation(`/games/${slug}/summary/${sessionId}`);
  };

  return (
    <div className="min-h-screen relative flex flex-col">
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

      <header className="glass border-b border-plum-deep/30 shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleEndGame}
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">Round {gameState.round}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{promptsRemaining} left</span>
            </div>

            <HeatMeter value={gameState.heatLevel} showLabel={false} size="sm" className="w-24" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">
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

        <div className="flex-1 flex items-center justify-center py-4">
          <motion.div
            key={currentPrompt.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <PromptCard
              text={currentPrompt.text}
              type={currentPrompt.type}
              intensity={currentPrompt.intensity}
            />
          </motion.div>
        </div>

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

        <div className="flex items-center justify-center gap-3">
          <VelvetButton
            velvetVariant="ghost-glow"
            size="icon"
            onClick={handlePrevious}
            disabled={gameState.currentPromptIndex === 0}
          >
            <ArrowLeft className="w-5 h-5" />
          </VelvetButton>

          <VelvetButton
            velvetVariant="ghost-glow"
            onClick={handleSkip}
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip
          </VelvetButton>

          <VelvetButton
            velvetVariant="neon"
            className="px-8"
            onClick={handleNext}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </VelvetButton>
        </div>
      </main>
    </div>
  );
}