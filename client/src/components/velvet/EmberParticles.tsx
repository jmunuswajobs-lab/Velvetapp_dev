import { motion } from "framer-motion";
import { useMemo } from "react";

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

export function EmberParticles({ count = 20, className = "" }: EmberParticlesProps) {
  const particles = useMemo<EmberParticle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      size: 2 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [count]);

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      data-testid="ember-particles"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            bottom: "-10px",
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, rgba(255, 94, 51, ${particle.opacity}) 0%, rgba(255, 0, 138, ${particle.opacity * 0.5}) 100%)`,
            boxShadow: `0 0 ${particle.size * 2}px rgba(255, 94, 51, ${particle.opacity})`,
          }}
          animate={{
            y: [0, -window.innerHeight * 1.2],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, particle.opacity, particle.opacity, 0],
            scale: [0, 1, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
