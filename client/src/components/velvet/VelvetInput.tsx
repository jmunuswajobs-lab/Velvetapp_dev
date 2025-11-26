import { Input, type InputProps } from "@/components/ui/input";
import { forwardRef, useState } from "react";
import { motion } from "framer-motion";

interface VelvetInputProps extends InputProps {
  glowColor?: string;
}

export const VelvetInput = forwardRef<HTMLInputElement, VelvetInputProps>(
  ({ glowColor = "rgba(255, 0, 138, 0.4)", className = "", ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <motion.div
        className="relative"
        animate={{
          boxShadow: isFocused ? `0 0 20px ${glowColor}` : "none",
        }}
        transition={{ duration: 0.2 }}
      >
        <Input
          ref={ref}
          className={`
            bg-noir-deep/80 border-plum-deep/50
            text-white placeholder:text-muted-foreground
            focus:border-neon-magenta/50 focus:ring-neon-magenta/20
            transition-all duration-300
            ${className}
          `}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </motion.div>
    );
  }
);

VelvetInput.displayName = "VelvetInput";
