
import { motion, AnimatePresence } from "framer-motion";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import type { LudoGameState, LudoPlayer, LudoPiece, LudoColor } from "@shared/schema";
import { VELVET_SPACE_POSITIONS, LUDO_START_POSITIONS } from "@shared/schema";
import { VelvetButton } from "./VelvetButton";
import { VelvetCard } from "./VelvetCard";

interface LudoBoardProps {
  gameState: LudoGameState;
  onRollDice: () => void;
  onMovePiece: (pieceId: string) => void;
  currentPlayerId?: string;
}

const LUDO_COLORS_MAP: Record<LudoColor, string> = {
  red: "#FF4444",
  blue: "#4488FF",
  green: "#44CC44",
  yellow: "#FFCC44",
};

// Standard Ludo board path (52 spaces in cross pattern)
function generateStandardLudoPath() {
  const path: { x: number; y: number; isStart?: boolean; color?: LudoColor; isSafe?: boolean }[] = [];
  const gridSize = 15;
  const cellSize = 100 / gridSize;
  
  // Red start (position 0) - middle of left arm
  path.push({ x: 1, y: 6, isStart: true, color: "red", isSafe: true });
  
  // Left arm going up (Red path)
  for (let i = 1; i < 6; i++) {
    path.push({ x: 1, y: 6 - i });
  }
  
  // Top-left corner
  path.push({ x: 0, y: 0, isSafe: true }); // Safe space
  
  // Top arm going right
  for (let i = 1; i < 6; i++) {
    path.push({ x: i, y: 0 });
  }
  
  // Green start (position 13) - middle of top arm
  path.push({ x: 6, y: 0, isStart: true, color: "green", isSafe: true });
  
  // Continue top arm
  for (let i = 7; i < 13; i++) {
    path.push({ x: i, y: 0 });
  }
  
  // Top-right corner
  path.push({ x: 14, y: 0, isSafe: true }); // Safe space
  
  // Right arm going down
  for (let i = 1; i < 6; i++) {
    path.push({ x: 14, y: i });
  }
  
  // Yellow start (position 26) - middle of right arm
  path.push({ x: 14, y: 6, isStart: true, color: "yellow", isSafe: true });
  
  // Continue right arm
  for (let i = 7; i < 13; i++) {
    path.push({ x: 14, y: i });
  }
  
  // Bottom-right corner
  path.push({ x: 14, y: 14, isSafe: true }); // Safe space
  
  // Bottom arm going left
  for (let i = 13; i > 7; i--) {
    path.push({ x: i, y: 14 });
  }
  
  // Blue start (position 39) - middle of bottom arm
  path.push({ x: 8, y: 14, isStart: true, color: "blue", isSafe: true });
  
  // Continue bottom arm
  for (let i = 7; i > 1; i--) {
    path.push({ x: i, y: 14 });
  }
  
  // Bottom-left corner
  path.push({ x: 0, y: 14, isSafe: true }); // Safe space
  
  // Left arm going up (back to start)
  for (let i = 13; i > 6; i--) {
    path.push({ x: 0, y: i });
  }
  
  return path.map((pos, idx) => ({
    ...pos,
    x: pos.x * cellSize,
    y: pos.y * cellSize,
    position: idx,
  }));
}

const BOARD_PATH = generateStandardLudoPath();

function DiceIcon({ value }: { value: number }) {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return <Icon className="w-16 h-16" />;
}

