import { memo, useMemo } from "react";
import { Users, Flame, Heart, Zap, MessageSquare, Globe, Scale, HelpCircle, Gamepad2 } from "lucide-react";
import type { Game } from "@shared/schema";
import { SpicyBadge, SpiceIndicator } from "./SpicyBadge";
import { VelvetCard } from "./VelvetCard";

const engineTypeBadges: Record<string, { label: string; color: string }> = {
  "prompt-party": { label: "CARD GAME", color: "bg-amber-500/20 text-amber-300" },
  "prompt-couple": { label: "CARD GAME", color: "bg-rose-500/20 text-rose-300" },
  "board-ludo": { label: "BOARD GAME", color: "bg-violet-500/20 text-violet-300" },
  "memory-match": { label: "MEMORY", color: "bg-blue-500/20 text-blue-300" },
  "pong": { label: "ARCADE", color: "bg-cyan-500/20 text-cyan-300" },
  "racer": { label: "RACE", color: "bg-orange-500/20 text-orange-300" },
  "tap-duel": { label: "ARCADE", color: "bg-red-500/20 text-red-300" },
  "guessing": { label: "PARTY", color: "bg-green-500/20 text-green-300" },
  "rhythm": { label: "ARCADE", color: "bg-pink-500/20 text-pink-300" },
  "roulette": { label: "PARTY", color: "bg-indigo-500/20 text-indigo-300" },
  "tool-randomizer": { label: "PARTY", color: "bg-yellow-500/20 text-yellow-300" },
};

interface GameCardProps {
  game: Game;
  onClick?: () => void;
}

const gameIcons: Record<string, typeof Flame> = {
  flame: Flame,
  users: Users,
  globe: Globe,
  heart: Heart,
  zap: Zap,
  message: MessageSquare,
  question: HelpCircle,
  scale: Scale,
};

export const GameCard = memo(function GameCard({ game, onClick }: GameCardProps) {
  const Icon = gameIcons[game.iconName || "flame"] || Flame;

  const glowColor = useMemo(() => {
    if (game.isCoupleFocused) return "rgba(255, 46, 109, 0.3)";
    if (game.isSpicy) return "rgba(255, 94, 51, 0.3)";
    return "rgba(255, 0, 138, 0.3)";
  }, [game.isCoupleFocused, game.isSpicy]);

  const backgroundGradient = useMemo(() => {
    return game.isCoupleFocused 
      ? "radial-gradient(circle at 20% 30%, rgba(255, 46, 109, 0.4) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(176, 15, 47, 0.3) 0%, transparent 60%)"
      : "radial-gradient(circle at 30% 20%, rgba(255, 0, 138, 0.4) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(59, 15, 92, 0.3) 0%, transparent 60%)";
  }, [game.isCoupleFocused]);

  return (
    <VelvetCard
      onClick={onClick}
      glowColor={glowColor}
      className="h-full relative overflow-hidden"
      testId={`game-card-${game.slug}`}
    >
      {/* Decorative gradient background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ background: backgroundGradient }}
      />
      <div className="p-5 flex flex-col h-full relative z-10">
        {/* Icon and title */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-shadow duration-200 hover:shadow-[0_0_16px_rgba(255,0,138,0.35)]"
            style={{
              background: "linear-gradient(135deg, rgba(255, 0, 138, 0.2) 0%, rgba(176, 15, 47, 0.2) 100%)",
              border: "1px solid rgba(255, 0, 138, 0.3)",
            }}
          >
            <Icon className="w-7 h-7 text-neon-magenta" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg text-white truncate">
              {game.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {game.description}
            </p>
          </div>
        </div>

        {/* Engine Type Badge + Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {game.engineType && (
            <div className={`px-2 py-0.5 rounded text-xs font-semibold ${engineTypeBadges[game.engineType]?.color || "bg-gray-500/20 text-gray-300"}`}>
              {engineTypeBadges[game.engineType]?.label || "GAME"}
            </div>
          )}
          {game.audience === "couple" && <SpicyBadge variant="couple" />}
          {game.audience === "friends" && <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-300">FRIENDS</span>}
          {game.supportsLocal && <SpicyBadge variant="local" />}
          {game.supportsOnline && <SpicyBadge variant="online" />}
          {game.isSpicy && <SpicyBadge variant="spicy" />}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-plum-deep/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{game.minPlayers}-{game.maxPlayers} players</span>
          </div>
          <SpiceIndicator level={3} size="sm" />
        </div>
      </div>
    </VelvetCard>
  );
});

interface GameCardSkeletonProps {
  className?: string;
}

export function GameCardSkeleton({ className = "" }: GameCardSkeletonProps) {
  return (
    <div 
      className={`
        rounded-lg p-5 
        bg-gradient-to-br from-noir-soft via-noir-deep to-noir-black
        border border-plum-deep/30
        animate-pulse
        ${className}
      `}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-plum-deep/20" />
        <div className="flex-1">
          <div className="h-5 w-2/3 bg-plum-deep/20 rounded mb-2" />
          <div className="h-4 w-full bg-plum-deep/10 rounded" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-plum-deep/10 rounded-full" />
        <div className="h-6 w-16 bg-plum-deep/10 rounded-full" />
      </div>
      <div className="pt-4 border-t border-plum-deep/20 flex justify-between">
        <div className="h-4 w-24 bg-plum-deep/10 rounded" />
        <div className="h-4 w-16 bg-plum-deep/10 rounded" />
      </div>
    </div>
  );
}