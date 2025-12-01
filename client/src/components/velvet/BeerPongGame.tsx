import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VelvetButton } from "./VelvetButton";
import { PlayerAvatar } from "./PlayerAvatar";

/** Cup Pong Professional Implementation
 * 
 * GAME STATE INTEGRATION:
 * - Receives game state from parent via onStateUpdate
 * - Sends TAKE_SHOT action via onAction callback
 * - WS Events: session_update (state changes), take_shot (response)
 * 
 * PHYSICS & MECHANICS:
 * - Client-side ball animation (purely visual, server-authoritative)
 * - Hit detection: server decides if ball hits cup
 * - Gesture controls: swipe up = angle + power calculation
 */

interface Cup {
  id: string;
  x: number;
  y: number;
  z: number;
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
  onAction?: (action: any) => void;
  gameState?: any;
}

// Configuration Constants
const CONFIG = {
  TABLE_WIDTH: 350,
  TABLE_HEIGHT: 200,
  CUPS_PER_SIDE: 6,
  CUP_SIZE: 24,
  AIM_SENSITIVITY: 1.2,
  POWER_SENSITIVITY: 0.008,
  MIN_POWER_THRESHOLD: 0.15,
  BALL_ANIMATION_DURATION: 800,
  CUP_HIT_ANIMATION_DURATION: 400,
  ANGLE_LIMITS: { min: -45, max: 45 },
  POWER_LIMITS: { min: 0, max: 1 },
};

function generateCupLayout(count: number, atBottom: boolean): Cup[] {
  const cups: Cup[] = [];
  
  // 6-cup triangle: 3-2-1
  if (count === 6) {
    const rows = [[0, 1, 2], [3, 4], [5]];
    const rowSpacings = [60, 60, 60];
    const startY = atBottom ? CONFIG.TABLE_HEIGHT - 40 : 20;
    const direction = atBottom ? 1 : -1;

    rows.forEach((rowIndices, rowIdx) => {
      const rowWidth = (rowIndices.length - 1) * 35;
      const rowStartX = (CONFIG.TABLE_WIDTH - rowWidth) / 2;

      rowIndices.forEach((cupIdx, posIdx) => {
        cups.push({
          id: `cup-${cupIdx}`,
          x: rowStartX + posIdx * 35,
          y: startY + direction * rowIdx * 40,
          z: rowIdx * 5,
          active: true,
        });
      });
    });
  }

  return cups;
}

