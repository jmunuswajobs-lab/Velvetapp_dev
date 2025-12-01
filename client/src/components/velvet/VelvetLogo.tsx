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
    lg: { container: "w-12 h-12", text: "text-lg" },
  };

  const s = sizes[size];

  return (
    <Link href="/">
      <div className={`flex items-center gap-2 sm:gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform ${className}`}>
        {/* Minimal kinky-elegant logo - stylized V */}
        <svg
          className={`${s.container} flex-shrink-0`}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#FF008A", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#B00F2F", stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Bold minimal V with subtle kinky curves */}
          <path
            d="M 30 20 Q 35 50, 50 80 Q 65 50, 70 20"
            stroke="url(#vGrad)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Subtle accent flourish - flirty element */}
          <circle cx="50" cy="75" r="3" fill="#FF008A" opacity="0.8" />
        </svg>

        {showText && (
          <div className="flex flex-col leading-tight">
            <span className={`${s.text} font-display font-bold bg-gradient-to-r from-neon-magenta to-ember-red bg-clip-text text-transparent`}>
              VelvetPlay
            </span>
            <span className="text-xs text-neon-magenta/60 font-semibold tracking-wider hidden sm:block">
              PREMIUM
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
