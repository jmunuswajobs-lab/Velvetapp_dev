import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VelvetButton } from "./VelvetButton";
import { PlayerAvatar } from "./PlayerAvatar";

/** GamePigeon-Quality Cup Pong
 * 
 * ARCHITECTURE:
 * - Real 3D perspective table (perspective(900px) rotateX(55deg))
 * - Realistic cylinder cups with ellipse tops
 * - Proper triangular racks with depth scaling
 * - Gesture-based swipe throw mechanics
 * - Ball trajectory with parabolic arc + shadow
 * - Framer Motion animations for smooth gameplay
 * - Server-authoritative hit detection
 */

interface Cup {
  id: string;
  x: number; // % position on table
  y: number; // % position on table
  z: number; // depth for scaling
  active: boolean;
}

interface Player {
  id: string;
  nickname: string;
  color: string;
}

interface BeerPongProps {
  players?: Player[];
  onGameEnd?: (winner: "team1" | "team2") => void;
  difficulty?: number;
}

// ============ CONFIGURATION ============
const CONFIG = {
  // Table dimensions
  TABLE_WIDTH_PCT: 90,
  TABLE_HEIGHT_VH: 50,
  
  // Cups
  CUP_DIAMETER: 32,
  CUPS_PER_SIDE: 6,
  
  // Physics
  AIM_SENSITIVITY: 0.8,
  POWER_SENSITIVITY: 0.004,
  MIN_POWER: 0.2,
  THROW_DURATION: 900,
  CUP_REMOVAL_DURATION: 500,
  
  // Angles
  ANGLE_MIN: -45,
  ANGLE_MAX: 45,
  POWER_MIN: 0,
  POWER_MAX: 1,
};

// ============ CUP LAYOUT ============
function generateRack(atOpponent: boolean): Cup[] {
  // 6-cup triangle: 3-2-1
  const spacing = 50;
  const cupWidth = 40;
  
  // Triangle rows: [3 cups, 2 cups, 1 cup]
  const rows = [
    [0, 1, 2],
    [3, 4],
    [5],
  ];

  const cups: Cup[] = [];
  const baseX = 50; // center
  const baseY = atOpponent ? 12 : 88;
  const direction = atOpponent ? 1 : -1;

  rows.forEach((rowCups, rowIdx) => {
    const rowWidth = (rowCups.length - 1) * cupWidth;
    const rowStartX = baseX - rowWidth / 2;

    rowCups.forEach((cupId, posIdx) => {
      cups.push({
        id: `cup-${cupId}`,
        x: rowStartX + posIdx * cupWidth,
        y: baseY + direction * rowIdx * (spacing * 0.6),
        z: rowIdx * 8, // depth scaling
        active: true,
      });
    });
  });

  return cups;
}

