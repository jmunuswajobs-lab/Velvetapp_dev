import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Flame, Heart, Users, Zap, Shield, Globe } from "lucide-react";

type BadgeVariant = "flirty" | "bold" | "kinky" | "couple" | "local" | "online" | "safe" | "spicy";

interface SpicyBadgeProps {
  variant: BadgeVariant;
  className?: string;
  animated?: boolean;
}

const badgeConfig: Record<BadgeVariant, { 
  label: string; 
  icon: typeof Flame; 
  bgColor: string;
  textColor: string;
  glowColor: string;
}> = {
  flirty: {
    label: "Flirty",
    icon: Heart,
    bgColor: "bg-neon-magenta/20",
    textColor: "text-neon-magenta",
    glowColor: "rgba(255, 0, 138, 0.4)",
  },
  bold: {
    label: "Bold",
    icon: Zap,
    bgColor: "bg-ember-orange/20",
    textColor: "text-ember-orange",
    glowColor: "rgba(255, 94, 51, 0.4)",
  },
  kinky: {
    label: "Kinky",
    icon: Flame,
    bgColor: "bg-velvet-red/20",
    textColor: "text-velvet-red",
    glowColor: "rgba(176, 15, 47, 0.4)",
  },
  couple: {
    label: "Couple",
    icon: Heart,
    bgColor: "bg-heat-pink/20",
    textColor: "text-heat-pink",
    glowColor: "rgba(255, 46, 109, 0.4)",
  },
  local: {
    label: "Local",
    icon: Users,
    bgColor: "bg-plum-mid/20",
    textColor: "text-plum-light",
    glowColor: "rgba(123, 44, 179, 0.4)",
  },
  online: {
    label: "Online",
    icon: Globe,
    bgColor: "bg-champagne-gold/20",
    textColor: "text-champagne-gold",
    glowColor: "rgba(227, 192, 137, 0.4)",
  },
  safe: {
    label: "Remote Safe",
    icon: Shield,
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    glowColor: "rgba(74, 222, 128, 0.4)",
  },
  spicy: {
    label: "Spicy",
    icon: Flame,
    bgColor: "bg-ember-orange/20",
    textColor: "text-ember-orange",
    glowColor: "rgba(255, 94, 51, 0.4)",
  },
};

export function SpicyBadge({ variant, className = "", animated = false }: SpicyBadgeProps) {
  const config = badgeConfig[variant];
  const Icon = config.icon;

  const badge = (
    <Badge
      className={`
        ${config.bgColor} ${config.textColor} 
        border-none gap-1 px-2 py-0.5
        ${className}
      `}
      style={{
        boxShadow: animated ? `0 0 12px ${config.glowColor}` : undefined,
      }}
      data-testid={`badge-${variant}`}
    >
      <Icon className="w-3 h-3" />
      <span className="text-xs font-medium">{config.label}</span>
    </Badge>
  );

  if (animated) {
    return (
      <motion.div
        animate={{
          boxShadow: [
            `0 0 8px ${config.glowColor}`,
            `0 0 16px ${config.glowColor}`,
            `0 0 8px ${config.glowColor}`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="rounded-full"
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
}

interface SpiceIndicatorProps {
  level: number; // 1-5
  size?: "sm" | "md";
  className?: string;
}

export function SpiceIndicator({ level, size = "md", className = "" }: SpiceIndicatorProps) {
  const clampedLevel = Math.min(5, Math.max(1, level));
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <div className={`flex items-center gap-0.5 ${className}`} data-testid="spice-indicator">
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: i < clampedLevel ? 1 : 0.2, 
            scale: 1,
          }}
          transition={{ delay: i * 0.1, type: "spring" }}
        >
          <Flame
            className={`${iconSize} ${
              i < clampedLevel 
                ? "text-ember-orange drop-shadow-[0_0_4px_rgba(255,94,51,0.6)]" 
                : "text-muted-foreground/30"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}
