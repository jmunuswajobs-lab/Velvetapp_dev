import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Sparkles, Home, Flame, Heart, Snowflake, Zap } from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { VelvetCard, PromptCard } from "@/components/velvet/VelvetCard";
import { LudoBoard } from "@/components/velvet/LudoBoard";
import { FadeIn } from "@/components/velvet/PageTransition";
import { useLudoStore } from "@/lib/ludoState";

export default function LudoGameplay() {
  const [, setLocation] = useLocation();
  
  const { 
    gameState, 
    rollDice, 
    selectMove,
    dismissSpecialEffect,
    endGame 
  } = useLudoStore();

  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    if (gameState?.winnerId) {
      setShowWinner(true);
    }
  }, [gameState?.winnerId]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-2">No Game Active</h1>
          <p className="text-muted-foreground mb-6">Start a new game to play.</p>
          <Link href="/games/velvet-ludo">
            <VelvetButton velvetVariant="neon" data-testid="button-go-to-ludo">
              Go to Velvet Ludo
            </VelvetButton>
          </Link>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const winnerPlayer = gameState.winnerId 
    ? gameState.players.find(p => p.id === gameState.winnerId)
    : null;

  const handleEndGame = () => {
    endGame();
    setLocation("/games/velvet-ludo");
  };

  const handleMovePiece = (tokenId: string) => {
    const validMovesForToken = gameState.validMoves.filter(m => m.tokenId === tokenId);
    if (validMovesForToken.length > 0) {
      const moveIndex = gameState.validMoves.indexOf(validMovesForToken[0]);
      selectMove(tokenId, moveIndex);
    }
  };

  const getTileIcon = (type: string) => {
    switch (type) {
      case "heat": return <Flame className="w-8 h-8 text-red-500" />;
      case "bond": return <Heart className="w-8 h-8 text-purple-500" />;
      case "freeze": return <Snowflake className="w-8 h-8 text-blue-400" />;
      case "wild": return <Zap className="w-8 h-8 text-yellow-500" />;
      default: return <Sparkles className="w-8 h-8 text-pink-500" />;
    }
  };

  const getTileDescription = (type: string) => {
    switch (type) {
      case "heat": return "Spicy challenge ahead!";
      case "bond": return "Work together on this one";
      case "freeze": return "You're frozen! Partner can save you next turn";
      case "wild": return "Random surprise effect!";
      default: return "Special romantic moment";
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(255, 0, 138, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(176, 15, 47, 0.25) 0%, transparent 50%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={15} />

      {/* Header */}
      <header className="glass border-b border-plum-deep/30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/games/velvet-ludo">
              <button 
                className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit Game</span>
              </button>
            </Link>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Velvet Ludo</p>
              <p className="font-display font-semibold">Round {gameState.turnNumber + 1}</p>
            </div>

            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <FadeIn>
          <LudoBoard
            gameState={gameState}
            onRollDice={rollDice}
            onMovePiece={handleMovePiece}
          />
        </FadeIn>
      </main>

      {/* Special Effect Modal (Heat/Bond/Freeze prompts) */}
      <AnimatePresence>
        {gameState.specialEffect && gameState.specialEffect.prompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-md"
            >
              <VelvetCard tiltEnabled={false} className="p-8">
                <div className="text-center mb-6">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #FF008A 0%, #B00F2F 100%)",
                      boxShadow: "0 0 30px rgba(255, 0, 138, 0.5)",
                    }}
                    animate={{
                      boxShadow: [
                        "0 0 30px rgba(255, 0, 138, 0.5)",
                        "0 0 50px rgba(255, 0, 138, 0.8)",
                        "0 0 30px rgba(255, 0, 138, 0.5)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {getTileIcon(gameState.specialEffect.type)}
                  </motion.div>

                  <h2 className="text-2xl font-display font-bold gradient-text mb-2">
                    Special Tile!
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {getTileDescription(gameState.specialEffect.type)}
                  </p>
                </div>

                <div className="mb-6">
                  <PromptCard
                    text={gameState.specialEffect.prompt.text}
                    type={gameState.specialEffect.prompt.type as "truth" | "dare"}
                    intensity={gameState.specialEffect.prompt.intensity}
                  />
                </div>

                <VelvetButton
                  velvetVariant="neon"
                  className="w-full"
                  onClick={dismissSpecialEffect}
                  data-testid="button-complete-prompt"
                >
                  Continue
                </VelvetButton>
              </VelvetCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner Modal */}
      <AnimatePresence>
        {showWinner && winnerPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-full max-w-md"
            >
              <VelvetCard tiltEnabled={false} className="p-8 text-center">
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    boxShadow: "0 0 60px rgba(255, 215, 0, 0.8)",
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity },
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  }}
                >
                  <Trophy className="w-12 h-12 text-white" />
                </motion.div>

                <h1 className="text-4xl font-display font-bold gradient-text mb-4">
                  Victory!
                </h1>

                <p className="text-2xl font-semibold mb-2">{winnerPlayer.nickname}</p>
                <p className="text-muted-foreground mb-8">
                  Congratulations on winning Velvet Ludo!
                </p>

                <div className="flex gap-3">
                  <VelvetButton
                    velvetVariant="ghost-glow"
                    className="flex-1"
                    onClick={() => setLocation("/games/velvet-ludo/local")}
                    data-testid="button-play-again"
                  >
                    Play Again
                  </VelvetButton>
                  <VelvetButton
                    velvetVariant="neon"
                    className="flex-1"
                    onClick={handleEndGame}
                    data-testid="button-end-game"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Exit
                  </VelvetButton>
                </div>
              </VelvetCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
