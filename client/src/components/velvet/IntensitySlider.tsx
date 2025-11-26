import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const intensityLabels = [
  { level: 1, label: "Mild", color: "#E3C089" },
  { level: 2, label: "Warm", color: "#FF5E33" },
  { level: 3, label: "Spicy", color: "#FF2E6D" },
  { level: 4, label: "Hot", color: "#FF008A" },
  { level: 5, label: "Extreme", color: "#B00F2F" },
];

export function IntensitySlider({ value, onChange, className = "" }: IntensitySliderProps) {
  const currentIntensity = intensityLabels[value - 1] || intensityLabels[2];

  return (
    <div className={`space-y-4 ${className}`} data-testid="intensity-slider">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Intensity Level</span>
        <motion.div
          className="flex items-center gap-2"
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <span 
            className="text-sm font-semibold"
            style={{ color: currentIntensity.color }}
          >
            {currentIntensity.label}
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: value }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1, type: "spring" }}
              >
                <Flame 
                  className="w-4 h-4"
                  style={{ 
                    color: currentIntensity.color,
                    filter: `drop-shadow(0 0 4px ${currentIntensity.color}80)`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="relative">
        {/* Background track with gradient */}
        <div 
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full"
          style={{
            background: `linear-gradient(90deg, 
              ${intensityLabels[0].color}40 0%, 
              ${intensityLabels[2].color}60 50%, 
              ${intensityLabels[4].color}80 100%)`,
          }}
        />

        <Slider
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
          min={1}
          max={5}
          step={1}
          className="relative"
        />

        {/* Glow effect under thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full pointer-events-none"
          style={{
            left: `calc(${((value - 1) / 4) * 100}% - 12px)`,
            background: currentIntensity.color,
            filter: `blur(8px)`,
            opacity: 0.5,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Level markers */}
      <div className="flex justify-between px-1">
        {intensityLabels.map((level) => (
          <button
            key={level.level}
            onClick={() => onChange(level.level)}
            className={`
              text-xs transition-all duration-200
              ${value === level.level ? "opacity-100" : "opacity-40 hover:opacity-70"}
            `}
            style={{ color: level.color }}
            data-testid={`intensity-level-${level.level}`}
          >
            {level.level}
          </button>
        ))}
      </div>
    </div>
  );
}
