import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Users, Globe, ArrowLeft, Play, Flame, Heart, 
  MessageCircle, Zap, Shield, Clock
} from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { SpicyBadge, SpiceIndicator } from "@/components/velvet/SpicyBadge";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { FadeIn, SlideIn, ScaleIn } from "@/components/velvet/PageTransition";
import type { GameWithPacks } from "@shared/schema";

export default function GameDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: game, isLoading } = useQuery<GameWithPacks>({
    queryKey: [`/api/games/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
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

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Flame className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Game Not Found</h1>
          <p className="text-muted-foreground mb-6">This game doesn't exist or has been removed.</p>
          <Link href="/">
            <VelvetButton velvetVariant="neon">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </VelvetButton>
          </Link>
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
            radial-gradient(ellipse at 30% 20%, rgba(176, 15, 47, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(59, 15, 92, 0.3) 0%, transparent 50%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={12} />

      {/* Header */}
      <header className="glass border-b border-plum-deep/30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/">
            <button 
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Games</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero card */}
        <FadeIn>
          <VelvetCard 
            tiltEnabled={false}
            glowColor="rgba(255, 0, 138, 0.25)"
            className="mb-8"
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Icon */}
                <ScaleIn className="shrink-0">
                  <motion.div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto md:mx-0"
                    style={{
                      background: "linear-gradient(135deg, rgba(255, 0, 138, 0.3) 0%, rgba(176, 15, 47, 0.3) 100%)",
                      border: "1px solid rgba(255, 0, 138, 0.4)",
                      boxShadow: "0 0 30px rgba(255, 0, 138, 0.3)",
                    }}
                  >
                    <Flame className="w-12 h-12 text-neon-magenta" />
                  </motion.div>
                </ScaleIn>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-3">
                    {game.name}
                  </h1>
                  <p className="text-muted-foreground mb-4 max-w-xl">
                    {game.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                    {game.supportsLocal && <SpicyBadge variant="local" />}
                    {game.supportsOnline && <SpicyBadge variant="online" />}
                    {game.isCoupleFocused && <SpicyBadge variant="couple" />}
                    {game.isSpicy && <SpicyBadge variant="spicy" animated />}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{game.minPlayers}-{game.maxPlayers} players</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      <span>{game.promptCount || 100}+ prompts</span>
                    </div>
                    <SpiceIndicator level={3} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </VelvetCard>
        </FadeIn>

        {/* Play options */}
        <SlideIn direction="up" delay={0.2} className="mb-8">
          <h2 className="text-xl font-display font-semibold mb-4">Choose Your Mode</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local play */}
            {game.supportsLocal && (
              <Link href={`/games/${game.slug}/local`}>
                <VelvetCard glowColor="rgba(123, 44, 179, 0.3)">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: "linear-gradient(135deg, rgba(123, 44, 179, 0.3) 0%, rgba(59, 15, 92, 0.3) 100%)",
                          border: "1px solid rgba(123, 44, 179, 0.4)",
                        }}
                      >
                        <Users className="w-6 h-6 text-plum-light" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-lg mb-1">Play Locally</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          One device, pass and play. Perfect for in-person gatherings.
                        </p>
                        
                        <VelvetButton 
                          velvetVariant="ghost-glow" 
                          size="sm"
                          data-testid="button-play-local"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Local Game
                        </VelvetButton>
                      </div>
                    </div>
                  </div>
                </VelvetCard>
              </Link>
            )}

            {/* Online play */}
            {game.supportsOnline && (
              <Link href={`/games/${game.slug}/online`}>
                <VelvetCard glowColor="rgba(255, 0, 138, 0.3)">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: "linear-gradient(135deg, rgba(255, 0, 138, 0.3) 0%, rgba(176, 15, 47, 0.3) 100%)",
                          border: "1px solid rgba(255, 0, 138, 0.4)",
                        }}
                      >
                        <Globe className="w-6 h-6 text-neon-magenta" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-lg mb-1">Play Online</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Create a room and invite others. Real-time sync across devices.
                        </p>
                        
                        <VelvetButton 
                          velvetVariant="neon" 
                          size="sm"
                          data-testid="button-play-online"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Create Room
                        </VelvetButton>
                      </div>
                    </div>
                  </div>
                </VelvetCard>
              </Link>
            )}
          </div>
        </SlideIn>

        {/* Features */}
        <SlideIn direction="up" delay={0.3}>
          <h2 className="text-xl font-display font-semibold mb-4">Features</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Zap, label: "Quick Start", desc: "Ready in seconds" },
              { icon: Shield, label: "Safe Space", desc: "Comfort controls" },
              { icon: Flame, label: "Heat Meter", desc: "Track intensity" },
              { icon: Clock, label: "No Limit", desc: "Play as long as you want" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="glass-card rounded-xl p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <feature.icon className="w-6 h-6 text-neon-magenta mx-auto mb-2" />
                <p className="font-medium text-sm">{feature.label}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </SlideIn>
      </main>
    </div>
  );
}
