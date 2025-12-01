import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X, Users, Play, Shuffle, Gamepad2, Zap } from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { VelvetInput } from "@/components/velvet/VelvetInput";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { IntensitySlider } from "@/components/velvet/IntensitySlider";
import { PlayerAvatar } from "@/components/velvet/PlayerAvatar";
import { FadeIn, SlideIn } from "@/components/velvet/PageTransition";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getRandomAvatarColor, createLocalGameSession } from "@/lib/gameState";
import type { Game, Prompt, RoomSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface PlayerInput {
  id: string;
  nickname: string;
  avatarColor: string;
}

export default function LocalSetup() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [players, setPlayers] = useState<PlayerInput[]>([
    { id: "1", nickname: "", avatarColor: getRandomAvatarColor() },
    { id: "2", nickname: "", avatarColor: getRandomAvatarColor() },
  ]);
  const [settings, setSettings] = useState<RoomSettings>({
    intensity: 3,
    allowNSFW: false,
    allowMovement: true,
    coupleMode: false,
    packs: [],
  });
  const [difficulty, setDifficulty] = useState<number>(3); // For arcade games

  const { data: game, isLoading: gameLoading, error: gameError } = useQuery<Game>({
    queryKey: [`/api/games/${slug}`],
    enabled: !!slug,
  });

  // Only fetch prompts for prompt-based games
  const needsPrompts = game && (game.engineType === "prompt-party" || game.engineType === "prompt-couple");
  
  const { data: prompts, isLoading: promptsLoading, error: promptsError } = useQuery<Prompt[]>({
    queryKey: [`/api/prompts`, { gameId: game?.id, intensity: settings.intensity }],
    queryFn: async () => {
      if (!game?.id) throw new Error("No game ID");
      const response = await fetch(`/api/prompts?gameId=${game.id}&intensity=${settings.intensity}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Prompts fetch error:", errorText);
        throw new Error(`Failed to fetch prompts: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Fetched prompts:", data.length);
      return data;
    },
    enabled: !!game?.id && needsPrompts,
    staleTime: 5000,
    retry: 2,
  });

  const addPlayer = () => {
    if (players.length >= 10) return;
    setPlayers([
      ...players,
      {
        id: Date.now().toString(),
        nickname: "",
        avatarColor: getRandomAvatarColor()
      },
    ]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((p) => p.id !== id));
  };

  const updatePlayer = (id: string, nickname: string) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, nickname } : p)));
  };

  const shufflePlayers = () => {
    setPlayers([...players].sort(() => Math.random() - 0.5));
  };

  // Validation based on game type
  const isPromptGame = game && (game.engineType === "prompt-party" || game.engineType === "prompt-couple");
  const isArcadeGame = game && ["pong", "racer", "tap-duel", "rhythm"].includes(game.engineType);
  const isBoardGame = game && ["board-ludo", "memory-match", "guessing", "roulette", "tool-randomizer"].includes(game.engineType);

  const isValid = players.every((p) => p.nickname.trim().length > 0) &&
                  players.length >= game?.minPlayers &&
                  (needsPrompts ? (prompts && prompts.length > 0 && !promptsLoading) : !promptsLoading);

  const startGame = () => {
    if (!isValid || !game) {
      toast({
        title: "Cannot Start Game",
        description: "Missing game data. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (needsPrompts && (!prompts || prompts.length === 0)) {
      toast({
        title: "Cannot Start Game",
        description: "No prompts available for this game. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const validPlayers = players.map((p) => ({
      nickname: p.nickname.trim(),
      avatarColor: p.avatarColor,
    }));

    try {
      const sessionId = createLocalGameSession(game.id, validPlayers, settings, prompts || [], game.engineType);
      setLocation(`/games/${slug}/play/${sessionId}`);
    } catch (error) {
      console.error("Failed to create game session:", error);
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (gameLoading || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-neon-magenta/30 border-t-neon-magenta"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (gameError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Game Not Found</h1>
          <p className="text-muted-foreground mb-6">The game you're looking for doesn't exist.</p>
          <Link href="/">
            <VelvetButton velvetVariant="neon">Go Home</VelvetButton>
          </Link>
        </div>
      </div>
    );
  }

  if (promptsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Error Loading Prompts</h1>
          <p className="text-muted-foreground mb-6">
            Could not load prompts for this game. Please try again later.
          </p>
          <VelvetButton
            velvetVariant="neon"
            onClick={() => window.location.reload()}
          >
            Retry
          </VelvetButton>
        </div>
      </div>
    );
  }

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
          <Link href={`/games/${slug}`}>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {game?.name}</span>
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <FadeIn className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            {isArcadeGame ? "Quick Play" : isPromptGame ? "Game Setup" : "Board Game Setup"}
          </h1>
          <p className="text-muted-foreground">
            {isArcadeGame ? "Pick players and get ready to compete" : isPromptGame ? "Add players and customize your experience" : "Set up your game"}
          </p>
        </FadeIn>

        {/* Players section - ALWAYS shown */}
        <SlideIn direction="up" delay={0.1} className="mb-8">
          <VelvetCard tiltEnabled={false} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-magenta" />
                Players ({players.length}/{game?.maxPlayers || 10})
              </h2>
              <VelvetButton
                velvetVariant="ghost-glow"
                size="sm"
                onClick={shufflePlayers}
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Shuffle
              </VelvetButton>
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
                    <PlayerAvatar
                      nickname={player.nickname || `P${index + 1}`}
                      color={player.avatarColor}
                      size="sm"
                    />

                    <VelvetInput
                      placeholder={`Player ${index + 1}`}
                      value={player.nickname}
                      onChange={(e) => updatePlayer(player.id, e.target.value)}
                      maxLength={20}
                      className="flex-1"
                    />

                    {players.length > 2 && (
                      <motion.button
                        onClick={() => removePlayer(player.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {players.length < (game?.maxPlayers || 10) && (
              <motion.button
                onClick={addPlayer}
                className="w-full mt-4 p-3 rounded-lg border border-dashed border-plum-deep/50
                         text-muted-foreground hover:text-white hover:border-neon-magenta/50
                         transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Plus className="w-4 h-4" />
                Add Player
              </motion.button>
            )}
          </VelvetCard>
        </SlideIn>

        {/* ARCADE GAME SETUP - Simple difficulty slider */}
        {isArcadeGame && (
          <SlideIn direction="up" delay={0.2} className="mb-8">
            <VelvetCard tiltEnabled={false} className="p-6">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-neon-magenta" />
                Game Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Difficulty</Label>
                    <span className="text-neon-magenta font-semibold">{["Easy", "Medium", "Hard", "Extreme"][difficulty - 1]}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={difficulty}
                    onChange={(e) => setDifficulty(parseInt(e.target.value))}
                    className="w-full h-2 bg-plum-deep/30 rounded-lg appearance-none cursor-pointer accent-neon-magenta"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Easy</span>
                    <span>Extreme</span>
                  </div>
                </div>
              </div>
            </VelvetCard>
          </SlideIn>
        )}

        {/* BOARD GAME SETUP - Basic settings */}
        {isBoardGame && (
          <SlideIn direction="up" delay={0.2} className="mb-8">
            <VelvetCard tiltEnabled={false} className="p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Game Settings</h2>
              <p className="text-sm text-muted-foreground">Board games are ready to play. No additional settings needed!</p>
            </VelvetCard>
          </SlideIn>
        )}

        {/* PROMPT GAME SETUP - Full customization */}
        {isPromptGame && (
          <SlideIn direction="up" delay={0.2} className="mb-8">
            <VelvetCard tiltEnabled={false} className="p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Game Settings</h2>

              <div className="space-y-6">
                <IntensitySlider
                  value={settings.intensity}
                  onChange={(v) => setSettings({ ...settings, intensity: v })}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="couple-mode" className="text-sm font-medium">
                        Couple Mode
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Prompts designed for two people
                      </p>
                    </div>
                    <Switch
                      id="couple-mode"
                      checked={settings.coupleMode}
                      onCheckedChange={(v) => setSettings({ ...settings, coupleMode: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-movement" className="text-sm font-medium">
                        Allow Movement
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Include dares that require moving around
                      </p>
                    </div>
                    <Switch
                      id="allow-movement"
                      checked={settings.allowMovement}
                      onCheckedChange={(v) => setSettings({ ...settings, allowMovement: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-nsfw" className="text-sm font-medium text-heat-pink">
                        Extra Spicy Mode
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        More daring prompts (still PG-17)
                      </p>
                    </div>
                    <Switch
                      id="allow-nsfw"
                      checked={settings.allowNSFW}
                      onCheckedChange={(v) => setSettings({ ...settings, allowNSFW: v })}
                    />
                  </div>
                </div>
              </div>
            </VelvetCard>
          </SlideIn>
        )}

        {/* Start button */}
        <SlideIn direction="up" delay={0.3}>
          <VelvetButton
            velvetVariant="velvet"
            className="w-full py-6 text-lg"
            onClick={startGame}
            disabled={!isValid}
          >
            <Play className="w-5 h-5 mr-2" />
            {isArcadeGame ? "Start Competition" : isPromptGame ? `Start Game (${prompts?.length || 0} prompts)` : "Start Game"}
          </VelvetButton>

          {!isValid && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              {players.some((p) => !p.nickname.trim())
                ? "Enter nicknames for all players"
                : promptsLoading
                ? "Loading prompts..."
                : !prompts || prompts.length === 0
                ? "No prompts available for this game"
                : "Ready to play!"}
            </p>
          )}
        </SlideIn>
      </main>
    </div>
  );
}
