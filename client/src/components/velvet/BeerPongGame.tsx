import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VelvetButton } from "./VelvetButton";

interface BeerPongState {
  team1Cups: boolean[];
  team2Cups: boolean[];
  currentTeam: 1 | 2;
  score1: number;
  score2: number;
  gameActive: boolean;
  turnPhase: "throw" | "result";
  hitCup: number | null;
  difficulty: number;
  lastResult: "hit" | "miss" | null;
}

const INITIAL_CUPS = 10;

export function BeerPongGame({ 
  onGameEnd, 
  difficulty = 3 
}: { 
  onGameEnd?: (winner: number) => void
  difficulty?: number 
}) {
  const [gameState, setGameState] = useState<BeerPongState>({
    team1Cups: Array(INITIAL_CUPS).fill(true),
    team2Cups: Array(INITIAL_CUPS).fill(true),
    currentTeam: 1,
    score1: INITIAL_CUPS,
    score2: INITIAL_CUPS,
    gameActive: true,
    turnPhase: "throw",
    hitCup: null,
    difficulty,
    lastResult: null,
  });

  const [timeLeft, setTimeLeft] = useState(4);
  const [ballAnimation, setBallAnimation] = useState(false);

  const handleThrow = useCallback(() => {
    if (!gameState.gameActive || gameState.turnPhase !== "throw") return;

    setBallAnimation(true);
    const hitChances = [0.7, 0.6, 0.5, 0.4];
    const hitChance = hitChances[gameState.difficulty - 1] || 0.6;
    const isHit = Math.random() < hitChance;

    setTimeout(() => {
      if (isHit) {
        const targetCups = gameState.currentTeam === 1 ? gameState.team2Cups : gameState.team1Cups;
        const activeCups = targetCups
          .map((cup, idx) => (cup ? idx : -1))
          .filter(idx => idx !== -1);

        if (activeCups.length > 0) {
          const targetIdx = activeCups[Math.floor(Math.random() * activeCups.length)];

          if (gameState.currentTeam === 1) {
            const newTeam2Cups = [...gameState.team2Cups];
            newTeam2Cups[targetIdx] = false;
            const remainingCups = newTeam2Cups.filter(c => c).length;

            setGameState(prev => ({
              ...prev,
              team2Cups: newTeam2Cups,
              score2: remainingCups,
              turnPhase: "result",
              hitCup: targetIdx,
              lastResult: "hit",
            }));

            if (remainingCups === 0) {
              setGameState(prev => ({ ...prev, gameActive: false }));
              onGameEnd?.(1);
              return;
            }
          } else {
            const newTeam1Cups = [...gameState.team1Cups];
            newTeam1Cups[targetIdx] = false;
            const remainingCups = newTeam1Cups.filter(c => c).length;

            setGameState(prev => ({
              ...prev,
              team1Cups: newTeam1Cups,
              score1: remainingCups,
              turnPhase: "result",
              hitCup: targetIdx,
              lastResult: "hit",
            }));

            if (remainingCups === 0) {
              setGameState(prev => ({ ...prev, gameActive: false }));
              onGameEnd?.(2);
              return;
            }
          }
        }
      } else {
        setGameState(prev => ({
          ...prev,
          turnPhase: "result",
          hitCup: null,
          lastResult: "miss",
        }));
      }

      setTimeLeft(4);
      setBallAnimation(false);
    }, 600);
  }, [gameState, onGameEnd]);

  // Auto-advance turns
  useEffect(() => {
    if (!gameState.gameActive || gameState.turnPhase === "throw") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState(prev => ({
            ...prev,
            currentTeam: prev.currentTeam === 1 ? 2 : 1,
            turnPhase: "throw",
            hitCup: null,
            lastResult: null,
          }));
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.turnPhase, gameState.gameActive]);

  const resetGame = () => {
    setGameState({
      team1Cups: Array(INITIAL_CUPS).fill(true),
      team2Cups: Array(INITIAL_CUPS).fill(true),
      currentTeam: 1,
      score1: INITIAL_CUPS,
      score2: INITIAL_CUPS,
      gameActive: true,
      turnPhase: "throw",
      hitCup: null,
      difficulty,
      lastResult: null,
    });
    setTimeLeft(4);
    setBallAnimation(false);
  };

  const renderCups = (cups: boolean[], isTeam2: boolean) => {
    const cupsPerRow = [1, 2, 3, 4];
    let cupIndex = 0;

    return (
      <div className="flex flex-col items-center gap-3">
        {cupsPerRow.map((count, rowIdx) => (
          <div key={rowIdx} className="flex gap-3 justify-center">
            {Array(count)
              .fill(0)
              .map((_, idx) => {
                const currentCup = cups[cupIndex];
                const cupNum = cupIndex;
                cupIndex++;
                const isHit = gameState.hitCup === cupNum && gameState.turnPhase === "result";

                return (
                  <motion.div
                    key={cupNum}
                    animate={isHit ? { scale: [1, 1.2, 0.3], opacity: [1, 1, 0] } : { scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className={`
                      w-10 h-14 rounded-md transition-all cursor-pointer
                      flex items-center justify-center font-bold text-lg
                      ${
                        currentCup
                          ? `${
                              isHit
                                ? "bg-gradient-to-b from-ember-red to-heat-pink shadow-lg shadow-ember-red/50"
                                : "bg-gradient-to-b from-neon-magenta to-plum-deep shadow-lg shadow-neon-magenta/40 hover:shadow-neon-magenta/60"
                            }`
                          : "bg-plum-deep/20 opacity-20 cursor-default"
                      }
                    `}
                  >
                    {currentCup && "🍺"}
                  </motion.div>
                );
              })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
      {/* Score Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <motion.div
            className={`text-center flex-1 p-4 rounded-lg transition-all ${
              gameState.currentTeam === 1
                ? "bg-gradient-to-br from-neon-magenta/20 to-neon-magenta/5 border border-neon-magenta/50"
                : "bg-transparent border border-transparent"
            }`}
          >
            <p className="text-sm text-muted-foreground font-semibold tracking-wide">TEAM 1</p>
            <motion.p
              key={gameState.score1}
              animate={{ scale: [1, 1.1, 1] }}
              className="text-5xl font-bold text-neon-magenta mt-2"
            >
              {gameState.score1}
            </motion.p>
          </motion.div>

          <div className="text-2xl font-bold text-muted-foreground/50 px-6">VS</div>

          <motion.div
            className={`text-center flex-1 p-4 rounded-lg transition-all ${
              gameState.currentTeam === 2
                ? "bg-gradient-to-br from-ember-red/20 to-ember-red/5 border border-ember-red/50"
                : "bg-transparent border border-transparent"
            }`}
          >
            <p className="text-sm text-muted-foreground font-semibold tracking-wide">TEAM 2</p>
            <motion.p
              key={gameState.score2}
              animate={{ scale: [1, 1.1, 1] }}
              className="text-5xl font-bold text-ember-red mt-2"
            >
              {gameState.score2}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Game Status */}
      <AnimatePresence mode="wait">
        {gameState.gameActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">
              {gameState.currentTeam === 1 ? "🟣 TEAM 1" : "🔴 TEAM 2"}'s Turn
            </p>
            {gameState.turnPhase === "result" && (
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-2xl font-bold ${
                  gameState.lastResult === "hit" ? "text-neon-magenta" : "text-muted-foreground"
                }`}
              >
                {gameState.lastResult === "hit" ? "🎯 HIT!" : "❌ MISS"}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-3xl font-bold mb-2">
              {gameState.score1 === 0 ? "🎉 TEAM 2 WINS! 🎉" : "🎉 TEAM 1 WINS! 🎉"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cup Table */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-black/60 to-black/30 rounded-2xl p-8 border border-plum-deep/30 backdrop-blur-sm"
      >
        <div className="flex justify-between items-center gap-12">
          {/* Team 1 Cups */}
          <motion.div
            animate={gameState.currentTeam === 1 ? { opacity: 1 } : { opacity: 0.6 }}
            className="transition-opacity"
          >
            {renderCups(gameState.team1Cups, false)}
          </motion.div>

          {/* Center - Throw Button & Timer */}
          <div className="flex flex-col items-center gap-6">
            {gameState.gameActive && gameState.turnPhase === "throw" && (
              <motion.div
                animate={ballAnimation ? { x: [0, 20, -20, 0], y: [0, -30, -50, 0] } : { x: 0, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleThrow}
                  disabled={ballAnimation}
                  className="relative w-20 h-20 rounded-full bg-gradient-to-br from-neon-magenta to-ember-red shadow-lg shadow-neon-magenta/50 hover:shadow-neon-magenta/70 transition-all disabled:opacity-60 flex items-center justify-center text-3xl font-bold"
                >
                  {ballAnimation ? "🎯" : "🎱"}
                </motion.button>
              </motion.div>
            )}

            {gameState.turnPhase === "result" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground mb-1">Next turn in</p>
                <motion.p
                  key={timeLeft}
                  animate={{ scale: [1, 1.2, 1] }}
                  className="text-4xl font-bold text-neon-magenta"
                >
                  {timeLeft}
                </motion.p>
              </motion.div>
            )}
          </div>

          {/* Team 2 Cups */}
          <motion.div
            animate={gameState.currentTeam === 2 ? { opacity: 1 } : { opacity: 0.6 }}
            className="transition-opacity"
          >
            {renderCups(gameState.team2Cups, true)}
          </motion.div>
        </div>
      </motion.div>

      {/* Game Over UI */}
      <AnimatePresence>
        {!gameState.gameActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex gap-4"
          >
            <VelvetButton velvetVariant="neon" onClick={resetGame} size="lg">
              🔄 Play Again
            </VelvetButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {gameState.gameActive && gameState.turnPhase === "throw" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground text-center max-w-sm"
        >
          Click the ball to throw • First team to zero cups wins!
        </motion.p>
      )}
    </div>
  );
}
