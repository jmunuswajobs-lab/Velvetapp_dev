import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VelvetButton } from "./VelvetButton";

interface Cup {
  id: string;
  x: number;
  y: number;
  active: boolean;
}

interface BeerPongProps {
  onGameEnd?: (winner: "team1" | "team2") => void;
  difficulty?: number;
}

export function BeerPongGame({ onGameEnd, difficulty = 3 }: BeerPongProps) {
  // Game state
  const [team1Cups, setTeam1Cups] = useState<Cup[]>([]);
  const [team2Cups, setTeam2Cups] = useState<Cup[]>([]);
  const [currentTeam, setCurrentTeam] = useState<"team1" | "team2">("team1");
  const [winner, setWinner] = useState<"team1" | "team2" | null>(null);

  // UI state
  const [aimAngle, setAimAngle] = useState(0); // -30 to 30 degrees
  const [power, setPower] = useState(0.5); // 0 to 1
  const [isShooting, setIsShooting] = useState(false);
  const [lastResult, setLastResult] = useState<"hit" | "miss" | null>(null);
  const [throwCount, setThrowCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aimDragRef = useRef<{ startX: number } | null>(null);
  const powerDragRef = useRef<{ startY: number } | null>(null);

  // Initialize cups
  useEffect(() => {
    const generateCups = (): Cup[] => {
      const cups: Cup[] = [];
      const rows = [1, 2, 3];
      let id = 0;
      rows.forEach((count, rowIdx) => {
        for (let i = 0; i < count; i++) {
          cups.push({
            id: `cup-${id}`,
            x: 50 + (i - count / 2 + 0.5) * 15,
            y: 15 + rowIdx * 20,
            active: true,
          });
          id++;
        }
      });
      return cups;
    };

    setTeam1Cups(generateCups());
    setTeam2Cups(generateCups());
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const scale = canvas.width / 100;

    // Clear
    ctx.fillStyle = "rgba(20, 10, 30, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw aiming guide
    if (!isShooting) {
      const centerX = canvas.width / 2;
      const startY = canvas.height * 0.85;

      ctx.strokeStyle = `rgba(255, 0, 138, ${0.3 + power * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, startY);

      const angle = (aimAngle * Math.PI) / 180;
      const trajectoryLength = 200 * (0.5 + power * 0.5);
      const endX = centerX + Math.sin(angle) * trajectoryLength;
      const endY = startY - Math.cos(angle) * trajectoryLength;

      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw arc
      ctx.strokeStyle = `rgba(255, 0, 138, ${0.2 + power * 0.2})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let t = 0; t <= 1; t += 0.1) {
        const x = centerX + Math.sin(angle) * trajectoryLength * t;
        const y = startY - (Math.cos(angle) * trajectoryLength * t - (t * t * 50 * (1 - power)));
        if (t === 0) {
          ctx.beginPath();
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw cups
    const drawCups = (cups: Cup[], y: number, color: string) => {
      cups.forEach(cup => {
        const x = (cup.x / 100) * canvas.width;
        const cupY = (y / 100) * canvas.height;
        const cupSize = 8 * scale;

        if (cup.active) {
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.fillRect(x - cupSize / 2, cupY - cupSize / 2, cupSize, cupSize);
          ctx.shadowColor = "transparent";
        }
      });
    };

    drawCups(currentTeam === "team1" ? team2Cups : team1Cups, 15, "rgba(255, 0, 138, 0.8)");
    drawCups(currentTeam === "team1" ? team1Cups : team2Cups, 80, "rgba(176, 15, 47, 0.8)");

    // Draw player indicator
    ctx.fillStyle = currentTeam === "team1" ? "rgb(255, 0, 138)" : "rgb(176, 15, 47)";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(currentTeam === "team1" ? "🟣 TEAM 1" : "🔴 TEAM 2", canvas.width / 2, 30);

    // Draw power bar
    ctx.fillStyle = "rgba(255, 0, 138, 0.2)";
    ctx.fillRect(10, canvas.height - 50, 100, 8);
    ctx.fillStyle = `rgba(255, 0, 138, ${0.5 + power * 0.5})`;
    ctx.fillRect(10, canvas.height - 50, 100 * power, 8);
    ctx.strokeStyle = "rgba(255, 0, 138, 0.5)";
    ctx.strokeRect(10, canvas.height - 50, 100, 8);
  }, [team1Cups, team2Cups, currentTeam, aimAngle, power, isShooting]);

  // Handle shooting
  const handleShoot = async () => {
    if (isShooting) return;

    setIsShooting(true);
    setThrowCount(prev => prev + 1);

    // Simulate server-side hit detection
    const accuracyChances = [0.7, 0.6, 0.5, 0.4];
    const baseAccuracy = accuracyChances[difficulty - 1] || 0.6;
    const powerAdjustment = 1 - power * 0.15;
    const finalAccuracy = baseAccuracy * powerAdjustment;

    const hit = Math.random() < finalAccuracy;

    // Animation delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (hit) {
      const targetCups = currentTeam === "team1" ? team2Cups : team1Cups;
      const activeCups = targetCups.filter(c => c.active);

      if (activeCups.length > 0) {
        const hitCup = activeCups[Math.floor(Math.random() * activeCups.length)];
        const newCups = targetCups.map(cup =>
          cup.id === hitCup.id ? { ...cup, active: false } : cup
        );

        if (currentTeam === "team1") {
          setTeam2Cups(newCups);
          if (newCups.every(c => !c.active)) {
            setWinner("team1");
            onGameEnd?.("team1");
          }
        } else {
          setTeam1Cups(newCups);
          if (newCups.every(c => !c.active)) {
            setWinner("team2");
            onGameEnd?.("team2");
          }
        }
      }

      setLastResult("hit");
    } else {
      setLastResult("miss");
    }

    // Reset for next turn
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentTeam(currentTeam === "team1" ? "team2" : "team1");
    setAimAngle(0);
    setPower(0.5);
    setLastResult(null);
    setIsShooting(false);
  };

  // Aim controls
  const handleAimDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    aimDragRef.current = { startX: clientX };
  };

  const handleAimMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!aimDragRef.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - aimDragRef.current.startX;
    const newAngle = Math.max(-30, Math.min(30, (delta / 2)));
    setAimAngle(newAngle);
  };

  const handleAimUp = () => {
    aimDragRef.current = null;
  };

  // Power controls
  const handlePowerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    powerDragRef.current = { startY: clientY };
  };

  const handlePowerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!powerDragRef.current) return;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const delta = powerDragRef.current.startY - clientY;
    const newPower = Math.max(0.3, Math.min(1, power + delta / 100));
    setPower(newPower);
    powerDragRef.current.startY = clientY;
  };

  const handlePowerUp = () => {
    powerDragRef.current = null;
  };

  const resetGame = () => {
    const generateCups = (): Cup[] => {
      const cups: Cup[] = [];
      const rows = [1, 2, 3];
      let id = 0;
      rows.forEach((count, rowIdx) => {
        for (let i = 0; i < count; i++) {
          cups.push({
            id: `cup-${id}`,
            x: 50 + (i - count / 2 + 0.5) * 15,
            y: 15 + rowIdx * 20,
            active: true,
          });
          id++;
        }
      });
      return cups;
    };

    setTeam1Cups(generateCups());
    setTeam2Cups(generateCups());
    setCurrentTeam("team1");
    setWinner(null);
    setAimAngle(0);
    setPower(0.5);
    setLastResult(null);
    setThrowCount(0);
    setIsShooting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4 w-full max-w-4xl mx-auto">
      {/* Score Display */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="flex items-center justify-between gap-8">
          <div className={`flex-1 p-4 rounded-lg transition-all ${currentTeam === "team1" ? "bg-neon-magenta/20 border border-neon-magenta" : "bg-black/40"}`}>
            <p className="text-xs text-muted-foreground">TEAM 1</p>
            <motion.p key={team1Cups.filter(c => c.active).length} animate={{ scale: [1, 1.1, 1] }} className="text-4xl font-bold text-neon-magenta">
              {team1Cups.filter(c => c.active).length}
            </motion.p>
          </div>
          <div className="text-muted-foreground">VS</div>
          <div className={`flex-1 p-4 rounded-lg transition-all ${currentTeam === "team2" ? "bg-ember-red/20 border border-ember-red" : "bg-black/40"}`}>
            <p className="text-xs text-muted-foreground">TEAM 2</p>
            <motion.p key={team2Cups.filter(c => c.active).length} animate={{ scale: [1, 1.1, 1] }} className="text-4xl font-bold text-ember-red">
              {team2Cups.filter(c => c.active).length}
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Canvas Table */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-gradient-to-b from-black/60 to-black/30 rounded-xl overflow-hidden border border-plum-deep/30 backdrop-blur-sm"
      >
        <canvas ref={canvasRef} className="w-full h-64 cursor-crosshair" onMouseMove={handleAimMove} onMouseUp={handleAimUp} />
      </motion.div>

      {/* Controls */}
      <AnimatePresence mode="wait">
        {!winner ? (
          <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col gap-4">
            {/* Status */}
            <div className="text-center">
              {isShooting ? (
                <motion.p animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-xl font-bold text-neon-magenta">
                  🎯 Throwing...
                </motion.p>
              ) : lastResult ? (
                <motion.p className={`text-2xl font-bold ${lastResult === "hit" ? "text-neon-magenta" : "text-muted-foreground"}`}>
                  {lastResult === "hit" ? "✨ HIT!" : "❌ MISS"}
                </motion.p>
              ) : (
                <p className="text-sm text-muted-foreground">{currentTeam === "team1" ? "🟣 Team 1" : "🔴 Team 2"}'s Turn • Shot #{throwCount + 1}</p>
              )}
            </div>

            {/* Aim Control */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-12">AIM</span>
              <div
                className="flex-1 h-8 bg-black/40 rounded-lg border border-neon-magenta/30 cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
                onMouseDown={handleAimDown}
                onMouseMove={handleAimMove}
                onMouseUp={handleAimUp}
                onMouseLeave={handleAimUp}
                onTouchStart={handleAimDown}
                onTouchMove={handleAimMove}
                onTouchEnd={handleAimUp}
              >
                <motion.div
                  animate={{ x: `${((aimAngle + 30) / 60) * 100 - 50}%` }}
                  className="w-1 h-6 bg-neon-magenta rounded-full"
                />
              </div>
              <span className="text-xs text-neon-magenta font-bold w-12 text-right">{aimAngle.toFixed(0)}°</span>
            </div>

            {/* Power Control */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-12">POWER</span>
              <div
                className="flex-1 h-8 bg-black/40 rounded-lg border border-neon-magenta/30 cursor-grab active:cursor-grabbing"
                onMouseDown={handlePowerDown}
                onMouseMove={handlePowerMove}
                onMouseUp={handlePowerUp}
                onMouseLeave={handlePowerUp}
                onTouchStart={handlePowerDown}
                onTouchMove={handlePowerMove}
                onTouchEnd={handlePowerUp}
              >
                <motion.div
                  animate={{ width: `${power * 100}%` }}
                  className="h-full bg-gradient-to-r from-neon-magenta to-ember-red rounded-lg"
                />
              </div>
              <span className="text-xs text-neon-magenta font-bold w-12 text-right">{(power * 100).toFixed(0)}%</span>
            </div>

            {/* Throw Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShoot}
              disabled={isShooting}
              className="w-full p-4 bg-gradient-to-r from-neon-magenta to-ember-red text-white font-bold rounded-lg hover:shadow-lg hover:shadow-neon-magenta/50 disabled:opacity-50 transition-all"
            >
              🎱 THROW
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="gameover" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center flex flex-col gap-4">
            <p className="text-3xl font-bold">
              {winner === "team1" ? "🎉 TEAM 1 WINS! 🎉" : "🎉 TEAM 2 WINS! 🎉"}
            </p>
            <VelvetButton velvetVariant="neon" onClick={resetGame} size="lg">
              🔄 Play Again
            </VelvetButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