export function LudoBoard({ gameState, onRollDice, onMovePiece, currentPlayerId }: LudoBoardProps) {
  const currentPlayer = gameState.players[gameState.currentTurn];
  const isMyTurn = !currentPlayerId || currentPlayer.id === currentPlayerId;
  const canRoll = gameState.gamePhase === "rolling" && isMyTurn;
  const canMove = gameState.gamePhase === "moving" && isMyTurn;

  const getMovablePieces = () => {
    if (!canMove || !gameState.diceValue) return [];
    
    return currentPlayer.pieces.filter(piece => {
      if (piece.position === -1) {
        return gameState.diceValue === 6;
      }
      return true;
    });
  };

  const movablePieces = getMovablePieces();

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center justify-center w-full max-w-6xl mx-auto">
      {/* Ludo Board */}
      <div 
        className="relative w-full max-w-[600px] aspect-square rounded-2xl overflow-hidden border-4 border-plum-deep/50"
        style={{
          background: `linear-gradient(135deg, rgba(10, 10, 18, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%)`,
          boxShadow: "0 0 60px rgba(255, 0, 138, 0.3), inset 0 0 60px rgba(255, 0, 138, 0.05)",
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Home bases - 4 corners */}
          {/* Red home (top-left) */}
          <rect x={2} y={2} width={28} height={28} rx={2} fill={LUDO_COLORS_MAP.red} opacity={0.3} />
          <rect x={8} y={8} width={16} height={16} rx={2} fill={LUDO_COLORS_MAP.red} opacity={0.5} stroke="white" strokeWidth={0.5} />
          
          {/* Green home (top-right) */}
          <rect x={70} y={2} width={28} height={28} rx={2} fill={LUDO_COLORS_MAP.green} opacity={0.3} />
          <rect x={76} y={8} width={16} height={16} rx={2} fill={LUDO_COLORS_MAP.green} opacity={0.5} stroke="white" strokeWidth={0.5} />
          
          {/* Yellow home (bottom-right) */}
          <rect x={70} y={70} width={28} height={28} rx={2} fill={LUDO_COLORS_MAP.yellow} opacity={0.3} />
          <rect x={76} y={76} width={16} height={16} rx={2} fill={LUDO_COLORS_MAP.yellow} opacity={0.5} stroke="white" strokeWidth={0.5} />
          
          {/* Blue home (bottom-left) */}
          <rect x={2} y={70} width={28} height={28} rx={2} fill={LUDO_COLORS_MAP.blue} opacity={0.3} />
          <rect x={8} y={76} width={16} height={16} rx={2} fill={LUDO_COLORS_MAP.blue} opacity={0.5} stroke="white" strokeWidth={0.5} />

          {/* Draw path */}
          {BOARD_PATH.map((cell, idx) => {
            const velvetSpace = VELVET_SPACE_POSITIONS.includes(idx);
            const isStartSpace = cell.isStart;
            const isSafeSpace = cell.isSafe;
            
            return (
              <g key={idx}>
                <rect
                  x={cell.x}
                  y={cell.y}
                  width={6.66}
                  height={6.66}
                  rx={0.5}
                  fill={
                    isStartSpace 
                      ? LUDO_COLORS_MAP[cell.color!]
                      : isSafeSpace
                      ? "rgba(255, 255, 255, 0.2)"
                      : velvetSpace
                      ? "rgba(255, 0, 138, 0.3)"
                      : "rgba(255, 255, 255, 0.1)"
                  }
                  stroke={
                    velvetSpace 
                      ? "#FF008A"
                      : isStartSpace
                      ? "white"
                      : "rgba(255, 255, 255, 0.2)"
                  }
                  strokeWidth={0.3}
                />
                {velvetSpace && (
                  <text
                    x={cell.x + 3.33}
                    y={cell.y + 4.5}
                    textAnchor="middle"
                    fontSize={2}
                    fill="white"
                  >
                    💋
                  </text>
                )}
                {isStartSpace && (
                  <text
                    x={cell.x + 3.33}
                    y={cell.y + 4.5}
                    textAnchor="middle"
                    fontSize={2.5}
                    fill="white"
                  >
                    ▶
                  </text>
                )}
              </g>
            );
          })}

          {/* Home pieces */}
          {gameState.players.map((player, playerIdx) => {
            const homePositions = [
              [{ x: 10, y: 10 }, { x: 18, y: 10 }, { x: 10, y: 18 }, { x: 18, y: 18 }],
              [{ x: 78, y: 10 }, { x: 86, y: 10 }, { x: 78, y: 18 }, { x: 86, y: 18 }],
              [{ x: 78, y: 78 }, { x: 86, y: 78 }, { x: 78, y: 86 }, { x: 86, y: 86 }],
              [{ x: 10, y: 78 }, { x: 18, y: 78 }, { x: 10, y: 86 }, { x: 18, y: 86 }],
            ];

            const homePieces = player.pieces.filter(p => p.position === -1);
            
            return homePieces.map((piece, pieceIdx) => {
              const homePos = homePositions[playerIdx][pieceIdx];
              const isMovable = movablePieces.some(p => p.id === piece.id);
              
              return (
                <motion.g
                  key={`home-${piece.id}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={isMovable ? { scale: 1.3 } : {}}
                  onClick={() => isMovable && onMovePiece(piece.id)}
                  style={{ cursor: isMovable ? "pointer" : "default" }}
                >
                  <circle
                    cx={homePos.x}
                    cy={homePos.y}
                    r={3}
                    fill={LUDO_COLORS_MAP[player.color]}
                    stroke="white"
                    strokeWidth={0.4}
                    style={{
                      filter: `drop-shadow(0 0 4px ${LUDO_COLORS_MAP[player.color]})`,
                    }}
                  />
                  {isMovable && (
                    <motion.circle
                      cx={homePos.x}
                      cy={homePos.y}
                      r={4}
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth={0.6}
                      animate={{ r: [3.5, 5, 3.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.g>
              );
            });
          })}

          {/* Board pieces */}
          <AnimatePresence>
            {gameState.players.map((player) =>
              player.pieces
                .filter((piece) => piece.position >= 0 && piece.position < 52)
                .map((piece) => {
                  const pathCell = BOARD_PATH[piece.position];
                  if (!pathCell) return null;
                  
                  const isMovable = movablePieces.some(p => p.id === piece.id);
                  
                  return (
                    <motion.g
                      key={piece.id}
                      initial={{ scale: 0 }}
                      animate={{ 
                        x: pathCell.x + 3.33,
                        y: pathCell.y + 3.33,
                        scale: 1
                      }}
                      exit={{ scale: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                      whileHover={isMovable ? { scale: 1.3 } : {}}
                      onClick={() => isMovable && onMovePiece(piece.id)}
                      style={{ cursor: isMovable ? "pointer" : "default" }}
                    >
                      <circle
                        r={2.5}
                        fill={LUDO_COLORS_MAP[player.color]}
                        stroke="white"
                        strokeWidth={0.4}
                        style={{
                          filter: `drop-shadow(0 0 4px ${LUDO_COLORS_MAP[player.color]})`,
                        }}
                      />
                      {isMovable && (
                        <motion.circle
                          r={3.5}
                          fill="none"
                          stroke="#FFD700"
                          strokeWidth={0.6}
                          animate={{ r: [3, 4.5, 3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.g>
                  );
                })
            )}
          </AnimatePresence>

          {/* Center home area */}
          <polygon
            points="40,40 50,30 60,40 50,50"
            fill="rgba(255, 0, 138, 0.2)"
            stroke="#FF008A"
            strokeWidth={0.8}
          />
          <text
            x={50}
            y={42}
            textAnchor="middle"
            fill="#FF008A"
            fontSize={3}
            fontWeight="bold"
          >
            HOME
          </text>
        </svg>
      </div>

      {/* Game controls */}
      <VelvetCard tiltEnabled={false} className="p-6 w-full max-w-xs">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: LUDO_COLORS_MAP[currentPlayer.color] }}
            />
            <span className="font-display text-lg font-semibold">
              {currentPlayer.nickname}'s Turn
            </span>
          </div>

          {gameState.diceValue && (
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  background: "linear-gradient(135deg, rgba(255, 0, 138, 0.2) 0%, rgba(176, 15, 47, 0.2) 100%)",
                  boxShadow: "0 0 20px rgba(255, 0, 138, 0.3)",
                }}
              >
                <DiceIcon value={gameState.diceValue} />
              </div>
            </motion.div>
          )}

          {canRoll && (
            <VelvetButton
              velvetVariant="neon"
              onClick={onRollDice}
              className="w-full py-4"
              data-testid="button-roll-dice"
            >
              🎲 Roll Dice
            </VelvetButton>
          )}

          {canMove && movablePieces.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Click a highlighted piece to move it {gameState.diceValue} spaces
              </p>
              <p className="text-neon-magenta text-xs">
                {movablePieces.length} piece{movablePieces.length > 1 ? 's' : ''} available
              </p>
            </div>
          )}

          {canMove && movablePieces.length === 0 && (
            <p className="text-amber-400 text-sm">
              No valid moves! Next turn.
            </p>
          )}

          {gameState.canRollAgain && (
            <p className="text-neon-magenta text-sm font-medium">
              🎉 You rolled a 6! Roll again after moving.
            </p>
          )}

          <div className="pt-4 border-t border-plum-deep/30">
            <p className="text-xs text-muted-foreground mb-2">Players</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {gameState.players.map((player, idx) => (
                <div 
                  key={player.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    idx === gameState.currentTurn ? "ring-2 ring-neon-magenta" : ""
                  }`}
                  style={{ backgroundColor: `${LUDO_COLORS_MAP[player.color]}22` }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: LUDO_COLORS_MAP[player.color] }}
                  />
                  {player.nickname}
                </div>
              ))}
            </div>
          </div>
        </div>
      </VelvetCard>
    </div>
  );
}
