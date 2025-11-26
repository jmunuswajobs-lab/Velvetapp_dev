import { Button, type ButtonProps } from "@/components/ui/button";
import { motion } from "framer-motion";
import { forwardRef } from "react";

type VelvetVariant = "velvet" | "neon" | "ember" | "gold" | "ghost-glow";

interface VelvetButtonProps extends Omit<ButtonProps, "variant"> {
  velvetVariant?: VelvetVariant;
  glowOnHover?: boolean;
}

const variantStyles: Record<VelvetVariant, {
  base: string;
  glow: string;
}> = {
  velvet: {
    base: "bg-gradient-to-r from-velvet-red to-velvet-dark text-white border-velvet-light/30",
    glow: "0 0 30px rgba(176, 15, 47, 0.5)",
  },
  neon: {
    base: "bg-gradient-to-r from-neon-magenta to-neon-pink text-white border-neon-hot/30",
    glow: "0 0 30px rgba(255, 0, 138, 0.5)",
  },
  ember: {
    base: "bg-gradient-to-r from-ember-orange to-ember-dark text-white border-ember-glow/30",
    glow: "0 0 30px rgba(255, 94, 51, 0.5)",
  },
  gold: {
    base: "bg-gradient-to-r from-champagne-gold to-champagne-dark text-noir-black border-champagne-light/30",
    glow: "0 0 30px rgba(227, 192, 137, 0.5)",
  },
  "ghost-glow": {
    base: "bg-transparent text-white border-white/20 hover:border-neon-magenta/50",
    glow: "0 0 20px rgba(255, 0, 138, 0.3)",
  },
};

export const VelvetButton = forwardRef<HTMLButtonElement, VelvetButtonProps>(
  ({ velvetVariant = "velvet", glowOnHover = true, className = "", children, ...props }, ref) => {
    const styles = variantStyles[velvetVariant];

    return (
      <motion.div
        whileHover={glowOnHover ? { 
          boxShadow: styles.glow,
          scale: 1.02,
        } : undefined}
        whileTap={{ scale: 0.98 }}
        className="rounded-md"
      >
        <Button
          ref={ref}
          className={`
            ${styles.base}
            border font-semibold
            transition-all duration-300
            ${className}
          `}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

VelvetButton.displayName = "VelvetButton";
