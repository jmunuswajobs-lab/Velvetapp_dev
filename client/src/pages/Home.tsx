import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Flame, Users, Heart, Dices, BookOpen, Filter, Search, ChevronRight,
  Zap, Lock, Sparkles, TrendingUp, Volume2, Eye, Target
} from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetLogo } from "@/components/velvet/VelvetLogo";
import { GameCard, GameCardSkeleton } from "@/components/velvet/GameCard";
import { VelvetInput } from "@/components/velvet/VelvetInput";
import { IntensitySlider } from "@/components/velvet/IntensitySlider";
import { HeatMeter } from "@/components/velvet/HeatMeter";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { FadeIn, StaggerChildren, staggerChildVariants } from "@/components/velvet/PageTransition";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Game } from "@shared/schema";

const features = [
  {
    icon: Zap,
    title: "Instant Connect",
    description: "Start playing instantly with friends or your partner—no setup required",
    color: "from-neon-magenta to-ember-red",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "End-to-end encrypted sessions. Your secrets stay private.",
    color: "from-plum-deep to-neon-magenta",
  },
  {
    icon: Volume2,
    title: "Remote Ready",
    description: "Designed for video calls, voice chats, and long-distance romance",
    color: "from-ember-red to-amber-300",
  },
  {
    icon: Eye,
    title: "Smart Filtering",
    description: "Adjust intensity levels and filter content to match your vibe",
    color: "from-amber-300 to-neon-magenta",
  },
  {
    icon: TrendingUp,
    title: "Dynamic Escalation",
    description: "Prompts gradually intensify as the night heats up",
    color: "from-neon-magenta to-plum-deep",
  },
  {
    icon: Target,
    title: "Couple Focused",
    description: "190+ premium couple-only prompts from flirty to spicy",
    color: "from-plum-deep to-ember-red",
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [spiceLevel, setSpiceLevel] = useState(3);
  const [coupleMode, setCoupleMode] = useState(true);
  const [localOnly, setLocalOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const filteredGames = games?.filter((game) => {
    if (searchQuery && !game.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (coupleMode && !game.isCoupleFocused) return false;
    if (localOnly && !game.supportsLocal) return false;
    if (onlineOnly && !game.supportsOnline) return false;
    return true;
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background with multiple layers */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(90, 26, 140, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(176, 15, 47, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 0%, rgba(255, 0, 138, 0.2) 0%, transparent 60%),
            linear-gradient(180deg, #050509 0%, #0A0A12 50%, #0F0515 100%)
          `,
        }}
      />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="fixed w-96 h-96 rounded-full blur-3xl opacity-20 -z-10"
        style={{
          background: "linear-gradient(135deg, #FF008A 0%, #B00F2F 100%)",
          top: "-200px",
          left: "-200px",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="fixed w-96 h-96 rounded-full blur-3xl opacity-20 -z-10"
        style={{
          background: "linear-gradient(135deg, #5A1A8C 0%, #FF008A 100%)",
          bottom: "-200px",
          right: "-200px",
        }}
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      <EmberParticles count={20} />

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-plum-deep/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <VelvetLogo size="md" showText={true} />

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <VelvetInput
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/tools">
                <VelvetButton velvetVariant="ghost-glow" size="icon" data-testid="button-tools">
                  <Dices className="w-5 h-5" />
                </VelvetButton>
              </Link>
              <Link href="/rules">
                <VelvetButton velvetVariant="ghost-glow" size="icon" data-testid="button-rules">
                  <BookOpen className="w-5 h-5" />
                </VelvetButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <FadeIn className="mb-16">
          <div className="relative overflow-hidden rounded-3xl">
            {/* Hero background */}
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: `
                  radial-gradient(ellipse at 50% 0%, rgba(255, 0, 138, 0.3) 0%, transparent 60%),
                  linear-gradient(180deg, rgba(90, 26, 140, 0.2) 0%, rgba(176, 15, 47, 0.1) 100%)
                `,
              }}
            />

            <div className="glass-card rounded-3xl p-8 md:p-16 relative overflow-hidden">
              {/* Animated background grid */}
              <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(0deg, transparent 24%, rgba(255, 0, 138, 0.05) 25%, rgba(255, 0, 138, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 0, 138, 0.05) 75%, rgba(255, 0, 138, 0.05) 76%, transparent 77%, transparent)",
                  backgroundSize: "50px 50px",
                }}
                animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "loop" }}
              />

              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-magenta/10 border border-neon-magenta/30 mb-6">
                    <Sparkles className="w-4 h-4 text-neon-magenta" />
                    <span className="text-sm font-semibold text-neon-magenta">
                      Premium 18+ Experience
                    </span>
                  </div>
                </motion.div>

                <motion.h1
                  className="text-5xl md:text-7xl font-display font-black mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <span className="bg-gradient-to-r from-neon-magenta via-ember-red to-plum-deep bg-clip-text text-transparent">
                    Ignite Your Night
                  </span>
                </motion.h1>

                <motion.p
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Premium party games for couples and friends. 190+ handcrafted prompts, real-time
                  multiplayer, and romance-focused challenges designed to deepen connection and ignite passion.
                </motion.p>

                <motion.div
                  className="flex flex-wrap gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Link href="/games/truth-or-dare/local">
                    <VelvetButton
                      velvetVariant="velvet"
                      size="lg"
                      data-testid="button-quick-play-local"
                      className="text-base"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Play Together
                    </VelvetButton>
                  </Link>
                  <Link href="/games/truth-or-dare/online">
                    <VelvetButton
                      velvetVariant="neon"
                      size="lg"
                      data-testid="button-quick-play-online"
                      className="text-base"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Connect Online
                    </VelvetButton>
                  </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                  className="flex gap-8 text-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div>
                    <div className="font-bold text-2xl text-neon-magenta">190+</div>
                    <div className="text-muted-foreground">Premium Prompts</div>
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-ember-red">8</div>
                    <div className="text-muted-foreground">Curated Packs</div>
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-plum-deep">100%</div>
                    <div className="text-muted-foreground">Couple Focused</div>
                  </div>
                </motion.div>
              </div>

              {/* Animated border */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255, 0, 138, 0.3), transparent)",
                  backgroundSize: "200% 100%",
                }}
                animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
              />
            </div>
          </div>
        </FadeIn>

        {/* Features Grid */}
        <FadeIn delay={0.2} className="mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">
            Why Choose <span className="gradient-text">VelvetPlay?</span>
          </h2>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={staggerChildVariants}
                  className="group relative"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    style={{
                      background: `linear-gradient(135deg, var(--gradient-start), var(--gradient-end))`,
                      "--gradient-start": feature.color.split(" to ")[0],
                      "--gradient-end": feature.color.split(" to ")[1],
                    } as any}
                  />

                  <div className="glass-card rounded-2xl p-6 h-full relative overflow-hidden">
                    <motion.div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>

                    <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                      style={{
                        background: "radial-gradient(circle at 50% 0%, rgba(255, 0, 138, 0.1), transparent)",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>
        </FadeIn>

        {/* Game Catalog Section */}
        <FadeIn delay={0.4} className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
                Game <span className="gradient-text">Catalog</span>
              </h2>
              <p className="text-muted-foreground">
                Choose from our collection of premium couple-focused games
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg hover:bg-plum-deep/20 transition-colors"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronRight
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-90" : ""}`}
              />
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-2xl p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <IntensitySlider value={spiceLevel} onChange={setSpiceLevel} />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="couple-mode" className="text-sm text-muted-foreground">
                      Couple Mode Only
                    </Label>
                    <Switch
                      id="couple-mode"
                      checked={coupleMode}
                      onCheckedChange={setCoupleMode}
                      data-testid="switch-couple-mode"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="local-only" className="text-sm text-muted-foreground">
                      Local Games Only
                    </Label>
                    <Switch
                      id="local-only"
                      checked={localOnly}
                      onCheckedChange={(v) => {
                        setLocalOnly(v);
                        if (v) setOnlineOnly(false);
                      }}
                      data-testid="switch-local-only"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="online-only" className="text-sm text-muted-foreground">
                      Online Games Only
                    </Label>
                    <Switch
                      id="online-only"
                      checked={onlineOnly}
                      onCheckedChange={(v) => {
                        setOnlineOnly(v);
                        if (v) setLocalOnly(false);
                      }}
                      data-testid="switch-online-only"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <HeatMeter value={spiceLevel * 20} showLabel size="lg" />
                </div>
              </div>
            </motion.div>
          )}
        </FadeIn>

        {/* Games Grid */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={i} variants={staggerChildVariants}>
                  <GameCardSkeleton />
                </motion.div>
              ))
            : filteredGames && filteredGames.length > 0
              ? filteredGames.map((game) => (
                  <motion.div key={game.id} variants={staggerChildVariants}>
                    <Link href={`/games/${game.slug}`}>
                      <GameCard game={game} />
                    </Link>
                  </motion.div>
                ))
              : (
                  <motion.div variants={staggerChildVariants} className="col-span-full text-center py-16">
                    <Flame className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No games found matching your filters</p>
                  </motion.div>
                )}
        </StaggerChildren>

        {/* CTA Section */}
        <FadeIn delay={0.6}>
          <div
            className="relative rounded-3xl p-12 md:p-16 overflow-hidden glass-card"
            style={{
              background: `
                linear-gradient(135deg, rgba(255, 0, 138, 0.1) 0%, rgba(176, 15, 47, 0.05) 50%, rgba(90, 26, 140, 0.1) 100%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff008a' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
              `,
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "loop" }}
            />

            <div className="relative z-10 text-center">
              <h3 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to Connect?
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
                Start your VelvetPlay experience today. No sign-up required—just pick a game and play.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/games/truth-or-dare/local">
                  <VelvetButton velvetVariant="velvet" size="lg">
                    <Flame className="w-5 h-5 mr-2" />
                    Play Now
                  </VelvetButton>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </main>
    </div>
  );
}
