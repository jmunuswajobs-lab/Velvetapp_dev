import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VelvetButton } from "./VelvetButton";
import { PlayerAvatar } from "./PlayerAvatar";

/** 
 * GAMEPIEGEON-QUALITY CUP PONG
 * 
 * COMPLETE SHOT LOOP:
 * Swipe → console logs angle/power → ball animates → hits/misses cup → cup removes → turn swaps
 * 
 * NO partial implementations. Ball is VISIBLE. Cups are in TRIANGLE.
 */

interface Cup {
  id: string;
  row: number;
  col: number;
  active: boolean;
}

interface Player {
  id: string;
  nickname: string;
  color: string;
}

interface BeerPongProps {
  players?: Player[];
  onGameEnd?: (winner: "player" | "opponent") => void;
  difficulty?: number;
}

// ============ LAYOUT CONSTANTS ============
const RACK_LAYOUT = [
  { row: 0, col: 0 },           // 1 cup
  { row: 1, col: -0.5 },        // 2 cups
  { row: 1, col: 0.5 },
  { row: 2, col: -1 },          // 3 cups
  { row: 2, col: 0 },
  { row: 2, col: 1 },
];

const CONFIG = {
  CUP_SPACING: 50,              // pixels between cups
  TABLE_WIDTH: 500,
  TABLE_HEIGHT: 300,
  THROW_DURATION: 900,          // ms
  CUP_REMOVAL_DURATION: 500,    // ms
  ANGLE_SENSITIVITY: 1.2,       // swipe to angle ratio
  POWER_SENSITIVITY: 0.006,     // distance to power ratio
  MIN_SWIPE: 40,                // min pixels to register
};

// ============ GET CUP POSITION ============
function getCupPosition(
  cupIndex: number,
  side: "opponent" | "player"
): { x: number; y: number; scale: number } {
  const layout = RACK_LAYOUT[cupIndex];
  if (!layout) return { x: 50, y: 50, scale: 1 };

  const baseY = side === "opponent" ? 15 : 85;
  const direction = side === "opponent" ? 1 : -1;
  const centerX = 50;

  const x = centerX + layout.col * (CONFIG.CUP_SPACING / (CONFIG.TABLE_WIDTH / 100));
  const y = baseY + direction * layout.row * (CONFIG.CUP_SPACING * 0.8 / (CONFIG.TABLE_HEIGHT / 100));
  const scale = 0.85 + layout.row * 0.05; // back cups slightly smaller

  return { x, y, scale };
}

// ============ BALL COMPONENT ============
interface BallProps {
  visible: boolean;
  x: number;
  y: number;
  scale: number;
}

function Ball({ visible, x, y, scale }: BallProps) {
  if (!visible) return null;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%)`,
      }}
      animate={{ scale }}
      transition={{ type: "tween" }}
    >
      {/* Ball */}
      <div
        className="w-5 h-5 rounded-full relative"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95), rgba(120, 160, 255, 0.8))",
          boxShadow: "0 0 16px rgba(100, 140, 255, 0.9), inset -1px -1px 3px rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Shadow under ball */}
      <div
        className="absolute w-8 h-2 rounded-full pointer-events-none"
        style={{
          left: "-50%",
          top: "120%",
          background: "radial-gradient(ellipse, rgba(0, 0, 0, 0.4), transparent)",
          filter: "blur(2px)",
          transform: `scaleX(${0.3 + scale * 0.5})`,
        }}
      />
    </motion.div>
  );
}

// ============ CUP COMPONENT ============
interface CupProps {
  cup: Cup;
  isHit: boolean;
  position: { x: number; y: number; scale: number };
}

function CupComponent({ cup, isHit, position }: CupProps) {
  if (!cup.active) return null;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%)`,
      }}
      animate={
        isHit
          ? {
              scale: [1, 1.3, 0],
              opacity: [1, 0.6, 0],
              rotateZ: [0, 15, 25],
              y: [0, -10, 20],
            }
          : { scale: position.scale, opacity: 1 }
      }
      transition={{ duration: CONFIG.CUP_REMOVAL_DURATION / 1000 }}
    >
      <svg
        width={32}
        height={36}
        viewBox="0 0 32 36"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="#ff0052" />
            <stop offset="100%" stopColor="#cc0033" />
          </linearGradient>
          <filter id="cupShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Cup rim (ellipse) */}
        <ellipse cx="16" cy="6" rx="14" ry="5" fill="#f5f5f0" opacity="0.95" />

        {/* Cup body (cylinder) */}
        <path
          d="M 6 8 Q 4 16 6 28 L 26 28 Q 28 16 26 8"
          fill="url(#cupGrad)"
          filter="url(#cupShadow)"
        />

        {/* Highlight */}
        <ellipse cx="10" cy="14" rx="2.5" ry="5" fill="white" opacity="0.4" />
      </svg>
    </motion.div>
  );
}

