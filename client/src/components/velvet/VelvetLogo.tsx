import { motion } from "framer-motion";
import { Link } from "wouter";

interface VelvetLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function VelvetLogo({ size = "md", showText = true, className = "" }: VelvetLogoProps) {
  const sizes = {
    sm: { container: "w-8 h-8", text: "text-sm" },
    md: { container: "w-10 h-10", text: "text-lg" },
    lg: { container: "w-16 h-16", text: "text-3xl" },
  };

  const s = sizes[size];

  return (
    <Link href="/">
      <motion.div
        className={`flex items-center gap-3 cursor-pointer ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Logo circle with gradient and glow */}
        <motion.div
          className={`${s.container} rounded-full flex items-center justify-center relative`}
          style={{
            background: "linear-gradient(135deg, #FF008A 0%, #B00F2F 60%, #5A1A8C 100%)",
            boxShadow: "0 0 30px rgba(255, 0, 138, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)",
          }}
          animate={{
            boxShadow: [
              "0 0 30px rgba(255, 0, 138, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)",
              "0 0 40px rgba(255, 0, 138, 0.8), inset 0 0 25px rgba(255, 255, 255, 0.2)",
              "0 0 30px rgba(255, 0, 138, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {/* Inner flame icon */}
          <motion.svg
            className={`${s.text} text-white fill-white`}
            viewBox="0 0 24 24"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </motion.svg>
        </motion.div>

        {showText && (
          <div className="flex flex-col leading-tight">
            <motion.span
              className={`${s.text} font-display font-bold bg-gradient-to-r from-neon-magenta via-ember-red to-plum-deep bg-clip-text text-transparent`}
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              VelvetPlay
            </motion.span>
            <span className="text-xs text-neon-magenta/60 font-semibold tracking-widest">
              18+ PREMIUM
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