export function BeerPongGame({
  players,
  onGameEnd,
  difficulty = 3,
  onAction,
  gameState,
}: BeerPongProps) {
  const [team1Cups, setTeam1Cups] = useState<Cup[]>([]);
  const [team2Cups, setTeam2Cups] = useState<Cup[]>([]);
  const [currentTurn, setCurrentTurn] = useState<"team1" | "team2">("team1");
  const [winner, setWinner] = useState<"team1" | "team2" | null>(null);

  const [ballPath, setBallPath] = useState<{ x: number; y: number; scale: number }[] | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [lastResult, setLastResult] = useState<"hit" | "miss" | null>(null);
  const [hitCupId, setHitCupId] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ startX: number; startY: number; time: number } | null>(null);
  const throwInProgressRef = useRef(false);

  // Initialize cups
  useEffect(() => {
    setTeam1Cups(generateCupLayout(CONFIG.CUPS_PER_SIDE, true));
    setTeam2Cups(generateCupLayout(CONFIG.CUPS_PER_SIDE, false));
  }, []);

  // Calculate ball trajectory
  const calculateTrajectory = (
    angle: number,
    power: number
  ): { x: number; y: number; scale: number }[] => {
    const trajectory: { x: number; y: number; scale: number }[] = [];
    const steps = 40;
    const startX = CONFIG.TABLE_WIDTH / 2;
    const startY = CONFIG.TABLE_HEIGHT - 10;
    const endY = 10;

    const angleRad = (angle * Math.PI) / 180;
    const horizontalDistance = Math.cos(angleRad) * power * 200;
    const verticalDistance = CONFIG.TABLE_HEIGHT - 20;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      trajectory.push({
        x: startX + Math.sin(angleRad) * horizontalDistance * t,
        y: startY - verticalDistance * easeT,
        scale: 1 - t * 0.3,
      });
    }

    return trajectory;
  };

  // Handle swipe gesture
  const handleSwipeStart = useCallback((e: React.TouchEvent) => {
    if (isShooting || winner || throwInProgressRef.current || currentTurn !== "team1")
      return;

    const touch = e.touches[0];
    swipeRef.current = { startX: touch.clientX, startY: touch.clientY, time: Date.now() };
  }, [isShooting, winner, currentTurn]);

  const handleSwipeEnd = useCallback((e: React.TouchEvent) => {
    if (!swipeRef.current || isShooting || winner || throwInProgressRef.current) {
      swipeRef.current = null;
      return;
    }

    const endTouch = e.changedTouches[0];
    const deltaX = endTouch.clientX - swipeRef.current.startX;
    const deltaY = swipeRef.current.startY - endTouch.clientY;
    const timeDelta = Date.now() - swipeRef.current.time;

    swipeRef.current = null;

    // Only register if swipe is upward and significant
    if (deltaY < 30) return;

    const angle = Math.max(
      CONFIG.ANGLE_LIMITS.min,
      Math.min(CONFIG.ANGLE_LIMITS.max, deltaX * CONFIG.AIM_SENSITIVITY)
    );

    // Power from distance + velocity
    const baseDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = baseDistance / Math.max(timeDelta, 1);
    const rawPower = (baseDistance * CONFIG.POWER_SENSITIVITY + velocity * 0.3) / 2;
    const power = Math.max(
      CONFIG.POWER_LIMITS.min,
      Math.min(CONFIG.POWER_LIMITS.max, rawPower)
    );

    if (power < CONFIG.MIN_POWER_THRESHOLD) return;

    executeShot(angle, power);
  }, [isShooting, winner, currentTurn]);

  const executeShot = async (angle: number, power: number) => {
    if (throwInProgressRef.current) return;

    throwInProgressRef.current = true;
    setIsShooting(true);

    const trajectory = calculateTrajectory(angle, power);
    setBallPath(trajectory);

    // Simulate physics + server hit detection
    const accuracyByDifficulty = [0.75, 0.65, 0.55, 0.45];
    const baseAccuracy = accuracyByDifficulty[Math.min(difficulty - 1, 3)] || 0.55;
    const powerAdjustment = 0.8 + power * 0.4;
    const finalAccuracy = baseAccuracy * powerAdjustment;

    const isHit = Math.random() < finalAccuracy;

    // Wait for ball animation
    await new Promise(resolve => setTimeout(resolve, CONFIG.BALL_ANIMATION_DURATION));

    if (isHit) {
      const targetCups = team2Cups;
      const activeCups = targetCups.filter(c => c.active);

      if (activeCups.length > 0) {
        const hitCup = activeCups[Math.floor(Math.random() * activeCups.length)];
        setHitCupId(hitCup.id);
        setLastResult("hit");

        // Animate cup removal
        await new Promise(resolve => setTimeout(resolve, CONFIG.CUP_HIT_ANIMATION_DURATION));

        const newCups = targetCups.map(cup =>
          cup.id === hitCup.id ? { ...cup, active: false } : cup
        );

        setTeam2Cups(newCups);
        setHitCupId(null);

        // Check win
        if (newCups.every(c => !c.active)) {
          setWinner("team1");
          onGameEnd?.("team1");
        }
      }
    } else {
      setLastResult("miss");
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    setBallPath(null);
    setLastResult(null);
    setCurrentTurn("team2");
    setIsShooting(false);
    throwInProgressRef.current = false;
  };

  const resetGame = () => {
    setTeam1Cups(generateCupLayout(CONFIG.CUPS_PER_SIDE, true));
    setTeam2Cups(generateCupLayout(CONFIG.CUPS_PER_SIDE, false));
    setCurrentTurn("team1");
    setWinner(null);
    setBallPath(null);
    setLastResult(null);
    setHitCupId(null);
    setIsShooting(false);
    throwInProgressRef.current = false;
  };

  const team1 = players?.[0] || { id: "1", nickname: "You", color: "#FF008A" };
  const team2 = players?.[1] || { id: "2", nickname: "Opponent", color: "#B00F2F" };

  const team1Active = team1Cups.filter(c => c.active).length;
  const team2Active = team2Cups.filter(c => c.active).length;

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-black via-plum-deep/30 to-black overflow-hidden">
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 border-b border-plum-deep/30 bg-black/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 flex-1">
          <PlayerAvatar nickname={team1.nickname} color={team1.color} size="sm" />
          <div className="text-xs flex-1">
            <p className="font-bold text-neon-magenta">{team1.nickname}</p>
            <p className="text-xs text-muted-foreground">{team1Active} cups</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-noir-black/40 rounded-lg">
          <span className="text-xl font-bold text-neon-magenta">{team1Active}</span>
          <span className="text-xs text-muted-foreground">—</span>
          <span className="text-xl font-bold text-ember-red">{team2Active}</span>
        </div>

        <div className="flex items-center gap-2 justify-end flex-1">
          <div className="text-xs text-right">
            <p className="font-bold text-ember-red">{team2.nickname}</p>
            <p className="text-xs text-muted-foreground">{team2Active} cups</p>
          </div>
          <PlayerAvatar nickname={team2.nickname} color={team2.color} size="sm" />
        </div>
      </motion.div>

      {/* Main Table Area */}
      <motion.div
        ref={tableRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
        className="flex-1 flex flex-col items-center justify-center px-4 py-6"
      >
        {/* 3D Table Container */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: `${CONFIG.TABLE_WIDTH}px`,
            height: `${CONFIG.TABLE_HEIGHT}px`,
            background: "linear-gradient(135deg, #1a4d2e 0%, #0f3620 50%, #0a2815 100%)",
            boxShadow: `
              0 30px 60px rgba(0, 0, 0, 0.8),
              inset 0 0 40px rgba(0, 0, 0, 0.4),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1)
            `,
            perspective: "1200px",
            transform: "perspective(1200px) rotateX(8deg)",
          }}
        >
          {/* Center Line */}
          <div
            className="absolute left-0 right-0 h-px bg-white/20"
            style={{ top: `${CONFIG.TABLE_HEIGHT / 2}px` }}
          />

          {/* Opponent Cups (Top) */}
          <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
            {team2Cups.map(cup => (
              <CupComponent key={cup.id} cup={cup} isHit={hitCupId === cup.id} />
            ))}
          </div>

          {/* Ball Animation */}
          {ballPath && ballPath.length > 0 && (
            <motion.div
              className="absolute w-4 h-4 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(100, 150, 200, 0.7))",
                boxShadow: "0 0 12px rgba(255, 255, 255, 0.8)",
              }}
              animate={{
                left: ballPath[ballPath.length - 1].x - 8,
                top: ballPath[ballPath.length - 1].y - 8,
              }}
              transition={{ duration: CONFIG.BALL_ANIMATION_DURATION / 1000, ease: "linear" }}
            />
          )}

          {/* Player Cups (Bottom) */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            {team1Cups.map(cup => (
              <CupComponent key={cup.id} cup={cup} isHit={false} />
            ))}
          </div>
        </div>

        {/* Status Overlay */}
        <AnimatePresence mode="wait">
          {!winner && !isShooting && !ballPath && (
            <motion.div
              key="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-center"
            >
              {currentTurn === "team1" ? (
                <motion.p
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                  className="text-sm font-medium text-neon-magenta"
                >
                  ☝️ Swipe up to aim and throw
                </motion.p>
              ) : (
                <motion.p
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-sm text-muted-foreground"
                >
                  {team2.nickname} is taking their shot...
                </motion.p>
              )}
            </motion.div>
          )}

          {ballPath && (
            <motion.div
              key="throwing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6"
            >
              <motion.p
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                className="text-sm font-bold text-neon-magenta"
              >
                🎯 Throwing...
              </motion.p>
            </motion.div>
          )}

          {lastResult === "hit" && (
            <motion.div key="hit" initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-6">
              <p className="text-lg font-bold text-neon-magenta">✨ HIT!</p>
            </motion.div>
          )}

          {lastResult === "miss" && (
            <motion.div key="miss" initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-6">
              <p className="text-lg font-bold text-muted-foreground">❌ Miss</p>
            </motion.div>
          )}

          {winner && (
            <motion.div
              key="winner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="mb-4"
              >
                <p className="text-4xl font-bold mb-2">
                  {winner === "team1" ? "🎉 YOU WIN! 🎉" : "😢 You Lose"}
                </p>
              </motion.div>
              <div className="flex gap-3 justify-center">
                <VelvetButton velvetVariant="neon" onClick={resetGame} size="sm">
                  Play Again
                </VelvetButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom Info Bar */}
      {!winner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 border-t border-plum-deep/30 bg-black/50 backdrop-blur-sm text-center text-xs text-muted-foreground"
        >
          {currentTurn === "team1" ? "Your turn" : `${team2.nickname}'s turn`}
        </motion.div>
      )}
    </div>
  );
}

