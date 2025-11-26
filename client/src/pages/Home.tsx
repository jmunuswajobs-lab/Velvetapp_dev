import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Flame, Users, Heart, Dices, BookOpen, Settings,
  Filter, Search, ChevronRight
} from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { GameCard, GameCardSkeleton } from "@/components/velvet/GameCard";
import { VelvetInput } from "@/components/velvet/VelvetInput";
import { IntensitySlider } from "@/components/velvet/IntensitySlider";
import { HeatMeter } from "@/components/velvet/HeatMeter";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { FadeIn, StaggerChildren, staggerChildVariants } from "@/components/velvet/PageTransition";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Game } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [spiceLevel, setSpiceLevel] = useState(3);
  const [coupleMode, setCoupleMode] = useState(false);
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
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 10% 10%, rgba(59, 15, 92, 0.3) 0%, transparent 40%),
            radial-gradient(ellipse at 90% 90%, rgba(176, 15, 47, 0.2) 0%, transparent 40%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={15} />

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-plum-deep/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/">
              <motion.div 
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #FF008A 0%, #B00F2F 100%)",
                    boxShadow: "0 0 20px rgba(255, 0, 138, 0.4)",
                  }}
                >
                  <span className="text-lg font-display font-bold text-white">V</span>
                </div>
                <span className="font-display font-semibold text-lg hidden sm:block gradient-text">
                  VelvetPlay
                </span>
              </motion.div>
            </Link>

            {/* Search */}
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

            {/* Quick actions */}
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero section */}
        <FadeIn className="mb-8">
          <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
                <span className="gradient-text">Spice Up Your Night</span>
              </h1>
              <p className="text-muted-foreground max-w-xl mb-6">
                Premium party games for couples and groups. Truth or Dare, Never Have I Ever, 
                and more intimate challenges await.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Link href="/games/truth-or-dare/local">
                  <VelvetButton velvetVariant="velvet" data-testid="button-quick-play-local">
                    <Users className="w-4 h-4 mr-2" />
                    Quick Local Game
                  </VelvetButton>
                </Link>
                <Link href="/games/truth-or-dare/online">
                  <VelvetButton velvetVariant="neon" data-testid="button-quick-play-online">
                    <Heart className="w-4 h-4 mr-2" />
                    Play Online
                  </VelvetButton>
                </Link>
              </div>
            </div>

            {/* Decorative element */}
            <div 
              className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-30"
              style={{ background: "linear-gradient(135deg, #FF008A 0%, #B00F2F 100%)" }}
            />
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.1} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-white">
              Game Catalog
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronRight className={`w-4 h-4 transition-transform ${showFilters ? "rotate-90" : ""}`} />
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-xl p-4 mb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <IntensitySlider
                  value={spiceLevel}
                  onChange={setSpiceLevel}
                />

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
                      onCheckedChange={(v) => { setLocalOnly(v); if (v) setOnlineOnly(false); }}
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
                      onCheckedChange={(v) => { setOnlineOnly(v); if (v) setLocalOnly(false); }}
                      data-testid="switch-online-only"
                    />
                  </div>
                </div>

                <div>
                  <HeatMeter value={spiceLevel * 20} showLabel size="lg" />
                </div>
              </div>
            </motion.div>
          )}
        </FadeIn>

        {/* Games grid */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} variants={staggerChildVariants}>
                <GameCardSkeleton />
              </motion.div>
            ))
          ) : filteredGames && filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <motion.div key={game.id} variants={staggerChildVariants}>
                <Link href={`/games/${game.slug}`}>
                  <GameCard game={game} />
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div 
              variants={staggerChildVariants}
              className="col-span-full text-center py-12"
            >
              <Flame className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No games found matching your filters</p>
            </motion.div>
          )}
        </StaggerChildren>
      </main>
    </div>
  );
}