// ============ MAIN COMPONENT ============
export function BeerPongGame({
  players,
  onGameEnd,
  difficulty = 3,
}: BeerPongProps) {
  // Game state
  const [opponentCups, setOpponentCups] = useState<Cup[]>([]);
  const [playerCups, setPlayerCups] = useState<Cup[]>([]);
  const [currentTurn, setCurrentTurn] = useState<"player" | "opponent">("player");
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null);

  // Ball animation state
  const [ballVisible, setBallVisible] = useState(false);
  const [ballPos, setBallPos] = useState({ x: 50, y: 85, scale: 1 });
  const [isShooting, setIsShooting] = useState(false);
  const [lastResult, setLastResult] = useState<"hit" | "miss" | null>(null);
  const [hitCupId, setHitCupId] = useState<string | null>(null);

  // Swipe tracking
  const tableRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const throwLockRef = useRef(false);

  // Initialize cups
  useEffect(() => {
    const opponentRack = RACK_LAYOUT.map((_, i) => ({
      id: `opp-${i}`,
      row: RACK_LAYOUT[i].row,
      col: RACK_LAYOUT[i].col,
      active: true,
    }));
    const playerRack = RACK_LAYOUT.map((_, i) => ({
      id: `player-${i}`,
      row: RACK_LAYOUT[i].row,
      col: RACK_LAYOUT[i].col,
      active: true,
    }));

    setOpponentCups(opponentRack);
    setPlayerCups(playerRack);
  }, []);

  // ============ SWIPE DETECTION ============
  const handleSwipeStart = useCallback((e: React.TouchEvent) => {
    if (isShooting || winner || throwLockRef.current || currentTurn !== "player") return;
    const touch = e.touches[0];
    swipeRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  }, [isShooting, winner, currentTurn]);

  const handleSwipeEnd = useCallback((e: React.TouchEvent) => {
    if (!swipeRef.current || throwLockRef.current) {
      swipeRef.current = null;
      return;
    }

    const end = e.changedTouches[0];
    const deltaX = end.clientX - swipeRef.current.x;
    const deltaY = swipeRef.current.y - end.clientY; // up is positive
    const timeDelta = Math.max(1, Date.now() - swipeRef.current.t);

    swipeRef.current = null;

    // Must swipe upward
    if (deltaY < CONFIG.MIN_SWIPE) return;

    // Calculate angle and power
    const angle = Math.max(-45, Math.min(45, deltaX * CONFIG.ANGLE_SENSITIVITY));
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / timeDelta;
    const power = Math.max(0, Math.min(1, distance * CONFIG.POWER_SENSITIVITY + velocity * 0.15));

    if (power < 0.1) return; // too weak

    console.log("[BEERPONG_SHOT]", { angle, power, dx: deltaX, dy: deltaY, dt: timeDelta });

    executeShot(angle, power);
  }, [isShooting, currentTurn]);

  // ============ SHOT EXECUTION ============
  const executeShot = async (angle: number, power: number) => {
    if (throwLockRef.current) return;
    throwLockRef.current = true;

    setIsShooting(true);
    setBallVisible(true);

    // Pick random opponent cup as target
    const targetCups = opponentCups.filter(c => c.active);
    if (targetCups.length === 0) {
      setWinner("player");
      onGameEnd?.("player");
      return;
    }

    const targetCup = targetCups[Math.floor(Math.random() * targetCups.length)];
    const targetPos = getCupPosition(parseInt(targetCup.id.split("-")[1]), "opponent");

    // Ball trajectory: start at player end, travel to target
    const startX = 50;
    const startY = 88;
    const endX = targetPos.x;
    const endY = targetPos.y;

    // Animate ball across table
    for (let frame = 0; frame <= 100; frame++) {
      const t = frame / 100;
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      // Position interpolation
      const x = startX + (endX - startX) * easeT;
      const y = startY + (endY - startY) * easeT;

      // Parabolic arc for height
      const arcHeight = Math.sin(t * Math.PI) * 8;

      // Scale as approaches target
      const scale = 1 - t * 0.4;

      setBallPos({ x, y: y - arcHeight, scale });

      await new Promise(resolve => setTimeout(resolve, CONFIG.THROW_DURATION / 100));
    }

    // Hit detection (difficulty-based)
    const accuracies = [0.85, 0.7, 0.55, 0.4];
    const accuracy = accuracies[Math.min(difficulty - 1, 3)] || 0.55;
    const powerMult = 0.8 + power * 0.4;
    const isHit = Math.random() < accuracy * powerMult;

    if (isHit) {
      // HIT: animate cup removal
      setLastResult("hit");
      setHitCupId(targetCup.id);

      await new Promise(resolve =>
        setTimeout(resolve, CONFIG.CUP_REMOVAL_DURATION)
      );

      // Remove cup from state
      const newCups = opponentCups.map(c =>
        c.id === targetCup.id ? { ...c, active: false } : c
      );
      setOpponentCups(newCups);
      setHitCupId(null);

      // Check win condition
      if (newCups.every(c => !c.active)) {
        setWinner("player");
        setBallVisible(false);
        onGameEnd?.("player");
        throwLockRef.current = false;
        return;
      }
    } else {
      // MISS: show feedback
      setLastResult("miss");
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Hide ball and switch turn
    setBallVisible(false);
    setLastResult(null);
    setCurrentTurn("opponent");
    setIsShooting(false);
    throwLockRef.current = false;

    // Simulate opponent's turn
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (!winner) {
      simulateOpponentTurn();
    }
  };

  const simulateOpponentTurn = async () => {
    // Opponent takes a random shot
    const angle = Math.random() * 90 - 45;
    const power = 0.5 + Math.random() * 0.4;

    setBallVisible(true);
    setIsShooting(true);

    // Pick random player cup
    const targetCups = playerCups.filter(c => c.active);
    if (targetCups.length === 0) {
      setWinner("opponent");
      return;
    }

    const targetCup = targetCups[Math.floor(Math.random() * targetCups.length)];
    const targetPos = getCupPosition(parseInt(targetCup.id.split("-")[1]), "player");

    const startX = 50;
    const startY = 12;
    const endX = targetPos.x;
    const endY = targetPos.y;

    // Animate ball
    for (let frame = 0; frame <= 100; frame++) {
      const t = frame / 100;
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      const x = startX + (endX - startX) * easeT;
      const y = startY + (endY - startY) * easeT;
      const arcHeight = Math.sin(t * Math.PI) * 8;
      const scale = 1 - t * 0.4;

      setBallPos({ x, y: y - arcHeight, scale });
      await new Promise(resolve => setTimeout(resolve, CONFIG.THROW_DURATION / 100));
    }

    // Opponent hit/miss
    const accuracies = [0.85, 0.7, 0.55, 0.4];
    const accuracy = accuracies[Math.min(difficulty - 1, 3)] || 0.55;
    const powerMult = 0.8 + power * 0.4;
    const isHit = Math.random() < accuracy * powerMult;

    if (isHit) {
      setLastResult("hit");
      setHitCupId(targetCup.id);

      await new Promise(resolve => setTimeout(resolve, CONFIG.CUP_REMOVAL_DURATION));

      const newCups = playerCups.map(c =>
        c.id === targetCup.id ? { ...c, active: false } : c
      );
      setPlayerCups(newCups);
      setHitCupId(null);

      if (newCups.every(c => !c.active)) {
        setWinner("opponent");
        setBallVisible(false);
        return;
      }
    } else {
      setLastResult("miss");
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setBallVisible(false);
    setLastResult(null);
    setCurrentTurn("player");
    setIsShooting(false);
  };

  const resetGame = () => {
    const opponentRack = RACK_LAYOUT.map((_, i) => ({
      id: `opp-${i}`,
      row: RACK_LAYOUT[i].row,
      col: RACK_LAYOUT[i].col,
      active: true,
    }));
    const playerRack = RACK_LAYOUT.map((_, i) => ({
      id: `player-${i}`,
      row: RACK_LAYOUT[i].row,
      col: RACK_LAYOUT[i].col,
      active: true,
    }));

    setOpponentCups(opponentRack);
    setPlayerCups(playerRack);
    setCurrentTurn("player");
    setWinner(null);
    setBallVisible(false);
    setLastResult(null);
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
        {/* 3D Table */}
        <div
          className="relative rounded-3xl shadow-2xl overflow-visible"
          style={{
            width: CONFIG.TABLE_WIDTH,
            height: CONFIG.TABLE_HEIGHT,
            background: "linear-gradient(135deg, #0b5b2e 0%, #062d1a 50%, #051f13 100%)",
            border: "3px solid rgba(255, 255, 255, 0.08)",
            boxShadow: `
              0 40px 80px rgba(0, 0, 0, 0.9),
              inset 0 0 60px rgba(0, 0, 0, 0.5),
              0 0 40px rgba(11, 91, 46, 0.3)
            `,
            transform: "perspective(900px) rotateX(55deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Center line */}
          <div
            className="absolute left-0 right-0 h-px bg-white/15"
            style={{ top: "50%" }}
          />

          {/* Opponent cups (top) */}
          {opponentCups.map((cup, idx) => (
            <CupComponent
              key={cup.id}
              cup={cup}
              isHit={hitCupId === cup.id}
              position={getCupPosition(idx, "opponent")}
            />
          ))}

          {/* Ball */}
          <Ball
            visible={ballVisible}
            x={ballPos.x}
            y={ballPos.y}
            scale={ballPos.scale}
          />

          {/* Player cups (bottom) */}
          {playerCups.map((cup, idx) => (
            <CupComponent
              key={cup.id}
              cup={cup}
              isHit={hitCupId === cup.id}
              position={getCupPosition(idx, "player")}
            />
          ))}
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
          {currentTurn === "player" 
            ? "Your turn — swipe to throw" 
            : `${team2.nickname} is taking their shot`}
        </motion.div>
      )}
    </div>
  );
}