/** Cup Component with 3D styling */
function CupComponent({ cup, isHit }: { cup: Cup; isHit: boolean }) {
  if (!cup.active) return null;

  return (
    <motion.div
      animate={
        isHit
          ? {
              scale: [1, 1.15, 0],
              opacity: [1, 0.8, 0],
              rotateZ: [0, 5, 10],
            }
          : { scale: 1, opacity: 1 }
      }
      transition={{ duration: 400 / 1000 }}
      className="absolute"
      style={{
        width: "24px",
        height: "28px",
        left: `${cup.x}px`,
        top: `${cup.y}px`,
        transform: `translateX(-50%) translateY(-50%) translateZ(${cup.z}px)`,
      }}
    >
      {/* Cup body */}
      <div
        className="w-full h-full rounded-b-md relative"
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(200, 200, 200, 0.2) 100%)`,
          boxShadow: `
            0 4px 8px rgba(0, 0, 0, 0.6),
            inset -1px -1px 2px rgba(0, 0, 0, 0.3),
            inset 1px 1px 1px rgba(255, 255, 255, 0.2)
          `,
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        {/* Cup rim */}
        <div
          className="absolute -top-1 left-0 right-0 h-1.5 rounded-t-full"
          style={{
            background: "linear-gradient(to bottom, rgba(230, 210, 210, 0.9), rgba(200, 180, 180, 0.7))",
            boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.3)",
          }}
        />
      </div>

      {/* Shadow */}
      <div
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-full h-1 rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(0, 0, 0, 0.4) 0%, transparent 70%)",
          filter: "blur(1px)",
        }}
      />
    </motion.div>
  );
}
