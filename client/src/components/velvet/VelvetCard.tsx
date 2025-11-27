import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import { forwardRef, type ReactNode, type MouseEvent, memo, useCallback } from "react";

interface VelvetCardProps {
  children: ReactNode;
  className?: string;
  tiltEnabled?: boolean;
  glowColor?: string;
  onClick?: () => void;
  testId?: string;
}

export const VelvetCard = memo(forwardRef<HTMLDivElement, VelvetCardProps>(
  ({ children, className = "", tiltEnabled = true, glowColor = "rgba(255, 0, 138, 0.3)", onClick, testId }, ref) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { 
      stiffness: 150, 
      damping: 20,
      mass: 0.5
    });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { 
      stiffness: 150, 
      damping: 20,
      mass: 0.5
    });

    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
      if (!tiltEnabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) / rect.width);
      y.set((e.clientY - centerY) / rect.height);
    }, [tiltEnabled, x, y]);

    const handleMouseLeave = useCallback(() => {
      x.set(0);
      y.set(0);
    }, [x, y]);

    return (
      <motion.div
        ref={ref}
        className="will-change-transform"
        style={{
          perspective: 800,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        data-testid={testId}
      >
        <motion.div
          className="will-change-transform"
          style={{
            rotateX: tiltEnabled ? rotateX : 0,
            rotateY: tiltEnabled ? rotateY : 0,
            transform: "translateZ(0)",
          }}
          whileHover={{ 
            scale: 1.015,
            transition: { duration: 0.15, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.985 }}
        >
          <Card
            className={`
              relative overflow-hidden
              bg-gradient-to-br from-noir-soft via-noir-deep to-noir-black
              border border-plum-deep/30
              transition-shadow duration-200 ease-out
              ${onClick ? "cursor-pointer" : ""}
              ${className}
            `}
            style={{
              boxShadow: `0 4px 24px ${glowColor}, 0 0 0 1px rgba(255, 0, 138, 0.1)`,
              backfaceVisibility: "hidden",
            }}
          >
            {/* Shine overlay - simplified */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-60"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%)",
              }}
            />
            
            {/* Content */}
            <div className="relative z-10">
              {children}
            </div>
            
            {/* Inner glow - simplified */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${glowColor} 0%, transparent 50%)`,
              }}
            />
          </Card>
        </motion.div>
      </motion.div>
    );
  }
));

VelvetCard.displayName = "VelvetCard";

interface PromptCardProps {
  text: string;
  type: string;
  intensity: number;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
}

export const PromptCard = memo(function PromptCard({ text, type, intensity, isFlipped = false, onFlip, className = "" }: PromptCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "truth": return { bg: "from-plum-deep", glow: "rgba(91, 26, 140, 0.4)" };
      case "dare": return { bg: "from-velvet-red", glow: "rgba(176, 15, 47, 0.4)" };
      case "challenge": return { bg: "from-ember-orange/80", glow: "rgba(255, 94, 51, 0.4)" };
      case "confession": return { bg: "from-neon-magenta/80", glow: "rgba(255, 0, 138, 0.4)" };
      case "vote": return { bg: "from-champagne-gold/80", glow: "rgba(227, 192, 137, 0.4)" };
      case "rule": return { bg: "from-heat-pink/80", glow: "rgba(255, 46, 109, 0.4)" };
      default: return { bg: "from-plum-deep", glow: "rgba(91, 26, 140, 0.4)" };
    }
  };

  const typeStyle = getTypeColor(type);
  const baseOpacity = 0.3 + (intensity / 5) * 0.4;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ perspective: 1000 }}
      data-testid="prompt-card"
    >
      {/* Heat glow behind card - using CSS animation for better performance */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl -z-10 animate-pulse-glow"
        style={{
          background: typeStyle.glow,
          opacity: baseOpacity,
        }}
      />

      <motion.div
        className="relative w-full aspect-[3/4] cursor-pointer will-change-transform"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        onClick={onFlip}
        style={{ 
          transformStyle: "preserve-3d",
          transform: "translateZ(0)",
        }}
      >
        {/* Front face */}
        <div
          className={`
            absolute inset-0 rounded-2xl p-6 flex flex-col
            bg-gradient-to-br ${typeStyle.bg} to-noir-black
            border border-white/10
          `}
          style={{
            boxShadow: `0 6px 32px ${typeStyle.glow}, inset 0 0 40px rgba(0,0,0,0.3)`,
            backfaceVisibility: "hidden",
          }}
        >
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl md:text-2xl font-display text-center text-white leading-relaxed">
              {text}
            </p>
          </div>
          
          <div className="flex items-center justify-between gap-2 mt-4">
            <span className="text-xs uppercase tracking-wider text-white/60 font-medium">
              {type}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: intensity }, (_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full bg-ember-orange"
                  style={{
                    boxShadow: "0 0 6px rgba(255, 94, 51, 0.5)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Back face */}
        <div
          className={`
            absolute inset-0 rounded-2xl p-6 flex items-center justify-center
            bg-gradient-to-br from-plum-deep to-noir-black
            border border-white/10
          `}
          style={{
            boxShadow: "0 6px 32px rgba(59, 15, 92, 0.4)",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-magenta to-velvet-red flex items-center justify-center">
              <span className="text-3xl font-display text-white">V</span>
            </div>
            <p className="text-sm text-white/60">Tap to reveal</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
