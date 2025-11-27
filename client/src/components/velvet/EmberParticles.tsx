import { useMemo, memo } from "react";

interface EmberParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

interface EmberParticlesProps {
  count?: number;
  className?: string;
}

export const EmberParticles = memo(function EmberParticles({ count = 15, className = "" }: EmberParticlesProps) {
  const particles = useMemo<EmberParticle[]>(() => {
    return Array.from({ length: Math.min(count, 20) }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
      size: 2 + Math.random() * 3,
      opacity: 0.2 + Math.random() * 0.4,
    }));
  }, [count]);

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      data-testid="ember-particles"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-ember-rise"
          style={{
            left: `${particle.x}%`,
            bottom: "-10px",
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, rgba(255, 94, 51, ${particle.opacity}) 0%, rgba(255, 0, 138, ${particle.opacity * 0.5}) 100%)`,
            boxShadow: `0 0 ${particle.size}px rgba(255, 94, 51, ${particle.opacity * 0.6})`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
});
