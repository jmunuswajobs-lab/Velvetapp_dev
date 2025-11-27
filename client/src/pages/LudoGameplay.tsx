import { useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Sparkles } from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { LudoBoard } from "@/components/velvet/LudoBoard";
import { FadeIn } from "@/components/velvet/PageTransition";
import { useLudoStore } from "@/lib/ludoState";

export default function LudoGameplay() {
  const { mode } = useParams<{ mode: string }>();
  const [, setLocation] = useLocation();
  
  const { 
    gameState, 
    rollDice, 
    movePiece, 
    completePrompt, 
    endGame 
  } = useLudoStore();

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

  const currentPlayer = gameState.players[gameState.currentTurn];

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(59, 15, 92, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(176, 15, 47, 0.2) 0%, transparent 50%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={10} />

      <header className="glass border-b border-plum-deep/30 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/games/velvet-ludo">
              <button 
                className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                data-testid="button-back-ludo"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit Game</span>
              </button>
            </Link>

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-magenta" />
              <span className="font-display font-semibold gradient-text">
                Velvet Ludo
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              Turn {gameState.turnCount + 1}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <FadeIn>
          <LudoBoard
            gameState={gameState}
            onRollDice={rollDice}
            onMovePiece={movePiece}
          />
        </FadeIn>
      </main>

      <AnimatePresence>
        {gameState.gamePhase === "prompt" && gameState.currentPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <VelvetCard tiltEnabled={false} className="max-w-md p-8 text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #FF008A 0%, #B00F2F 100%)",
                    boxShadow: "0 0 30px rgba(255, 0, 138, 0.5)",
                  }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-xl font-display font-bold gradient-text mb-2">
                  Velvet Space!
                </h2>
                
                <p className="text-muted-foreground text-sm mb-4">
                  {currentPlayer.nickname} landed on a velvet space
                </p>

                <p className="text-lg mb-6">
                  {gameState.currentPrompt.text}
                </p>

                <VelvetButton
                  velvetVariant="neon"
                  onClick={completePrompt}
                  className="w-full"
                  data-testid="button-complete-prompt"
                >
                  Complete Challenge
                </VelvetButton>
              </VelvetCard>
            </motion.div>
          </motion.div>
        )}

        {gameState.gamePhase === "finished" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <VelvetCard tiltEnabled={false} className="max-w-md p-8 text-center">
                <motion.div 
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    boxShadow: "0 0 40px rgba(255, 215, 0, 0.5)",
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 40px rgba(255, 215, 0, 0.5)",
                      "0 0 60px rgba(255, 215, 0, 0.7)",
                      "0 0 40px rgba(255, 215, 0, 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Trophy className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-2xl font-display font-bold gradient-text mb-2">
                  Game Over!
                </h2>
                
                <p className="text-lg mb-6">
                  {gameState.players.find(p => p.id === gameState.winner)?.nickname || "Someone"} wins!
                </p>

                <div className="flex gap-3">
                  <Link href="/games/velvet-ludo" className="flex-1">
                    <VelvetButton
                      velvetVariant="ghost-glow"
                      onClick={endGame}
                      className="w-full"
                      data-testid="button-back-home-ludo"
                    >
                      Back to Menu
                    </VelvetButton>
                  </Link>
                  <VelvetButton
                    velvetVariant="neon"
                    onClick={() => {
                      endGame();
                      setLocation("/games/velvet-ludo/local");
                    }}
                    className="flex-1"
                    data-testid="button-play-again-ludo"
                  >
                    Play Again
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
