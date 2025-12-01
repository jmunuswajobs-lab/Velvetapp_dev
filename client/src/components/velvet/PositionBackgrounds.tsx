/**
 * Abstract position-themed SVG backgrounds for spicy prompts
 * Minimalist, artistic silhouettes with no explicit detail
 */

interface PositionBackgroundProps {
  variant: "A" | "B" | "C" | "D" | "E";
  className?: string;
}

export function PositionBackgroundA({ className }: PositionBackgroundProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="abstract couple silhouette"
    >
      {/* Gradient background */}
      <defs>
        <linearGradient id="gradA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#FF008A", stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: "#B00F2F", stopOpacity: 0.15 }} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#gradA)" />

      {/* Minimalist silhouette - two bodies in abstract proximity */}
      <ellipse cx="70" cy="80" rx="25" ry="35" fill="#FF1493" opacity="0.2" />
      <ellipse cx="130" cy="90" rx="25" ry="35" fill="#C71585" opacity="0.2" />

      {/* Connecting line - suggests intimacy */}
      <line x1="95" y1="100" x2="105" y2="110" stroke="#FF008A" opacity="0.15" strokeWidth="2" />
    </svg>
  );
}

export function PositionBackgroundB({ className }: PositionBackgroundProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="abstract couple silhouette"
    >
      <defs>
        <linearGradient id="gradB" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#FF5E33", stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: "#FF008A", stopOpacity: 0.15 }} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#gradB)" />

      {/* Two overlapping circles - abstract bodies */}
      <circle cx="75" cy="85" r="30" fill="#FF6B9D" opacity="0.2" />
      <circle cx="125" cy="95" r="30" fill="#E3A693" opacity="0.2" />

      {/* Decorative element suggesting closeness */}
      <path d="M 85 75 Q 100 80 115 85" stroke="#FF008A" strokeWidth="1.5" fill="none" opacity="0.2" />
    </svg>
  );
}

export function PositionBackgroundC({ className }: PositionBackgroundProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="abstract couple silhouette"
    >
      <defs>
        <radialGradient id="gradC">
          <stop offset="0%" style={{ stopColor: "#FF1493", stopOpacity: 0.15 }} />
          <stop offset="100%" style={{ stopColor: "#8B1A1A", stopOpacity: 0.1 }} />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#gradC)" />

      {/* Stylized abstract forms */}
      <polygon points="60,120 80,60 100,120" fill="#FF008A" opacity="0.15" />
      <polygon points="140,120 120,60 100,120" fill="#C71585" opacity="0.15" />

      {/* Connecting diamond shape - suggests union */}
      <diamond cx="100" cy="90" rx="15" ry="20" fill="none" stroke="#FF6B9D" opacity="0.15" strokeWidth="1.5" />
    </svg>
  );
}

export function PositionBackgroundD({ className }: PositionBackgroundProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="abstract couple silhouette"
    >
      <defs>
        <linearGradient id="gradD" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#E3C089", stopOpacity: 0.12 }} />
          <stop offset="100%" style={{ stopColor: "#FF008A", stopOpacity: 0.12 }} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#gradD)" />

      {/* Wavy forms suggesting movement and closeness */}
      <path d="M 60 140 Q 70 100 80 80" stroke="#FF008A" strokeWidth="12" fill="none" opacity="0.15" strokeLinecap="round" />
      <path d="M 140 140 Q 130 100 120 80" stroke="#E3A693" strokeWidth="12" fill="none" opacity="0.15" strokeLinecap="round" />

      {/* Central meeting point */}
      <circle cx="100" cy="95" r="8" fill="#FF6B9D" opacity="0.15" />
    </svg>
  );
}

export function PositionBackgroundE({ className }: PositionBackgroundProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="abstract couple silhouette"
    >
      <defs>
        <linearGradient id="gradE" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#3B0F5C", stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: "#FF008A", stopOpacity: 0.15 }} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#gradE)" />

      {/* Interlocking crescents - abstract intimacy */}
      <path d="M 70 80 A 25 25 0 0 1 70 130" stroke="#FF008A" strokeWidth="18" fill="none" opacity="0.15" strokeLinecap="round" />
      <path d="M 130 80 A 25 25 0 0 0 130 130" stroke="#E3A693" strokeWidth="18" fill="none" opacity="0.15" strokeLinecap="round" />

      {/* Soft glow center */}
      <circle cx="100" cy="105" r="20" fill="#FF6B9D" opacity="0.08" />
    </svg>
  );
}

/**
 * Get a consistent background variant for a prompt ID
 * Uses hash to ensure same prompt always gets same background
 */
export function getPositionBackgroundVariant(
  promptId: string
): "A" | "B" | "C" | "D" | "E" {
  const variants = ["A", "B", "C", "D", "E"] as const;
  let hash = 0;

  for (let i = 0; i < promptId.length; i++) {
    hash = (hash << 5) - hash + promptId.charCodeAt(i);
    hash = hash & hash; // Keep as 32-bit int
  }

  const index = Math.abs(hash) % variants.length;
  return variants[index];
}

/**
 * Render the appropriate background component
 */
export function PositionBackground({ promptId, className }: { promptId: string; className?: string }) {
  const variant = getPositionBackgroundVariant(promptId);

  const backgrounds = {
    A: <PositionBackgroundA variant="A" className={className} />,
    B: <PositionBackgroundB variant="B" className={className} />,
    C: <PositionBackgroundC variant="C" className={className} />,
    D: <PositionBackgroundD variant="D" className={className} />,
    E: <PositionBackgroundE variant="E" className={className} />,
  };

  return backgrounds[variant];
}
