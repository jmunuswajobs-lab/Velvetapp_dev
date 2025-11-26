import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Search, BookOpen, Flame, Users, Clock, AlertTriangle } from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { VelvetInput } from "@/components/velvet/VelvetInput";
import { FadeIn, SlideIn, StaggerChildren, staggerChildVariants } from "@/components/velvet/PageTransition";

interface GameRule {
  id: string;
  name: string;
  category: string;
  description: string;
  howToPlay: string[];
  tips: string[];
  minPlayers: number;
  maxPlayers: number;
  estimatedTime: string;
}

const gameRules: GameRule[] = [
  {
    id: "truth-or-dare",
    name: "Truth or Dare",
    category: "Classic",
    description: "The timeless party game where players choose between answering a revealing question or completing a daring challenge.",
    howToPlay: [
      "Players take turns in a circle",
      "The active player chooses 'Truth' or 'Dare'",
      "If Truth: answer the question honestly",
      "If Dare: complete the challenge",
      "Refusing costs you a point or drink (if playing drinking version)",
    ],
    tips: [
      "Set comfort boundaries before playing",
      "Use the intensity slider to match your group's vibe",
      "The skip button is always available - no pressure",
    ],
    minPlayers: 2,
    maxPlayers: 10,
    estimatedTime: "30-60 min",
  },
  {
    id: "never-have-i-ever",
    name: "Never Have I Ever",
    category: "Classic",
    description: "A revealing game where players share experiences and discover what others have done.",
    howToPlay: [
      "One player makes a statement starting with 'Never have I ever...'",
      "Anyone who HAS done the action takes a drink or loses a point",
      "Take turns making statements around the circle",
      "Get creative with your statements to catch others!",
    ],
    tips: [
      "Start mild and increase intensity as the game progresses",
      "Use the heat meter to track the spice level",
      "Perfect for learning new things about each other",
    ],
    minPlayers: 3,
    maxPlayers: 12,
    estimatedTime: "20-45 min",
  },
  {
    id: "spicy-challenges",
    name: "Spicy Challenges",
    category: "Couples",
    description: "Intimate challenges designed for couples to bring some heat to date night.",
    howToPlay: [
      "Draw a challenge card",
      "Read the challenge aloud",
      "Complete the challenge together",
      "Use the skip button if it's too spicy - no judgment!",
    ],
    tips: [
      "Communication is key - discuss boundaries beforehand",
      "The couple mode filter ensures appropriate content",
      "Perfect for long-distance couples playing online",
    ],
    minPlayers: 2,
    maxPlayers: 2,
    estimatedTime: "30-90 min",
  },
  {
    id: "hot-seat",
    name: "Hot Seat",
    category: "Party",
    description: "One player sits in the 'hot seat' while others ask probing questions.",
    howToPlay: [
      "Select one player for the hot seat",
      "Other players take turns asking questions",
      "The hot seat player must answer honestly",
      "Rotate the hot seat after 5-10 questions",
    ],
    tips: [
      "Keep questions fun and flirty, not mean",
      "Use the voting prompts to let the group decide",
      "Great for getting to know new friends",
    ],
    minPlayers: 4,
    maxPlayers: 8,
    estimatedTime: "20-40 min",
  },
];

export default function Rules() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRule, setSelectedRule] = useState<GameRule | null>(null);

  const filteredRules = gameRules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(123, 44, 179, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(176, 15, 47, 0.15) 0%, transparent 50%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={10} />

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
        <FadeIn className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(123, 44, 179, 0.3) 0%, rgba(59, 15, 92, 0.3) 100%)",
              border: "1px solid rgba(123, 44, 179, 0.4)",
            }}
          >
            <BookOpen className="w-8 h-8 text-plum-light" />
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            Rules Library
          </h1>
          <p className="text-muted-foreground">
            Learn how to play each game mode
          </p>
        </FadeIn>

        {/* Search */}
        <SlideIn direction="up" delay={0.1} className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <VelvetInput
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-rules"
            />
          </div>
        </SlideIn>

        {/* Rules grid */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => (
            <motion.div key={rule.id} variants={staggerChildVariants}>
              <VelvetCard
                onClick={() => setSelectedRule(rule)}
                glowColor="rgba(123, 44, 179, 0.25)"
                testId={`rule-card-${rule.id}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs text-plum-light font-medium uppercase tracking-wider">
                        {rule.category}
                      </span>
                      <h3 className="text-lg font-display font-semibold mt-1">
                        {rule.name}
                      </h3>
                    </div>
                    <Flame className="w-5 h-5 text-ember-orange" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {rule.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{rule.minPlayers}-{rule.maxPlayers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{rule.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              </VelvetCard>
            </motion.div>
          ))}
        </StaggerChildren>

        {/* Selected rule detail modal */}
        {selectedRule && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-noir-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRule(null)}
          >
            <motion.div
              className="glass-card rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs text-plum-light font-medium uppercase tracking-wider">
                    {selectedRule.category}
                  </span>
                  <h2 className="text-2xl font-display font-bold gradient-text">
                    {selectedRule.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedRule(null)}
                  className="p-2 text-muted-foreground hover:text-white"
                  data-testid="button-close-rule"
                >
                  ×
                </button>
              </div>

              <p className="text-muted-foreground mb-6">
                {selectedRule.description}
              </p>

              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-neon-magenta" />
                  How to Play
                </h3>
                <ol className="space-y-2">
                  {selectedRule.howToPlay.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-plum-deep/30 flex items-center justify-center text-xs shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-champagne-gold" />
                  Pro Tips
                </h3>
                <ul className="space-y-2">
                  {selectedRule.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-champagne-gold">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-plum-deep/30 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{selectedRule.minPlayers}-{selectedRule.maxPlayers} players</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedRule.estimatedTime}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
