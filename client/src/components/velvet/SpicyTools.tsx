import { motion, useAnimation } from "framer-motion";
import { useState, useCallback } from "react";
import { Dices, RotateCcw, CircleDot } from "lucide-react";
import { VelvetButton } from "./VelvetButton";

// ===== HEAT DICE =====
interface HeatDiceProps {
  onRoll?: (result: number) => void;
}

export function HeatDice({ onRoll }: HeatDiceProps) {
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const controls = useAnimation();

  const roll = useCallback(async () => {
    if (isRolling) return;
    setIsRolling(true);
    setResult(null);

    // Animate the dice roll
    await controls.start({
      rotateX: [0, 360, 720, 1080, 1440],
      rotateY: [0, 180, 360, 540, 720],
      rotateZ: [0, 90, 180, 270, 360],
      transition: { duration: 1.5, ease: [0.25, 0.1, 0.25, 1] },
    });

    const newResult = Math.floor(Math.random() * 6) + 1;
    setResult(newResult);
    setIsRolling(false);
    onRoll?.(newResult);
  }, [isRolling, controls, onRoll]);

  const getDiceFace = (num: number) => {
    const dots: Record<number, string[]> = {
      1: ["50% 50%"],
      2: ["25% 25%", "75% 75%"],
      3: ["25% 25%", "50% 50%", "75% 75%"],
      4: ["25% 25%", "75% 25%", "25% 75%", "75% 75%"],
      5: ["25% 25%", "75% 25%", "50% 50%", "25% 75%", "75% 75%"],
      6: ["25% 25%", "75% 25%", "25% 50%", "75% 50%", "25% 75%", "75% 75%"],
    };
    return dots[num] || dots[1];
  };

  return (
    <div className="flex flex-col items-center gap-6" data-testid="heat-dice">
      <div className="relative" style={{ perspective: 800 }}>
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl blur-xl -z-10"
          style={{ background: "rgba(255, 94, 51, 0.4)" }}
          animate={isRolling ? {
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
        />

        <motion.div
          className="w-32 h-32 rounded-2xl relative"
          animate={controls}
          style={{
            transformStyle: "preserve-3d",
            background: "linear-gradient(135deg, #FF5E33 0%, #B00F2F 100%)",
            boxShadow: "0 10px 40px rgba(255, 94, 51, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Dice dots */}
          {result && (
            <div className="absolute inset-0 p-4">
              {getDiceFace(result).map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 rounded-full bg-white"
                  style={{
                    left: pos.split(" ")[0],
                    top: pos.split(" ")[1],
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring" }}
                />
              ))}
            </div>
          )}

          {/* Rolling indicator */}
          {isRolling && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Dices className="w-12 h-12 text-white/80" />
            </div>
          )}
        </motion.div>
      </div>

      {result && !isRolling && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-4xl font-display font-bold gradient-text">{result}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {result <= 2 ? "Mild" : result <= 4 ? "Spicy" : "Extreme"}
          </p>
        </motion.div>
      )}

      <VelvetButton
        velvetVariant="ember"
        onClick={roll}
        disabled={isRolling}
        className="min-w-[120px]"
        data-testid="button-roll-dice"
      >
        {isRolling ? "Rolling..." : "Roll Dice"}
      </VelvetButton>
    </div>
  );
}

// ===== SPIN THE BOTTLE =====
interface SpinBottleProps {
  players?: string[];
  onSpinComplete?: (selectedIndex: number) => void;
}

export function SpinBottle({ players = [], onSpinComplete }: SpinBottleProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const controls = useAnimation();

  const spin = useCallback(async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedPlayer(null);

    const spins = 5 + Math.random() * 3;
    const finalRotation = rotation + spins * 360;
    setRotation(finalRotation);

    await controls.start({
      rotate: finalRotation,
      transition: {
        duration: 3 + Math.random(),
        ease: [0.25, 0.1, 0.1, 1],
      },
    });

    if (players.length > 0) {
      const normalizedRotation = finalRotation % 360;
      const segmentAngle = 360 / players.length;
      const selectedIndex = Math.floor(normalizedRotation / segmentAngle) % players.length;
      setSelectedPlayer(players[selectedIndex]);
      onSpinComplete?.(selectedIndex);
    }

    setIsSpinning(false);
  }, [isSpinning, rotation, players, controls, onSpinComplete]);

  return (
    <div className="flex flex-col items-center gap-6" data-testid="spin-bottle">
      <div className="relative w-64 h-64">
        {/* Circle with player positions */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-plum-deep/50"
          style={{
            background: "radial-gradient(circle, rgba(59, 15, 92, 0.3) 0%, transparent 70%)",
          }}
        >
          {players.map((player, i) => {
            const angle = (i / players.length) * 360 - 90;
            const x = 50 + 42 * Math.cos((angle * Math.PI) / 180);
            const y = 50 + 42 * Math.sin((angle * Math.PI) / 180);
            return (
              <div
                key={player}
                className={`
                  absolute w-10 h-10 rounded-full flex items-center justify-center
                  text-xs font-medium transition-all duration-300
                  ${selectedPlayer === player 
                    ? "bg-neon-magenta text-white scale-125" 
                    : "bg-noir-soft/80 text-white/70"
                  }
                `}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                  boxShadow: selectedPlayer === player ? "0 0 20px rgba(255, 0, 138, 0.6)" : undefined,
                }}
              >
                {player.slice(0, 2).toUpperCase()}
              </div>
            );
          })}
        </div>

        {/* Bottle */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={controls}
          style={{ transformOrigin: "center" }}
        >
          <div
            className="relative w-24 h-6"
            style={{
              background: "linear-gradient(180deg, #7B2CB3 0%, #3B0F5C 50%, #5A1A8C 100%)",
              borderRadius: "3px 20px 20px 3px",
              boxShadow: "0 4px 20px rgba(123, 44, 179, 0.5)",
            }}
          >
            {/* Bottle neck */}
            <div
              className="absolute right-0 w-8 h-4 top-1/2 -translate-y-1/2"
              style={{
                background: "linear-gradient(180deg, #5A1A8C 0%, #3B0F5C 100%)",
                borderRadius: "0 10px 10px 0",
              }}
            />
            {/* Bottle cap */}
            <div
              className="absolute -right-1 w-3 h-3 top-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: "#E3C089",
                boxShadow: "0 0 8px rgba(227, 192, 137, 0.6)",
              }}
            />
          </div>
        </motion.div>

        {/* Center glow */}
        <motion.div
          className="absolute inset-1/4 rounded-full blur-xl"
          style={{ background: "rgba(255, 0, 138, 0.3)" }}
          animate={isSpinning ? {
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
        />
      </div>

      {selectedPlayer && !isSpinning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">Selected:</p>
          <p className="text-2xl font-display font-bold gradient-text">{selectedPlayer}</p>
        </motion.div>
      )}

      <VelvetButton
        velvetVariant="neon"
        onClick={spin}
        disabled={isSpinning}
        className="min-w-[120px]"
        data-testid="button-spin-bottle"
      >
        <RotateCcw className={`w-4 h-4 mr-2 ${isSpinning ? "animate-spin" : ""}`} />
        {isSpinning ? "Spinning..." : "Spin!"}
      </VelvetButton>
    </div>
  );
}

