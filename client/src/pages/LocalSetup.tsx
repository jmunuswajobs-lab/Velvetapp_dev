import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X, Users, Play, Shuffle } from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { VelvetInput } from "@/components/velvet/VelvetInput";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { IntensitySlider } from "@/components/velvet/IntensitySlider";
import { PlayerAvatar } from "@/components/velvet/PlayerAvatar";
import { FadeIn, SlideIn } from "@/components/velvet/PageTransition";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocalGame, getRandomAvatarColor } from "@/lib/gameState";
import type { Game, Prompt, RoomSettings } from "@shared/schema";

interface PlayerInput {
  id: string;
  nickname: string;
  avatarColor: string;
}

export default function LocalSetup() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { initGame } = useLocalGame();

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

  const { data: game, isLoading: gameLoading, error: gameError } = useQuery<Game>({
    queryKey: [`/api/games/${slug}`],
    enabled: !!slug,
  });

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
    enabled: !!game?.id,
    staleTime: 5000, // Cache for 5 seconds
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

  const isValid = players.every((p) => p.nickname.trim().length > 0) &&
                  players.length >= 2 &&
                  prompts && prompts.length > 0 &&
                  !promptsLoading;

  const startGame = () => {
    if (!isValid || !game || !prompts || prompts.length === 0) {
      console.error("Cannot start game - missing data:", { game: !!game, prompts: prompts?.length });
      return;
    }

    const validPlayers = players.map((p) => ({
      nickname: p.nickname.trim(),
      avatarColor: p.avatarColor,
    }));

    console.log("Initializing game with:", { gameId: game.id, players: validPlayers.length, prompts: prompts.length });
    
    initGame(game.id, validPlayers, settings, prompts);

    // Use setTimeout to ensure state is updated before navigation
    setTimeout(() => {
      console.log("Navigating to gameplay");
      setLocation(`/games/${slug}/play`);
    }, 100);
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

  // Handle prompts loading error
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
      {/* Background */}
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

      {/* Header */}
      <header className="glass border-b border-plum-deep/30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href={`/games/${slug}`}>
            <button
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {game?.name}</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <FadeIn className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            Local Game Setup
          </h1>
          <p className="text-muted-foreground">
            Add players and customize your experience
          </p>
        </FadeIn>

        {/* Players section */}
        <SlideIn direction="up" delay={0.1} className="mb-8">
          <VelvetCard tiltEnabled={false} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-magenta" />
                Players ({players.length}/10)
              </h2>
              <VelvetButton
                velvetVariant="ghost-glow"
                size="sm"
                onClick={shufflePlayers}
                data-testid="button-shuffle-players"
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
                      placeholder={`Player ${index + 1} nickname`}
                      value={player.nickname}
                      onChange={(e) => updatePlayer(player.id, e.target.value)}
                      maxLength={20}
                      className="flex-1"
                      data-testid={`input-player-${index}`}
                    />

                    {players.length > 2 && (
                      <motion.button
                        onClick={() => removePlayer(player.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        data-testid={`button-remove-player-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {players.length < 10 && (
              <motion.button
                onClick={addPlayer}
                className="w-full mt-4 p-3 rounded-lg border border-dashed border-plum-deep/50
                         text-muted-foreground hover:text-white hover:border-neon-magenta/50
                         transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                data-testid="button-add-player"
              >
                <Plus className="w-4 h-4" />
                Add Player
              </motion.button>
            )}
          </VelvetCard>
        </SlideIn>

        {/* Settings section */}
        <SlideIn direction="up" delay={0.2} className="mb-8">
          <VelvetCard tiltEnabled={false} className="p-6">
            <h2 className="text-lg font-display font-semibold mb-4">
              Game Settings
            </h2>

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
                    data-testid="switch-couple-mode"
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
                    data-testid="switch-movement"
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
                    data-testid="switch-nsfw"
                  />
                </div>
              </div>
            </div>
          </VelvetCard>
        </SlideIn>

        {/* Start button */}
        <SlideIn direction="up" delay={0.3}>
          <VelvetButton
            velvetVariant="velvet"
            className="w-full py-6 text-lg"
            onClick={startGame}
            disabled={!isValid}
            data-testid="button-start-game"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Game ({prompts?.length || 0} prompts)
          </VelvetButton>

          {!isValid && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              {players.some((p) => !p.nickname.trim())
                ? "Enter nicknames for all players"
                : promptsLoading
                ? "Loading prompts..."
                : !prompts || prompts.length === 0
                ? "No prompts available for this game"
                : "Start a new game to begin playing"}
            </p>
          )}
        </SlideIn>
      </main>
    </div>
  );
}