import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, Home, RotateCcw, Trophy, Flame,
  SkipForward, MessageCircle, Sparkles
} from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { FadeIn, SlideIn, StaggerChildren, staggerChildVariants, ScaleIn } from "@/components/velvet/PageTransition";
import { useLocalGame, useLocalGameSession } from "@/lib/gameState";
import { useGameSessionStore } from "@/lib/store";
import type { GameStats, PromptType } from "@shared/schema";

const promptTypeLabels: Record<PromptType, string> = {
  truth: "Truths",
  dare: "Dares",
  challenge: "Challenges",
  confession: "Confessions",
  vote: "Votes",
  rule: "Rules",
};

const promptTypeColors: Record<PromptType, string> = {
  truth: "#7B2CB3",
  dare: "#B00F2F",
  challenge: "#FF5E33",
  confession: "#FF008A",
  vote: "#E3C089",
  rule: "#FF2E6D",
};

export default function Summary() {
  const { slug, sessionId } = useParams<{ slug: string; sessionId?: string }>();
  const [, setLocation] = useLocation();
  const gameSession = useLocalGameSession(sessionId || "");

  const stats = useMemo(() => {
    if (!gameSession) {
      return {
        roundsPlayed: 0,
        promptsByType: {},
        playerPicks: {},
        skippedCount: 0,
      };
    }
    return gameSession.session.stats;
  }, [gameSession]);

  const handlePlayAgain = () => {
    if (sessionId) {
      useGameSessionStore.getState().deleteSession(sessionId);
    }
    setLocation(`/games/${slug}/setup`);
  };

  const handleGoHome = () => {
    if (sessionId) {
      useGameSessionStore.getState().deleteSession(sessionId);
    }
    setLocation("/");
  };

  // Find MVP player
  const mvpPlayer = stats
    ? Object.entries(stats.playerPicks).sort((a, b) => b[1] - a[1])[0]
    : null;

  // Total prompts played
  const totalPrompts = stats
    ? Object.values(stats.promptsByType).reduce((a, b) => a + b, 0)
    : 0;

  if (!stats || totalPrompts === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Flame className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">No Game Data</h1>
          <p className="text-muted-foreground mb-6">Start a new game to see your stats</p>
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

  return (
    <div className="min-h-screen relative">
      {/* Background - celebratory gradient */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(255, 0, 138, 0.25) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 80%, rgba(227, 192, 137, 0.2) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, rgba(176, 15, 47, 0.15) 0%, transparent 50%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={25} />

      {/* Header */}
      <header className="glass border-b border-plum-deep/30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Games</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <FadeIn className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{
              background: "linear-gradient(135deg, #E3C089 0%, #C9A66B 100%)",
              boxShadow: "0 0 40px rgba(227, 192, 137, 0.5)",
            }}
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 30px rgba(227, 192, 137, 0.4)",
                "0 0 60px rgba(227, 192, 137, 0.6)",
                "0 0 30px rgba(227, 192, 137, 0.4)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-10 h-10 text-noir-black" />
          </motion.div>

          <h1 className="text-3xl font-display font-bold gradient-text-gold mb-2">
            Game Complete!
          </h1>
          <p className="text-muted-foreground">
            Here's how your session went
          </p>
        </FadeIn>

        {/* Stats cards */}
        <StaggerChildren className="grid grid-cols-2 gap-4 mb-6">
          <motion.div variants={staggerChildVariants}>
            <VelvetCard tiltEnabled={false} glowColor="rgba(255, 0, 138, 0.3)" className="p-4 text-center">
              <MessageCircle className="w-8 h-8 text-neon-magenta mx-auto mb-2" />
              <p className="text-3xl font-display font-bold">{totalPrompts}</p>
              <p className="text-xs text-muted-foreground">Prompts Played</p>
            </VelvetCard>
          </motion.div>

          <motion.div variants={staggerChildVariants}>
            <VelvetCard tiltEnabled={false} glowColor="rgba(255, 94, 51, 0.3)" className="p-4 text-center">
              <Flame className="w-8 h-8 text-ember-orange mx-auto mb-2" />
              <p className="text-3xl font-display font-bold">{stats.roundsPlayed}</p>
              <p className="text-xs text-muted-foreground">Rounds</p>
            </VelvetCard>
          </motion.div>

          <motion.div variants={staggerChildVariants}>
            <VelvetCard tiltEnabled={false} glowColor="rgba(123, 44, 179, 0.3)" className="p-4 text-center">
              <SkipForward className="w-8 h-8 text-plum-light mx-auto mb-2" />
              <p className="text-3xl font-display font-bold">{stats.skippedCount}</p>
              <p className="text-xs text-muted-foreground">Skipped</p>
            </VelvetCard>
          </motion.div>

          <motion.div variants={staggerChildVariants}>
            <VelvetCard tiltEnabled={false} glowColor="rgba(227, 192, 137, 0.3)" className="p-4 text-center">
              <Trophy className="w-8 h-8 text-champagne-gold mx-auto mb-2" />
              <p className="text-lg font-display font-bold truncate">{mvpPlayer?.[0] || "-"}</p>
              <p className="text-xs text-muted-foreground">Most Active</p>
            </VelvetCard>
          </motion.div>
        </StaggerChildren>

        {/* Prompt distribution */}
        <SlideIn direction="up" delay={0.3} className="mb-6">
          <VelvetCard tiltEnabled={false} className="p-6">
            <h2 className="text-lg font-display font-semibold mb-4">Prompt Types</h2>

            <div className="space-y-3">
              {(Object.entries(stats.promptsByType) as [PromptType, number][])
                .filter(([, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-muted-foreground">
                      {promptTypeLabels[type]}
                    </span>
                    <div className="flex-1 h-6 rounded-full bg-noir-deep/50 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: promptTypeColors[type] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / totalPrompts) * 100}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <span className="w-8 text-sm font-medium text-right">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </VelvetCard>
        </SlideIn>

        {/* Player activity */}
        {Object.keys(stats.playerPicks).length > 0 && (
          <SlideIn direction="up" delay={0.4} className="mb-8">
            <VelvetCard tiltEnabled={false} className="p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Player Activity</h2>

              <div className="space-y-3">
                {Object.entries(stats.playerPicks)
                  .sort((a, b) => b[1] - a[1])
                  .map(([player, count], index) => (
                    <div key={player} className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? "bg-champagne-gold text-noir-black" : "bg-plum-deep/50 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="flex-1 text-sm">{player}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} prompts
                      </span>
                    </div>
                  ))}
              </div>
            </VelvetCard>
          </SlideIn>
        )}

        {/* Action buttons */}
        <SlideIn direction="up" delay={0.5} className="space-y-3">
          <VelvetButton
            velvetVariant="neon"
            className="w-full py-5"
            onClick={handlePlayAgain}
            data-testid="button-play-again"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </VelvetButton>

          <VelvetButton
            velvetVariant="ghost-glow"
            className="w-full"
            onClick={handleGoHome}
            data-testid="button-go-home"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Games
          </VelvetButton>
        </SlideIn>
      </main>
    </div>
  );
}