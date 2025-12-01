import { useState, useEffect, useRef, useCallback } from "react";
import { VelvetButton } from "./VelvetButton";

interface PongState {
  ballX: number;
  ballY: number;
  ballVelX: number;
  ballVelY: number;
  paddle1Y: number;
  paddle2Y: number;
  score1: number;
  score2: number;
  gameActive: boolean;
}

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const BALL_SIZE = 10;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 60;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 3;
const MAX_BALL_SPEED = 8;
const WINNING_SCORE = 11;

export function PongGame({ onGameEnd }: { onGameEnd?: (winner: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const gameStateRef = useRef<PongState>({
    ballX: GAME_WIDTH / 2,
    ballY: GAME_HEIGHT / 2,
    ballVelX: INITIAL_BALL_SPEED,
    ballVelY: INITIAL_BALL_SPEED,
    paddle1Y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    paddle2Y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    score1: 0,
    score2: 0,
    gameActive: true,
  });

  const [gameState, setGameState] = useState<PongState>(gameStateRef.current);
  const [winner, setWinner] = useState<number | null>(null);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      const state = gameStateRef.current;
      if (!state.gameActive) return;

      // Move paddles
      if (keysPressed.current["w"] && state.paddle1Y > 0) {
        state.paddle1Y -= PADDLE_SPEED;
      }
      if (keysPressed.current["s"] && state.paddle1Y < GAME_HEIGHT - PADDLE_HEIGHT) {
        state.paddle1Y += PADDLE_SPEED;
      }
      if (keysPressed.current["arrowup"] && state.paddle2Y > 0) {
        state.paddle2Y -= PADDLE_SPEED;
      }
      if (keysPressed.current["arrowdown"] && state.paddle2Y < GAME_HEIGHT - PADDLE_HEIGHT) {
        state.paddle2Y += PADDLE_SPEED;
      }

      // Move ball
      state.ballX += state.ballVelX;
      state.ballY += state.ballVelY;

      // Ball collision with top/bottom
      if (state.ballY - BALL_SIZE / 2 <= 0 || state.ballY + BALL_SIZE / 2 >= GAME_HEIGHT) {
        state.ballVelY *= -1;
        state.ballY = Math.max(BALL_SIZE / 2, Math.min(GAME_HEIGHT - BALL_SIZE / 2, state.ballY));
      }

      // Ball collision with paddles
      const ballRadius = BALL_SIZE / 2;
      const paddle1Right = PADDLE_WIDTH;
      const paddle2Left = GAME_WIDTH - PADDLE_WIDTH;

      // Left paddle
      if (
        state.ballX - ballRadius <= paddle1Right &&
        state.ballX + ballRadius >= 0 &&
        state.ballY >= state.paddle1Y &&
        state.ballY <= state.paddle1Y + PADDLE_HEIGHT
      ) {
        state.ballVelX = Math.abs(state.ballVelX);
        state.ballX = paddle1Right + ballRadius;
        state.ballVelY += (state.ballY - (state.paddle1Y + PADDLE_HEIGHT / 2)) * 0.1;
        state.ballVelY = Math.max(-MAX_BALL_SPEED, Math.min(MAX_BALL_SPEED, state.ballVelY));
      }

      // Right paddle
      if (
        state.ballX + ballRadius >= paddle2Left &&
        state.ballX - ballRadius <= GAME_WIDTH &&
        state.ballY >= state.paddle2Y &&
        state.ballY <= state.paddle2Y + PADDLE_HEIGHT
      ) {
        state.ballVelX = -Math.abs(state.ballVelX);
        state.ballX = paddle2Left - ballRadius;
        state.ballVelY += (state.ballY - (state.paddle2Y + PADDLE_HEIGHT / 2)) * 0.1;
        state.ballVelY = Math.max(-MAX_BALL_SPEED, Math.min(MAX_BALL_SPEED, state.ballVelY));
      }

      // Scoring
      if (state.ballX < 0) {
        state.score2++;
        resetBall(state);
      } else if (state.ballX > GAME_WIDTH) {
        state.score1++;
        resetBall(state);
      }

      // Check win condition
      if (state.score1 >= WINNING_SCORE) {
        state.gameActive = false;
        setWinner(1);
        onGameEnd?.(1);
      } else if (state.score2 >= WINNING_SCORE) {
        state.gameActive = false;
        setWinner(2);
        onGameEnd?.(2);
      }

      // Draw game
      ctx.fillStyle = "#050509";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw center line
      ctx.strokeStyle = "rgba(255, 0, 138, 0.2)";
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(GAME_WIDTH / 2, 0);
      ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = "rgba(255, 0, 138, 0.8)";
      ctx.fillRect(0, state.paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillStyle = "rgba(176, 15, 47, 0.8)";
      ctx.fillRect(GAME_WIDTH - PADDLE_WIDTH, state.paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillStyle = "#FF008A";
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Update React state for UI
      setGameState({ ...state });
      gameStateRef.current = state;
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [onGameEnd]);

  const resetBall = (state: PongState) => {
    state.ballX = GAME_WIDTH / 2;
    state.ballY = GAME_HEIGHT / 2;
    state.ballVelX = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
    state.ballVelY = (Math.random() - 0.5) * 2 * INITIAL_BALL_SPEED;
  };

  const resetGame = () => {
    gameStateRef.current = {
      ballX: GAME_WIDTH / 2,
      ballY: GAME_HEIGHT / 2,
      ballVelX: INITIAL_BALL_SPEED,
      ballVelY: INITIAL_BALL_SPEED,
      paddle1Y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      paddle2Y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      score1: 0,
      score2: 0,
      gameActive: true,
    };
    setWinner(null);
    setGameState(gameStateRef.current);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="bg-black/50 rounded-lg overflow-hidden border-2 border-neon-magenta/30">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block"
        />
      </div>

      <div className="flex gap-12 text-center">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Player 1 (W/S)</p>
          <p className="text-4xl font-bold text-neon-magenta">{gameState.score1}</p>
        </div>
        <div className="text-muted-foreground text-xl">•</div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Player 2 (↑/↓)</p>
          <p className="text-4xl font-bold text-ember-red">{gameState.score2}</p>
        </div>
      </div>

      {winner && (
        <div className="text-center">
          <p className="text-2xl font-bold text-neon-magenta mb-4">
            Player {winner} Wins! 🎉
          </p>
          <VelvetButton velvetVariant="neon" onClick={resetGame}>
            Play Again
          </VelvetButton>
        </div>
      )}

      {!winner && (
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          First to {WINNING_SCORE} points wins! Hit the ball with your paddle to bounce it back.
        </p>
      )}
    </div>
  );
}
