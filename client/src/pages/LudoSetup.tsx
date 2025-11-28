import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X, Users, Play, Dice5, Gamepad2, Heart } from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { VelvetInput } from "@/components/velvet/VelvetInput";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { FadeIn, SlideIn } from "@/components/velvet/PageTransition";
import { createLudoGameSession } from "@/lib/ludoState";
import { useToast } from "@/hooks/use-toast";

interface PlayerInput {
  id: string;
  nickname: string;
  avatarColor: string;
}

const LUDO_COLORS = ["#FF4444", "#4488FF", "#44CC44", "#FFCC44"];

export default function LudoSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [gameMode, setGameMode] = useState<"couple" | "friends">("couple");
  const [players, setPlayers] = useState<PlayerInput[]>([
    { id: "1", nickname: "", avatarColor: LUDO_COLORS[0] },
    { id: "2", nickname: "", avatarColor: LUDO_COLORS[1] },
  ]);

  const addPlayer = () => {
    if (players.length >= 4) return;
    setPlayers([
      ...players,
      { 
        id: Date.now().toString(), 
        nickname: "", 
        avatarColor: LUDO_COLORS[players.length] 
      },
    ]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= 2) return;
    const filtered = players.filter((p) => p.id !== id);
    setPlayers(filtered.map((p, idx) => ({
      ...p,
      avatarColor: LUDO_COLORS[idx],
    })));
  };

  const updatePlayer = (id: string, nickname: string) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, nickname } : p)));
  };

  const isValid = players.every((p) => p.nickname.trim().length > 0) && 
                  players.length >= 2;

  const startGame = async () => {
    if (!isValid) return;

    const validPlayers = players.map((p) => ({
      nickname: p.nickname.trim(),
      avatarColor: p.avatarColor,
    }));

    try {
      const sessionId = await createLudoGameSession(validPlayers, gameMode);
      setLocation(`/games/velvet-ludo/play/${sessionId}`);
    } catch (error) {
      console.error("Failed to start Ludo game:", error);
      toast({
        title: "Error",
        description: "Failed to start Ludo game. Please try again.",
        variant: "destructive",
      });
    }
  };

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

      <header className="glass border-b border-plum-deep/30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/games/velvet-ludo">
            <button 
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
              data-testid="button-back-ludo-setup"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Velvet Ludo</span>
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <FadeIn className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Dice5 className="w-8 h-8 text-neon-magenta" />
            <h1 className="text-3xl font-display font-bold gradient-text">
              Velvet Ludo
            </h1>
          </div>
          <p className="text-muted-foreground">
            Choose your game mode and add players
          </p>
        </FadeIn>

        <VelvetCard className="p-6 mb-6">
          <h2 className="text-xl font-display font-semibold mb-4 text-center flex items-center justify-center gap-2">
            <Gamepad2 className="w-5 h-5 text-neon-magenta" /> Game Mode
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <VelvetButton
              velvetVariant={gameMode === "couple" ? "neon" : "ghost-glow"}
              onClick={() => setGameMode("couple")}
              className="py-6 flex flex-col items-center gap-2"
            >
              <Heart className="w-8 h-8 text-velvet-red" />
              <span className="font-semibold">Couple Mode</span>
              <span className="text-xs text-muted-foreground">
                Romantic challenges
              </span>
            </VelvetButton>
            <VelvetButton
              velvetVariant={gameMode === "friends" ? "neon" : "ghost-glow"}
              onClick={() => setGameMode("friends")}
              className="py-6 flex flex-col items-center gap-2"
            >
              <Users className="w-8 h-8 text-blue-400" />
              <span className="font-semibold">Friends Mode</span>
              <span className="text-xs text-muted-foreground">
                Fun challenges
              </span>
            </VelvetButton>
          </div>
        </VelvetCard>

        <SlideIn direction="up" delay={0.1} className="mb-8">
          <VelvetCard tiltEnabled={false} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-magenta" />
                Players ({players.length}/4)
              </h2>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      {player.nickname ? player.nickname[0].toUpperCase() : `P${index + 1}`}
                    </div>
                    
                    <VelvetInput
                      placeholder={`Player ${index + 1} (${["Red", "Blue", "Green", "Yellow"][index]})`}
                      value={player.nickname}
                      onChange={(e) => updatePlayer(player.id, e.target.value)}
                      maxLength={15}
                      className="flex-1"
                      data-testid={`input-ludo-player-${index}`}
                    />

                    {players.length > 2 && (
                      <motion.button
                        onClick={() => removePlayer(player.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        data-testid={`button-remove-ludo-player-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {players.length < 4 && (
              <motion.button
                onClick={addPlayer}
                className="w-full mt-4 p-3 rounded-lg border border-dashed border-plum-deep/50 
                         text-muted-foreground hover:text-white hover:border-neon-magenta/50
                         transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                data-testid="button-add-ludo-player"
              >
                <Plus className="w-4 h-4" />
                Add Player
              </motion.button>
            )}
          </VelvetCard>
        </SlideIn>

        <SlideIn direction="up" delay={0.2} className="mb-8">
          <VelvetCard tiltEnabled={false} className="p-6">
            <h2 className="text-lg font-display font-semibold mb-4">
              How to Play
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-neon-magenta">1.</span>
                Roll the dice on your turn
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-magenta">2.</span>
                Roll a 6 to move a piece out of home
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-magenta">3.</span>
                Move your pieces around the board
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-magenta">4.</span>
                Land on Velvet spaces for romantic challenges
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-magenta">5.</span>
                First to get all pieces home wins!
              </li>
            </ul>
          </VelvetCard>
        </SlideIn>

        <SlideIn direction="up" delay={0.3}>
          <VelvetButton
            velvetVariant="velvet"
            className="w-full py-6 text-lg"
            onClick={startGame}
            disabled={!isValid}
            data-testid="button-start-ludo"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </VelvetButton>

          {!isValid && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Enter nicknames for all players to start
            </p>
          )}
        </SlideIn>
      </main>
    </div>
  );
}