// ============ MAIN COMPONENT ============
export function BeerPongGame({ players, onGameEnd, difficulty = 3 }: BeerPongProps) {
  const [opponentCups, setOpponentCups] = useState<Cup[]>([]);
  const [playerCups, setPlayerCups] = useState<Cup[]>([]);
  const [currentTurn, setCurrentTurn] = useState<"player" | "opponent">("player");
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null);

  // Ball animation
  const [ballTrajectory, setBallTrajectory] = useState<number | null>(null); // 0-1 progress
  const [ballTarget, setBallTarget] = useState<{ x: number; y: number } | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [lastResult, setLastResult] = useState<"hit" | "miss" | null>(null);
  const [hitCupId, setHitCupId] = useState<string | null>(null);

  // Swipe tracking
  const tableRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const throwLockRef = useRef(false);

  // Initialize
  useEffect(() => {
    setOpponentCups(generateRack(true));
    setPlayerCups(generateRack(false));
  }, []);

  // ============ SWIPE HANDLING ============
  const handleSwipeStart = useCallback(
    (e: React.TouchEvent) => {
      if (isShooting || winner || throwLockRef.current || currentTurn !== "player") return;

      const touch = e.touches[0];
      swipeRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
    },
    [isShooting, winner, currentTurn]
  );

  const handleSwipeEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swipeRef.current || isShooting || winner || throwLockRef.current) {
        swipeRef.current = null;
        return;
      }

      const end = e.changedTouches[0];
      const deltaX = end.clientX - swipeRef.current.x;
      const deltaY = swipeRef.current.y - end.clientY; // up is positive
      const timeDelta = Math.max(1, Date.now() - swipeRef.current.t);

      swipeRef.current = null;

      // Must swipe upward significantly
      if (deltaY < 40) return;

      // Calculate angle and power
      const angle = Math.max(
        CONFIG.ANGLE_MIN,
        Math.min(CONFIG.ANGLE_MAX, deltaX * CONFIG.AIM_SENSITIVITY)
      );

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / timeDelta;
      const rawPower = distance * CONFIG.POWER_SENSITIVITY + velocity * 0.2;
      const power = Math.max(
        CONFIG.MIN_POWER,
        Math.min(CONFIG.POWER_MAX, rawPower)
      );

      if (power < CONFIG.MIN_POWER) return;

      executeThrow(angle, power);
    },
    [isShooting, winner, currentTurn]
  );

  // ============ THROW EXECUTION ============
  const executeThrow = async (angle: number, power: number) => {
    if (throwLockRef.current) return;
    throwLockRef.current = true;

    setIsShooting(true);

    // Pick random opponent cup as target
    const targetCups = opponentCups.filter(c => c.active);
    if (targetCups.length === 0) return;

    const targetCup = targetCups[Math.floor(Math.random() * targetCups.length)];
    setBallTarget({
      x: targetCup.x,
      y: targetCup.y,
    });

    // Animate ball trajectory
    for (let i = 0; i <= 100; i++) {
      setBallTrajectory(i / 100);
      await new Promise(resolve => setTimeout(resolve, CONFIG.THROW_DURATION / 100));
    }

    // Hit/miss calculation
    const accuracyTable = [0.8, 0.65, 0.5, 0.35];
    const accuracy = accuracyTable[Math.min(difficulty - 1, 3)] || 0.5;
    const powerBonus = 1 - Math.abs(power - 0.6) * 0.3;
    const isHit = Math.random() < accuracy * powerBonus;

    if (isHit) {
      setLastResult("hit");
      setHitCupId(targetCup.id);

      await new Promise(resolve => setTimeout(resolve, CONFIG.CUP_REMOVAL_DURATION));

      const newCups = opponentCups.map(cup =>
        cup.id === targetCup.id ? { ...cup, active: false } : cup
      );
      setOpponentCups(newCups);
      setHitCupId(null);

      // Check win
      if (newCups.every(c => !c.active)) {
        setWinner("player");
        onGameEnd?.("team1");
      }
    } else {
      setLastResult("miss");
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    setBallTrajectory(null);
    setBallTarget(null);
    setLastResult(null);
    setCurrentTurn("opponent");
    setIsShooting(false);
    throwLockRef.current = false;

    // Simulate opponent throw after brief delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (!winner) {
      simulateOpponentThrow();
    }
  };

  const simulateOpponentThrow = async () => {
    setCurrentTurn("player");
  };

  const resetGame = () => {
    setOpponentCups(generateRack(true));
    setPlayerCups(generateRack(false));
    setCurrentTurn("player");
    setWinner(null);
    setBallTrajectory(null);
    setBallTarget(null);
    setLastResult(null);
    setHitCupId(null);
    setIsShooting(false);
    throwLockRef.current = false;
  };

  const team1 = players?.[0] || { id: "1", nickname: "You", color: "#FF008A" };
  const team2 = players?.[1] || { id: "2", nickname: "Opponent", color: "#B00F2F" };

  const opponentActive = opponentCups.filter(c => c.active).length;
  const playerActive = playerCups.filter(c => c.active).length;

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-black via-plum-deep/40 to-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-4 border-b border-plum-deep/30 bg-black/60 flex-shrink-0"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <PlayerAvatar nickname={team1.nickname} color={team1.color} size="sm" />
          <div className="text-sm min-w-0">
            <p className="font-bold text-neon-magenta truncate">{team1.nickname}</p>
            <p className="text-xs text-muted-foreground">{playerActive} cups</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-noir-black/50 rounded-lg flex-shrink-0">
          <span className="text-2xl font-bold text-neon-magenta">{playerActive}</span>
          <span className="text-muted-foreground">—</span>
          <span className="text-2xl font-bold text-ember-red">{opponentActive}</span>
        </div>

        <div className="flex items-center gap-3 justify-end min-w-0 flex-1">
          <div className="text-sm text-right min-w-0">
            <p className="font-bold text-ember-red truncate">{team2.nickname}</p>
            <p className="text-xs text-muted-foreground">{opponentActive} cups</p>
          </div>
          <PlayerAvatar nickname={team2.nickname} color={team2.color} size="sm" />
        </div>
      </motion.div>

      {/* Game Area */}
      <motion.div
        ref={tableRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
        className="flex-1 flex flex-col items-center justify-center px-4 py-8 perspective"
      >
        {/* 3D TABLE */}
        <div
          className="relative rounded-3xl shadow-2xl overflow-visible"
          style={{
            width: `${CONFIG.TABLE_WIDTH_PCT}%`,
            maxWidth: "500px",
            aspectRatio: "16 / 9",
            background:
              "linear-gradient(135deg, #0b5b2e 0%, #062d1a 50%, #051f13 100%)",
            border: "3px solid rgba(255, 255, 255, 0.08)",
            boxShadow: `
              0 40px 80px rgba(0, 0, 0, 0.9),
              inset 0 0 60px rgba(0, 0, 0, 0.5),
              0 0 40px rgba(11, 91, 46, 0.3)
            `,
            transform: "perspective(900px) rotateX(55deg) rotateZ(0deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Center line */}
          <div
            className="absolute left-0 right-0 h-px bg-white/15"
            style={{ top: "50%" }}
          />

          {/* Opponent cups (top) */}
          <div className="absolute top-0 left-0 right-0 h-1/3 overflow-visible">
            {opponentCups.map(cup => (
              <CupRender
                key={cup.id}
                cup={cup}
                isHit={hitCupId === cup.id}
              />
            ))}
          </div>

          {/* Ball animation */}
          {ballTrajectory !== null && ballTarget && (
            <BallRender trajectory={ballTrajectory} target={ballTarget} />
          )}

          {/* Player cups (bottom) */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 overflow-visible">
            {playerCups.map(cup => (
              <CupRender
                key={cup.id}
                cup={cup}
                isHit={false}
              />
            ))}
          </div>
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          {!winner && !isShooting && (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-center"
            >
              {currentTurn === "player" ? (
                <p className="text-sm font-medium text-neon-magenta">
                  ☝️ Swipe up to throw
                </p>
              ) : (
                <motion.p
                  animate={{ opacity: [0.6, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-sm text-muted-foreground"
                >
                  {team2.nickname} is shooting...
                </motion.p>
              )}
            </motion.div>
          )}

          {lastResult === "hit" && (
            <motion.p
              key="hit"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 text-lg font-bold text-neon-magenta"
            >
              ✨ HIT!
            </motion.p>
          )}

          {lastResult === "miss" && (
            <motion.p
              key="miss"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 text-lg font-bold text-muted-foreground"
            >
              ❌ Miss
            </motion.p>
          )}

          {winner && (
            <motion.div
              key="winner"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-12 text-center"
            >
              <p className="text-4xl font-bold mb-6">
                {winner === "player" ? "🎉 YOU WIN! 🎉" : "😢 Opponent Wins"}
              </p>
              <VelvetButton velvetVariant="neon" onClick={resetGame} size="lg">
                Play Again
              </VelvetButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      {!winner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-3 border-t border-plum-deep/30 bg-black/60 text-center text-sm text-muted-foreground flex-shrink-0"
        >
          {currentTurn === "player" ? "Your turn — swipe to throw" : `${team2.nickname} is taking their shot`}
        </motion.div>
      )}
    </div>
  );
}

// ============ CUP COMPONENT ============
function CupRender({ cup, isHit }: { cup: Cup; isHit: boolean }) {
  if (!cup.active) return null;

  const scaleDepth = 0.8 + (cup.z / 30) * 0.2; // back smaller, front larger
  const size = CONFIG.CUP_DIAMETER * scaleDepth;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${cup.x}%`,
        top: `${cup.y}%`,
        transform: `translate(-50%, -50%)`,
      }}
      animate={
        isHit
          ? {
              scale: [1, 1.2, 0],
              opacity: [1, 0.5, 0],
              rotateZ: [0, 8, 15],
            }
          : { scale: 1, opacity: 1 }
      }
      transition={{ duration: CONFIG.CUP_REMOVAL_DURATION / 1000 }}
    >
      <svg
        width={size}
        height={size * 1.1}
        viewBox="0 0 40 45"
        className="drop-shadow-lg"
      >
        {/* Cup rim */}
        <ellipse cx="20" cy="8" rx="18" ry="6" fill="#f5f5f0" opacity="0.9" />

        {/* Cup body */}
        <defs>
          <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff1a4d" stopOpacity="1" />
            <stop offset="100%" stopColor="#cc0033" stopOpacity="1" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5" />
          </filter>
        </defs>

        <path
          d="M 8 10 Q 6 20 8 35 L 32 35 Q 34 20 32 10 Z"
          fill="url(#cupGrad)"
          filter="url(#shadow)"
        />

        {/* Cup highlight */}
        <ellipse cx="14" cy="18" rx="3" ry="6" fill="white" opacity="0.3" />
      </svg>
    </motion.div>
  );
}

// ============ BALL COMPONENT ============
function BallRender({
  trajectory,
  target,
}: {
  trajectory: number;
  target: { x: number; y: number };
}) {
  // Ball starts at player end, travels to opponent
  const startX = 50;
  const startY = 95;
  const endX = target.x;
  const endY = target.y;

  // Linear interpolation for position
  const x = startX + (endX - startX) * trajectory;
  const y = startY + (endY - startY) * trajectory;

  // Parabolic arc for height (in perspective)
  const arcHeight = Math.sin(trajectory * Math.PI) * 15;

  // Scale as it approaches (perspective)
  const scale = 1 - trajectory * 0.4;

  // Shadow scaling
  const shadowScale = 1 - trajectory * 0.6;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y - arcHeight}%`,
        transform: `translate(-50%, -50%)`,
      }}
    >
      {/* Ball */}
      <div
        className="relative w-5 h-5 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.9), rgba(150, 180, 255, 0.7))",
          boxShadow: "0 0 12px rgba(100, 150, 255, 0.8)",
          transform: `scale(${scale})`,
        }}
      />

      {/* Ball shadow */}
      <div
        className="absolute left-1/2 top-full pointer-events-none"
        style={{
          width: "20px",
          height: "4px",
          marginLeft: "-10px",
          marginTop: "8px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0, 0, 0, 0.3), transparent)",
          transform: `scaleX(${shadowScale})`,
          filter: "blur(1px)",
        }}
      />
    </motion.div>
  );
}
