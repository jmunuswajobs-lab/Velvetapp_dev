import { useState, useEffect, useCallback } from "react";
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
}

const INITIAL_CUPS = 10;
const CUP_POSITIONS = [
  // Triangle formation of cups
  [0.5], // Back
  [0.35, 0.65], // Row 2
  [0.2, 0.5, 0.8], // Row 3
  [0.1, 0.35, 0.65, 0.9], // Row 4
];

export function BeerPongGame({ onGameEnd }: { onGameEnd?: (winner: number) => void }) {
  const [gameState, setGameState] = useState<BeerPongState>({
    team1Cups: Array(INITIAL_CUPS).fill(true),
    team2Cups: Array(INITIAL_CUPS).fill(true),
    currentTeam: 1,
    score1: INITIAL_CUPS,
    score2: INITIAL_CUPS,
    gameActive: true,
    turnPhase: "throw",
    hitCup: null,
  });

  const [message, setMessage] = useState("Team 1, take your shot!");
  const [timeLeft, setTimeLeft] = useState(3);

  // Handle throw
  const handleThrow = useCallback(() => {
    if (!gameState.gameActive || gameState.turnPhase !== "throw") return;

    // Random chance to hit (60% hit rate)
    const hitOrMiss = Math.random() < 0.6;

    if (hitOrMiss) {
      // Find a cup to eliminate
      const targetCups = gameState.currentTeam === 1 ? gameState.team2Cups : gameState.team1Cups;
      const activeCups = targetCups.map((cup, idx) => (cup ? idx : -1)).filter(idx => idx !== -1);

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
          }));

          setMessage(`🎯 HIT! Cup eliminated!`);

          // Check win condition
          if (remainingCups === 0) {
            setGameState(prev => ({ ...prev, gameActive: false }));
            setMessage("🏆 Team 1 WINS!");
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
          }));

          setMessage(`🎯 HIT! Cup eliminated!`);

          if (remainingCups === 0) {
            setGameState(prev => ({ ...prev, gameActive: false }));
            setMessage("🏆 Team 2 WINS!");
            onGameEnd?.(2);
            return;
          }
        }
      }
    } else {
      setMessage("❌ MISS! No cup today.");
      setGameState(prev => ({
        ...prev,
        turnPhase: "result",
        hitCup: null,
      }));
    }

    setTimeLeft(3);
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
          }));
          setMessage(gameState.currentTeam === 1 ? "Team 2, take your shot!" : "Team 1, take your shot!");
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.turnPhase, gameState.gameActive, gameState.currentTeam]);

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
    });
    setMessage("Team 1, take your shot!");
    setTimeLeft(3);
  };

  const renderCups = (cups: boolean[], isTeam2: boolean) => {
    const cupsPerRow = [1, 2, 3, 4];
    let cupIndex = 0;

    return (
      <div className="flex flex-col items-center gap-3">
        {cupsPerRow.map((count, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 justify-center">
            {Array(count)
              .fill(0)
              .map((_, idx) => {
                const currentCup = cups[cupIndex];
                const cupNum = cupIndex;
                cupIndex++;

                const isHit = gameState.hitCup === cupNum && gameState.turnPhase === "result";

                return (
                  <div
                    key={cupNum}
                    className={`
                      w-12 h-16 rounded-md transition-all duration-300
                      ${currentCup
                        ? `${isHit ? "bg-ember-red scale-110" : "bg-gradient-to-b from-neon-magenta to-plum-deep"} shadow-lg shadow-neon-magenta/50`
                        : "bg-plum-deep/20 opacity-30"
                      }
                      ${isTeam2 ? "transform scale-x-[-1]" : ""}
                    `}
                  >
                    <div className="h-full flex items-center justify-center">
                      {currentCup && (
                        <span className="text-white text-xs font-bold">🍺</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
      {/* Score */}
      <div className="flex gap-12 text-center mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Team 1</p>
          <p className="text-3xl font-bold text-neon-magenta">{gameState.score1}</p>
        </div>
        <div className="text-muted-foreground text-2xl">VS</div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Team 2</p>
          <p className="text-3xl font-bold text-ember-red">{gameState.score2}</p>
        </div>
      </div>

      {/* Message */}
      <div className="text-lg font-semibold text-center mb-4">{message}</div>

      {/* Cups Container */}
      <div className="bg-black/40 rounded-lg p-8 border border-plum-deep/30">
        <div className="flex justify-between gap-16 items-center">
          {/* Team 1 Cups */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-3">TEAM 1</p>
            {renderCups(gameState.team1Cups, false)}
          </div>

          {/* Center / Action */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-px h-32 bg-gradient-to-b from-transparent via-neon-magenta to-transparent" />
            
            {gameState.gameActive && (
              <VelvetButton
                velvetVariant={gameState.currentTeam === 1 ? "neon" : "velvet"}
                onClick={handleThrow}
                disabled={gameState.turnPhase === "result"}
                size="lg"
              >
                🎯 THROW
              </VelvetButton>
            )}

            {gameState.turnPhase === "result" && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Next turn in...</p>
                <p className="text-2xl font-bold text-neon-magenta">{timeLeft}s</p>
              </div>
            )}
          </div>

          {/* Team 2 Cups */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-3">TEAM 2</p>
            {renderCups(gameState.team2Cups, true)}
          </div>
        </div>
      </div>

      {/* End Game UI */}
      {!gameState.gameActive && (
        <div className="text-center">
          <p className="text-2xl font-bold text-neon-magenta mb-4">
            {gameState.score1 === 0 ? "Team 2 Wins! 🎉" : "Team 1 Wins! 🎉"}
          </p>
          <VelvetButton velvetVariant="neon" onClick={resetGame}>
            Play Again
          </VelvetButton>
        </div>
      )}

      {/* Instructions */}
      {gameState.gameActive && gameState.turnPhase === "throw" && (
        <p className="text-xs text-muted-foreground text-center max-w-sm">
          {gameState.currentTeam === 1 ? "Team 1" : "Team 2"}'s turn • Click THROW to take a shot • 60% hit chance • First team to zero cups wins!
        </p>
      )}
    </div>
  );
}
