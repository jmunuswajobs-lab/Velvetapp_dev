
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Trophy, Heart } from "lucide-react";
import { Link } from "wouter";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { HeatMeter } from "@/components/velvet/HeatMeter";

// Couples Duel Arena
export function CouplesDuelArena() {
  const [player1Charge, setPlayer1Charge] = useState(0);
  const [player2Charge, setPlayer2Charge] = useState(0);
  const [round, setRound] = useState(1);
  const [winner, setWinner] = useState<string | null>(null);
  const [isCharging, setIsCharging] = useState(false);

  const handleCharge = (player: 1 | 2) => {
    setIsCharging(true);
    const charge = Math.random() * 100;
    if (player === 1) {
      setPlayer1Charge(charge);
    } else {
      setPlayer2Charge(charge);
    }
    
    setTimeout(() => {
      setIsCharging(false);
      if (player1Charge > 0 && player2Charge > 0) {
        const victor = player1Charge > player2Charge ? "Player 1" : "Player 2";
        setWinner(victor);
        setRound(round + 1);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <VelvetCard className="max-w-2xl w-full p-8">
        <h1 className="text-3xl font-display font-bold gradient-text mb-6 text-center">
          Couples Duel Arena
        </h1>
        <div className="text-center mb-4">Round {round}</div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-center mb-2 font-semibold">Player 1</p>
            <HeatMeter value={player1Charge} size="lg" />
            <VelvetButton
              velvetVariant="neon"
              className="w-full mt-4"
              onClick={() => handleCharge(1)}
              disabled={isCharging || player1Charge > 0}
            >
              <Zap className="w-4 h-4 mr-2" />
              Charge Attack
            </VelvetButton>
          </div>
          
          <div>
            <p className="text-center mb-2 font-semibold">Player 2</p>
            <HeatMeter value={player2Charge} size="lg" />
            <VelvetButton
              velvetVariant="neon"
              className="w-full mt-4"
              onClick={() => handleCharge(2)}
              disabled={isCharging || player2Charge > 0}
            >
              <Zap className="w-4 h-4 mr-2" />
              Charge Attack
            </VelvetButton>
          </div>
        </div>

        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Trophy className="w-16 h-16 text-neon-magenta mx-auto mb-4" />
              <p className="text-2xl font-bold gradient-text">{winner} Wins!</p>
              <VelvetButton
                velvetVariant="velvet"
                className="mt-4"
                onClick={() => {
                  setPlayer1Charge(0);
                  setPlayer2Charge(0);
                  setWinner(null);
                }}
              >
                Next Round
              </VelvetButton>
            </motion.div>
          )}
        </AnimatePresence>
      </VelvetCard>
    </div>
  );
}

// Emotion Ping-Pong
export function EmotionPingPong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [gameActive, setGameActive] = useState(false);

  useEffect(() => {
    if (!gameActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let ball = { x: 400, y: 300, dx: 4, dy: 4, radius: 10 };
    let paddle1 = { x: 20, y: 250, width: 10, height: 100 };
    let paddle2 = { x: 770, y: 250, width: 10, height: 100 };

    const draw = () => {
      ctx.fillStyle = "#050509";
      ctx.fillRect(0, 0, 800, 600);

      // Draw paddles
      ctx.fillStyle = "#FF008A";
      ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
      ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#E3C089";
      ctx.fill();

      // Move ball
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall collision
      if (ball.y + ball.radius > 600 || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
      }

      // Paddle collision
      if (
        (ball.x - ball.radius < paddle1.x + paddle1.width &&
          ball.y > paddle1.y &&
          ball.y < paddle1.y + paddle1.height) ||
        (ball.x + ball.radius > paddle2.x &&
          ball.y > paddle2.y &&
          ball.y < paddle2.y + paddle2.height)
      ) {
        ball.dx = -ball.dx;
      }

      // Score
      if (ball.x < 0) {
        setScore((s) => ({ ...s, player2: s.player2 + 1 }));
        ball = { x: 400, y: 300, dx: 4, dy: 4, radius: 10 };
      }
      if (ball.x > 800) {
        setScore((s) => ({ ...s, player1: s.player1 + 1 }));
        ball = { x: 400, y: 300, dx: -4, dy: 4, radius: 10 };
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [gameActive]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <VelvetCard className="p-8">
        <h1 className="text-3xl font-display font-bold gradient-text mb-6 text-center">
          Emotion Ping-Pong
        </h1>
        <div className="flex justify-between mb-4 text-2xl font-bold">
          <span>P1: {score.player1}</span>
          <span>P2: {score.player2}</span>
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-plum-deep/50 rounded-lg mb-4"
        />
        <VelvetButton
          velvetVariant="neon"
          className="w-full"
          onClick={() => setGameActive(!gameActive)}
        >
          {gameActive ? "Pause" : "Start Game"}
        </VelvetButton>
      </VelvetCard>
    </div>
  );
}

// Velvet Memory Flip
export function VelvetMemoryFlip() {
  const icons = ["💋", "💕", "🔥", "💖", "✨", "🌹", "💗", "💘"];
  const [cards, setCards] = useState<Array<{ id: number; icon: string; flipped: boolean; matched: boolean }>>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const shuffled = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((icon, id) => ({ id, icon, flipped: false, matched: false }));
    setCards(shuffled);
  }, []);

  const handleCardClick = (index: number) => {
    if (cards[index].flipped || cards[index].matched || flippedIndices.length === 2) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].icon === cards[second].icon) {
        setTimeout(() => {
          const matched = [...cards];
          matched[first].matched = true;
          matched[second].matched = true;
          setCards(matched);
          setFlippedIndices([]);
        }, 500);
      } else {
        setTimeout(() => {
          const reset = [...cards];
          reset[first].flipped = false;
          reset[second].flipped = false;
          setCards(reset);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <VelvetCard className="max-w-2xl p-8">
        <h1 className="text-3xl font-display font-bold gradient-text mb-6 text-center">
          Velvet Memory Flip
        </h1>
        <div className="text-center mb-4 text-xl">Moves: {moves}</div>
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              className={`aspect-square rounded-lg text-4xl flex items-center justify-center ${
                card.matched
                  ? "bg-gradient-to-br from-neon-magenta to-plum-deep"
                  : "glass-card"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(index)}
            >
              {card.flipped || card.matched ? card.icon : "?"}
            </motion.button>
          ))}
        </div>
      </VelvetCard>
    </div>
  );
}
