import { motion } from "framer-motion";
import { Link } from "wouter";

interface VelvetLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function VelvetLogo({ size = "md", showText = true, className = "" }: VelvetLogoProps) {
  const sizes = {
    sm: { container: "w-8 h-8", text: "text-xs" },
    md: { container: "w-10 h-10", text: "text-sm" },
    lg: { container: "w-14 h-14", text: "text-lg" },
  };

  const s = sizes[size];

  return (
    <Link href="/">
      <motion.div
        className={`flex items-center gap-2 sm:gap-3 cursor-pointer ${className}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Velvet logo - elegant intertwined hearts forming a V */}
        <motion.svg
          className={`${s.container} flex-shrink-0`}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: "drop-shadow(0 0 10px rgba(255, 0, 138, 0.6))",
          }}
        >
          {/* Define gradient */}
          <defs>
            <linearGradient id="velvetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#FF008A", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "#B00F2F", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#5A1A8C", stopOpacity: 1 }} />
            </linearGradient>
            <filter id="velvetBlur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            </filter>
          </defs>

          {/* Outer luxurious glow */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="url(#velvetGradient)" strokeWidth="1.5" opacity="0.4" />

          {/* Left heart (top-left of V) */}
          <path
            d="M 35 45 Q 25 35, 25 28 Q 25 18, 32 18 Q 38 18, 42 25 Q 46 18, 52 18 Q 59 18, 59 28 Q 59 35, 49 45"
            fill="url(#velvetGradient)"
            opacity="0.9"
          />

          {/* Right heart (top-right of V) */}
          <path
            d="M 65 45 Q 55 35, 55 28 Q 55 18, 62 18 Q 68 18, 72 25 Q 76 18, 82 18 Q 89 18, 89 28 Q 89 35, 79 45"
            fill="url(#velvetGradient)"
            opacity="0.9"
          />

          {/* Connecting V shape at bottom */}
          <path
            d="M 42 45 L 50 75 L 58 45"
            stroke="url(#velvetGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner shine accent */}
          <circle cx="50" cy="30" r="8" fill="white" opacity="0.15" />
        </motion.svg>

        {showText && (
          <div className="flex flex-col leading-tight">
            <motion.span
              className={`${s.text} font-display font-bold bg-gradient-to-r from-neon-magenta via-ember-red to-plum-deep bg-clip-text text-transparent`}
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              VelvetPlay
            </motion.span>
            <span className="text-xs text-neon-magenta/60 font-semibold tracking-wider hidden sm:block">
              PREMIUM
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
