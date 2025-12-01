import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VelvetButton } from "./VelvetButton";
import { PlayerAvatar } from "./PlayerAvatar";

interface Cup {
  id: string;
  x: number;
  y: number;
  active: boolean;
}

interface BeerPongProps {
  onGameEnd?: (winner: "team1" | "team2") => void;
  difficulty?: number;
  players?: Array<{ id: string; nickname: string; avatarColor: string }>;
}

export function BeerPongGame({ onGameEnd, difficulty = 3, players }: BeerPongProps) {
  const [team1Cups, setTeam1Cups] = useState<Cup[]>([]);
  const [team2Cups, setTeam2Cups] = useState<Cup[]>([]);
  const [currentTeam, setCurrentTeam] = useState<"team1" | "team2">("team1");
  const [winner, setWinner] = useState<"team1" | "team2" | null>(null);

  const [aimAngle, setAimAngle] = useState(0);
  const [power, setPower] = useState(0);
  const [isShooting, setIsShooting] = useState(false);
  const [lastResult, setLastResult] = useState<"hit" | "miss" | null>(null);
  const [ballTrajectory, setBallTrajectory] = useState<{ x: number; y: number; z: number }[] | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Initialize cups in triangle
  useEffect(() => {
    const generateCups = (): Cup[] => {
      const cups: Cup[] = [];
      const spacing = 32;
      const startX = 50;
      const startY = 20;

      const rows = [1, 2, 3];
      let cupId = 0;

      rows.forEach((count, rowIdx) => {
        const rowStartX = startX - ((count - 1) * spacing) / 2;
        for (let i = 0; i < count; i++) {
          cups.push({
            id: `cup-${cupId}`,
            x: rowStartX + i * spacing,
            y: startY + rowIdx * spacing,
            active: true,
          });
          cupId++;
        }
      });

      return cups;
    };

    setTeam1Cups(generateCups());
    setTeam2Cups(generateCups());
  }, []);

  // Handle swipe gesture
  const handleSwipeStart = (e: React.TouchEvent) => {
    if (isShooting || winner) return;
    const touch = e.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleSwipeMove = (e: React.TouchEvent) => {
    if (!swipeStartRef.current || isShooting || winner) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStartRef.current.x;
    const deltaY = swipeStartRef.current.y - touch.clientY; // Upward is positive

    if (deltaY > 30) {
      // Swipe detected
      const angle = Math.atan2(deltaX, deltaY) * (180 / Math.PI);
      const swipeDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const newPower = Math.min(1, swipeDistance / 200);

      setAimAngle(Math.max(-45, Math.min(45, angle)));
      setPower(newPower);
    }
  };

  const handleSwipeEnd = (e: React.TouchEvent) => {
    if (!swipeStartRef.current || isShooting || winner || currentTeam !== "team1") return;

    const deltaY = swipeStartRef.current.y - (e.changedTouches[0]?.clientY || 0);
    if (deltaY > 30) {
      handleThrow();
    }
    swipeStartRef.current = null;
  };

  // Simulate ball trajectory
  const animateBall = (angle: number, pwr: number) => {
    const trajectory: { x: number; y: number; z: number }[] = [];
    const steps = 30;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const radians = (angle * Math.PI) / 180;

      trajectory.push({
        x: 50 + Math.sin(radians) * pwr * 80 * t,
        y: 60 - Math.cos(radians) * pwr * 40 * t - (t * t * 40),
        z: (t * (1 - t)) * 40, // Arc height
      });
    }

    setBallTrajectory(trajectory);
  };

  const handleThrow = async () => {
    if (isShooting || power === 0 || currentTeam !== "team1") return;

    setIsShooting(true);
    animateBall(aimAngle, power);

    // Simulate server-side hit detection
    const accuracyChances = [0.7, 0.6, 0.5, 0.4];
    const baseAccuracy = accuracyChances[difficulty - 1] || 0.6;
    const powerAdjustment = 1 - power * 0.15;
    const finalAccuracy = baseAccuracy * powerAdjustment;

    const isHit = Math.random() < finalAccuracy;

    await new Promise(resolve => setTimeout(resolve, 800));

    if (isHit) {
      const targetCups = team2Cups;
      const activeCups = targetCups.filter(c => c.active);

      if (activeCups.length > 0) {
        const hitCup = activeCups[Math.floor(Math.random() * activeCups.length)];
        const newCups = targetCups.map(cup =>
          cup.id === hitCup.id ? { ...cup, active: false } : cup
        );

        setTeam2Cups(newCups);
        setLastResult("hit");

        if (newCups.every(c => !c.active)) {
          setWinner("team1");
          onGameEnd?.("team1");
        }
      }
    } else {
      setLastResult("miss");
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    setBallTrajectory(null);
    setCurrentTeam("team2");
    setAimAngle(0);
    setPower(0);
    setLastResult(null);
    setIsShooting(false);
  };

  const resetGame = () => {
    const generateCups = (): Cup[] => {
      const cups: Cup[] = [];
      const spacing = 32;
      const startX = 50;
      const startY = 20;

      const rows = [1, 2, 3];
      let cupId = 0;

      rows.forEach((count, rowIdx) => {
        const rowStartX = startX - ((count - 1) * spacing) / 2;
        for (let i = 0; i < count; i++) {
          cups.push({
            id: `cup-${cupId}`,
            x: rowStartX + i * spacing,
            y: startY + rowIdx * spacing,
            active: true,
          });
          cupId++;
        }
      });

      return cups;
    };

    setTeam1Cups(generateCups());
    setTeam2Cups(generateCups());
    setCurrentTeam("team1");
    setWinner(null);
    setAimAngle(0);
    setPower(0);
    setLastResult(null);
    setBallTrajectory(null);
    setIsShooting(false);
  };

  const team1 = players?.[0] || { id: "1", nickname: "You", avatarColor: "#FF008A" };
  const team2 = players?.[1] || { id: "2", nickname: "Opponent", avatarColor: "#B00F2F" };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-black via-plum-deep/30 to-black">
      {/* Top Bar - Player Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 border-b border-plum-deep/30 bg-black/40"
      >
        <div className="flex items-center gap-2">
          <PlayerAvatar color={team1.avatarColor} size="sm" />
          <div className="text-sm">
            <p className="font-bold text-neon-magenta">{team1.nickname}</p>
            <p className="text-xs text-muted-foreground">{team1Cups.filter(c => c.active).length} cups</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-neon-magenta">
            {team1Cups.filter(c => c.active).length}
          </p>
          <p className="text-xs text-muted-foreground">vs</p>
          <p className="text-2xl font-bold text-ember-red">
            {team2Cups.filter(c => c.active).length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-right">
            <p className="font-bold text-ember-red">{team2.nickname}</p>
            <p className="text-xs text-muted-foreground">{team2Cups.filter(c => c.active).length} cups</p>
          </div>
          <PlayerAvatar color={team2.avatarColor} size="sm" />
        </div>
      </motion.div>

      {/* Main Table Area */}
      <motion.div
        ref={tableRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center px-4 py-6 perspective"
        style={{
          perspective: "1200px",
        }}
        onTouchStart={handleSwipeStart}
        onTouchMove={handleSwipeMove}
        onTouchEnd={handleSwipeEnd}
      >
        {/* 3D Table */}
        <motion.div
          className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1a4d2e 0%, #0f3620 100%)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7), inset 0 0 40px rgba(0, 0, 0, 0.3)",
            border: "2px solid rgba(255, 255, 255, 0.1)",
            transform: "perspective(1000px) rotateX(15deg)",
          }}
        >
          {/* Center Line */}
          <div
            className="absolute top-0 left-0 right-0 h-px bg-white/20"
            style={{ top: "50%" }}
          />

          {/* Opponent Cups (Top) */}
          <motion.div className="absolute top-4 left-0 right-0 flex justify-center gap-2">
            <div className="flex flex-col gap-1">
              {team2Cups
                .filter((_, i) => i < 1)
                .map(cup => (
                  <Cup key={cup.id} cup={cup} isHit={lastResult === "hit" && currentTeam === "team1"} />
                ))}
            </div>
            <div className="flex flex-col gap-1">
              {team2Cups
                .filter((_, i) => i >= 1 && i < 3)
                .map(cup => (
                  <Cup key={cup.id} cup={cup} isHit={lastResult === "hit" && currentTeam === "team1"} />
                ))}
            </div>
            <div className="flex flex-col gap-1">
              {team2Cups
                .filter((_, i) => i >= 3)
                .map(cup => (
                  <Cup key={cup.id} cup={cup} isHit={lastResult === "hit" && currentTeam === "team1"} />
                ))}
            </div>
          </motion.div>

          {/* Ball Animation */}
          {ballTrajectory && (
            <motion.div
              className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-white to-gray-400"
              style={{
                left: `${ballTrajectory[ballTrajectory.length - 1].x}%`,
                top: `${ballTrajectory[ballTrajectory.length - 1].y}%`,
                boxShadow: "0 0 8px rgba(255, 255, 255, 0.6)",
              }}
              animate={{ scale: [1, 0.8, 0.6] }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Player Cups (Bottom) */}
          <motion.div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            <div className="flex flex-col gap-1">
              {team1Cups
                .filter((_, i) => i < 1)
                .map(cup => (
                  <Cup key={cup.id} cup={cup} isHit={false} />
                ))}
            </div>
            <div className="flex flex-col gap-1">
              {team1Cups
                .filter((_, i) => i >= 1 && i < 3)
                .map(cup => (
                  <Cup key={cup.id} cup={cup} isHit={false} />
                ))}
            </div>
            <div className="flex flex-col gap-1">
              {team1Cups
                .filter((_, i) => i >= 3)
                .map(cup => (
                  <Cup key={cup.id} cup={cup} isHit={false} />
                ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Status Message */}
        <AnimatePresence mode="wait">
          {!winner && !isShooting && (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 text-center"
            >
              {lastResult === "hit" ? (
                <motion.p className="text-lg font-bold text-neon-magenta">✨ HIT!</motion.p>
              ) : lastResult === "miss" ? (
                <motion.p className="text-lg font-bold text-muted-foreground">❌ MISS</motion.p>
              ) : currentTeam === "team1" ? (
                <p className="text-sm text-muted-foreground">Swipe up to aim and throw</p>
              ) : (
                <motion.p animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-sm text-muted-foreground">
                  {team2.nickname} is taking their shot...
                </motion.p>
              )}
            </motion.div>
          )}

          {isShooting && (
            <motion.div
              key="throwing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <motion.p animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="text-lg font-bold text-neon-magenta">
                🎯 Throwing...
              </motion.p>
            </motion.div>
          )}

          {winner && (
            <motion.div
              key="winner"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 text-center"
            >
              <p className="text-3xl font-bold mb-4">
                {winner === "team1" ? "🎉 YOU WIN! 🎉" : "😢 Opponent Wins"}
              </p>
              <VelvetButton velvetVariant="neon" onClick={resetGame} size="lg">
                🔄 Play Again
              </VelvetButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Controls - Only show when it's your turn */}
      {currentTeam === "team1" && !winner && !isShooting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 space-y-3 bg-black/40 border-t border-plum-deep/30"
        >
          {/* Aim Slider */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2">AIM: {aimAngle.toFixed(0)}°</label>
            <div className="flex gap-2 items-center">
              <span className="text-xs">←</span>
              <input
                type="range"
                min="-45"
                max="45"
                value={aimAngle}
                onChange={e => setAimAngle(Number(e.target.value))}
                className="flex-1 h-2 bg-black/40 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgba(255, 0, 138, 0.3) 0%, rgba(255, 0, 138, 0.7) ${((aimAngle + 45) / 90) * 100}%, rgba(255, 0, 138, 0.3) 100%)`,
                }}
              />
              <span className="text-xs">→</span>
            </div>
          </div>

          {/* Power Slider */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2">POWER: {(power * 100).toFixed(0)}%</label>
            <div className="w-full h-4 bg-black/40 rounded-lg overflow-hidden border border-neon-magenta/30">
              <motion.div
                animate={{ width: `${power * 100}%` }}
                className="h-full bg-gradient-to-r from-neon-magenta to-ember-red"
              />
            </div>
          </div>

          {/* Throw Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleThrow}
            disabled={power === 0}
            className="w-full p-3 bg-gradient-to-r from-neon-magenta to-ember-red text-white font-bold rounded-lg hover:shadow-lg hover:shadow-neon-magenta/50 disabled:opacity-50 transition-all"
          >
            🎱 THROW
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

// Cup Component
function Cup({ cup, isHit }: { cup: Cup; isHit: boolean }) {
  if (!cup.active) return null;

  return (
    <motion.div
      animate={
        isHit
          ? {
              scale: [1, 1.1, 0],
              opacity: [1, 0.8, 0],
              y: [0, -10, 20],
            }
          : { scale: 1, opacity: 1 }
      }
      transition={{ duration: 0.4 }}
      className="w-6 h-8 rounded-md relative"
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(200, 200, 200, 0.6))",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
      }}
    >
      {/* Cup rim */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-md"
        style={{
          background: "linear-gradient(to right, rgba(200, 180, 180, 0.8), rgba(220, 200, 200, 1))",
        }}
      />
    </motion.div>
  );
}
