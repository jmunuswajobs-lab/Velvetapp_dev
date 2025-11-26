import { motion } from "framer-motion";
import { useMemo } from "react";

interface HeatMeterProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getHeatLabel(value: number): string {
  if (value < 20) return "Cool";
  if (value < 40) return "Warm";
  if (value < 60) return "Blushing";
  if (value < 80) return "Steamy";
  return "Danger Zone";
}

function getHeatColor(value: number): string {
  if (value < 20) return "#FF5E33";
  if (value < 40) return "#FF6B4A";
  if (value < 60) return "#FF2E6D";
  if (value < 80) return "#FF008A";
  return "#B00F2F";
}

export function HeatMeter({ value, showLabel = true, size = "md", className = "" }: HeatMeterProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const label = getHeatLabel(clampedValue);
  const color = getHeatColor(clampedValue);
  
  const sizeStyles = useMemo(() => {
    switch (size) {
      case "sm": return { height: 8, fontSize: "text-xs" };
      case "lg": return { height: 16, fontSize: "text-base" };
      default: return { height: 12, fontSize: "text-sm" };
    }
  }, [size]);

  return (
    <div className={`flex flex-col gap-2 ${className}`} data-testid="heat-meter">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={`${sizeStyles.fontSize} text-muted-foreground`}>Heat Level</span>
          <motion.span 
            className={`${sizeStyles.fontSize} font-semibold`}
            style={{ color }}
            animate={{ 
              textShadow: clampedValue > 60 
                ? [`0 0 10px ${color}`, `0 0 20px ${color}`, `0 0 10px ${color}`]
                : "none"
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {label}
          </motion.span>
        </div>
      )}
      
      <div 
        className="relative w-full rounded-full overflow-hidden"
        style={{ 
          height: sizeStyles.height,
          background: "linear-gradient(90deg, rgba(5, 5, 9, 0.8) 0%, rgba(59, 15, 92, 0.4) 100%)",
          border: "1px solid rgba(255, 0, 138, 0.2)",
        }}
      >
        {/* Animated liquid fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, 
              ${color}88 0%, 
              ${color} 50%, 
              ${color}cc 100%)`,
            boxShadow: `0 0 20px ${color}66, inset 0 0 10px rgba(255, 255, 255, 0.2)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["-200% 0", "200% 0"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Pulsing outline for high heat */}
        {clampedValue > 60 && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${color}`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
    </div>
  );
}