// ===== COIN FLIP =====
interface CoinFlipProps {
  onFlip?: (result: "heads" | "tails") => void;
}

export function CoinFlip({ onFlip }: CoinFlipProps) {
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const controls = useAnimation();

  const flip = useCallback(async () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setResult(null);

    const flips = 5 + Math.floor(Math.random() * 3);
    const isHeads = Math.random() > 0.5;
    const finalRotation = flips * 180 + (isHeads ? 0 : 180);

    await controls.start({
      rotateY: [0, finalRotation],
      y: [0, -120, -100, -80, 0],
      scale: [1, 1.2, 1.1, 1.05, 1],
      transition: {
        duration: 1.5,
        times: [0, 0.3, 0.5, 0.7, 1],
        ease: [0.25, 0.1, 0.25, 1],
      },
    });

    const newResult = isHeads ? "heads" : "tails";
    setResult(newResult);
    setIsFlipping(false);
    onFlip?.(newResult);
  }, [isFlipping, controls, onFlip]);

  return (
    <div className="flex flex-col items-center gap-6" data-testid="coin-flip">
      <div className="relative" style={{ perspective: 1000 }}>
        {/* Shadow */}
        <motion.div
          className="absolute w-32 h-8 rounded-full blur-md -z-10"
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            bottom: -20,
            left: "50%",
            transform: "translateX(-50%)",
          }}
          animate={isFlipping ? {
            scale: [1, 0.5, 0.6, 0.8, 1],
            opacity: [0.4, 0.2, 0.25, 0.35, 0.4],
          } : {}}
          transition={{ duration: 1.5 }}
        />

        <motion.div
          className="relative w-32 h-32"
          animate={controls}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Heads side */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #E3C089 0%, #C9A66B 50%, #E3C089 100%)",
              boxShadow: "0 8px 30px rgba(227, 192, 137, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.3)",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="text-center">
              <span className="text-4xl">👑</span>
              <p className="text-xs font-medium text-noir-black mt-1">HEADS</p>
            </div>
          </div>

          {/* Tails side */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #C9A66B 0%, #E3C089 50%, #C9A66B 100%)",
              boxShadow: "0 8px 30px rgba(227, 192, 137, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.3)",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-center">
              <span className="text-4xl">🔥</span>
              <p className="text-xs font-medium text-noir-black mt-1">TAILS</p>
            </div>
          </div>
        </motion.div>
      </div>

      {result && !isFlipping && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-3xl font-display font-bold gradient-text-gold uppercase">
            {result}
          </p>
        </motion.div>
      )}

      <VelvetButton
        velvetVariant="gold"
        onClick={flip}
        disabled={isFlipping}
        className="min-w-[120px]"
        data-testid="button-flip-coin"
      >
        <CircleDot className="w-4 h-4 mr-2" />
        {isFlipping ? "Flipping..." : "Flip Coin"}
      </VelvetButton>
    </div>
  );
}
