
import { motion, AnimatePresence } from "framer-motion";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import type { LudoGameState, LudoPlayer, LudoColor, LudoToken } from "@shared/schema";
import { VELVET_SPACE_POSITIONS, LUDO_START_POSITIONS, LUDO_MAIN_PATH_LENGTH } from "@shared/schema";
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

// Standard Ludo board - 52 spaces in cross pattern
function generateLudoPath() {
  const path: { x: number; y: number; color?: LudoColor; isSafe?: boolean }[] = [];
  
  // Red's starting column (bottom-left going up)
  for (let i = 0; i < 6; i++) {
    path.push({ x: 1, y: 8 - i, color: i === 0 ? "red" : undefined, isSafe: i === 0 || i === 5 });
  }
  
  // Top row going right
  for (let i = 0; i < 6; i++) {
    path.push({ x: 2 + i, y: 2, isSafe: i === 0 });
  }
  
  // Green's starting column (top-right going down) 
  for (let i = 0; i < 6; i++) {
    path.push({ x: 8, y: 1 - i + 2, color: i === 0 ? "green" : undefined, isSafe: i === 0 });
  }
  
  // Right column going down
  for (let i = 0; i < 6; i++) {
    path.push({ x: 9 + i, y: 8, isSafe: i === 0 });
  }
  
  // Yellow's starting row (bottom-right going left)
  for (let i = 0; i < 6; i++) {
    path.push({ x: 14 - i, y: 9, color: i === 0 ? "yellow" : undefined, isSafe: i === 0 });
  }
  
  // Bottom row going left
  for (let i = 0; i < 6; i++) {
    path.push({ x: 8 - i, y: 8 + i - i, isSafe: i === 0 });
  }
  
  // Blue's starting column (bottom-left going up)
  for (let i = 0; i < 6; i++) {
    path.push({ x: 1, y: 14 - i, color: i === 0 ? "blue" : undefined, isSafe: i === 0 });
  }
  
  // Left column going up
  for (let i = 0; i < 5; i++) {
    path.push({ x: i, y: 8, isSafe: i === 0 });
  }
  
  return path;
}

const BOARD_PATH = generateLudoPath();

function DiceIcon({ value }: { value: number }) {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return <Icon className="w-16 h-16" />;
}

export function LudoBoard({ gameState, onRollDice, onMovePiece, currentPlayerId }: LudoBoardProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = !currentPlayerId || currentPlayer.id === currentPlayerId;
  const canRollDice = gameState.canRoll && isMyTurn;
  const canMovePiece = gameState.canMove && isMyTurn;

  const getMovableTokens = () => {
    if (!canMovePiece || !gameState.diceValue) return [];
    
    return currentPlayer.tokens.filter(token => {
      // Check if this token has a valid move
      return gameState.validMoves.some(move => move.tokenId === token.id);
    });
  };

  const movableTokens = getMovableTokens();

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
        <svg viewBox="0 0 150 150" className="w-full h-full">
          {/* Grid background */}
          <rect x="0" y="0" width="150" height="150" fill="rgba(0,0,0,0.3)" />
          
          {/* Home bases - 4 corners with proper cross layout */}
          
          {/* Red home (bottom-left) */}
          <rect x="0" y="90" width="60" height="60" rx="3" fill={LUDO_COLORS_MAP.red} opacity={0.3} />
          <path d="M 10,100 L 30,100 L 30,140 L 10,140 Z M 40,100 L 50,100 L 50,140 L 40,140 Z" 
                fill={LUDO_COLORS_MAP.red} opacity={0.5} stroke="white" strokeWidth={0.5} />
          
          {/* Green home (top-right) */}
          <rect x="90" y="0" width="60" height="60" rx="3" fill={LUDO_COLORS_MAP.green} opacity={0.3} />
          <path d="M 100,10 L 140,10 L 140,30 L 100,30 Z M 100,40 L 140,40 L 140,50 L 100,50 Z" 
                fill={LUDO_COLORS_MAP.green} opacity={0.5} stroke="white" strokeWidth={0.5} />
          
          {/* Yellow home (bottom-right) */}
          <rect x="90" y="90" width="60" height="60" rx="3" fill={LUDO_COLORS_MAP.yellow} opacity={0.3} />
          <path d="M 100,100 L 140,100 L 140,120 L 100,120 Z M 100,130 L 140,130 L 140,140 L 100,140 Z" 
                fill={LUDO_COLORS_MAP.yellow} opacity={0.5} stroke="white" strokeWidth={0.5} />
          
          {/* Blue home (top-left) */}
          <rect x="0" y="0" width="60" height="60" rx="3" fill={LUDO_COLORS_MAP.blue} opacity={0.3} />
          <path d="M 10,10 L 50,10 L 50,30 L 10,30 Z M 10,40 L 50,40 L 50,50 L 10,50 Z" 
                fill={LUDO_COLORS_MAP.blue} opacity={0.5} stroke="white" strokeWidth={0.5} />

          {/* Draw the cross-shaped path */}
          {/* Vertical bars */}
          <rect x="60" y="0" width="30" height="60" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
          <rect x="60" y="90" width="30" height="60" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
          
          {/* Horizontal bars */}
          <rect x="0" y="60" width="60" height="30" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
          <rect x="90" y="60" width="60" height="30" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />

          {/* Draw individual path cells */}
          {Array.from({ length: 52 }).map((_, idx) => {
            const pathPositions = [
              // Red path (0-12): left column going up
              { x: 10, y: 80 }, { x: 10, y: 70 }, { x: 10, y: 60 }, { x: 10, y: 50 }, { x: 10, y: 40 }, { x: 10, y: 30 },
              // Top row going right (13-25)
              { x: 20, y: 20 }, { x: 30, y: 20 }, { x: 40, y: 20 }, { x: 50, y: 20 }, { x: 60, y: 20 }, { x: 70, y: 20 },
              // Green path (26-38): right column going down  
              { x: 80, y: 10 }, { x: 80, y: 20 }, { x: 80, y: 30 }, { x: 80, y: 40 }, { x: 80, y: 50 }, { x: 80, y: 60 },
              // Right column going down (39-51)
              { x: 90, y: 70 }, { x: 100, y: 70 }, { x: 110, y: 70 }, { x: 120, y: 70 }, { x: 130, y: 70 }, { x: 140, y: 70 },
              // Yellow path: bottom row going left
              { x: 140, y: 80 }, { x: 130, y: 80 }, { x: 120, y: 80 }, { x: 110, y: 80 }, { x: 100, y: 80 }, { x: 90, y: 80 },
              // Bottom row continuing left
              { x: 80, y: 90 }, { x: 70, y: 90 }, { x: 60, y: 90 }, { x: 50, y: 90 }, { x: 40, y: 90 }, { x: 30, y: 90 },
              // Blue path: left column going up
              { x: 20, y: 100 }, { x: 20, y: 110 }, { x: 20, y: 120 }, { x: 20, y: 130 }, { x: 20, y: 140 }, { x: 10, y: 140 },
              // Continue up to complete loop
              { x: 10, y: 130 }, { x: 10, y: 120 }, { x: 10, y: 110 }, { x: 10, y: 100 }, { x: 10, y: 90 }
            ];

            const pos = pathPositions[idx];
            if (!pos) return null;

            const velvetSpace = VELVET_SPACE_POSITIONS.includes(idx);
            const isStartSpace = idx === LUDO_START_POSITIONS.red || 
                                idx === LUDO_START_POSITIONS.green ||
                                idx === LUDO_START_POSITIONS.yellow ||
                                idx === LUDO_START_POSITIONS.blue;
            
            return (
              <g key={idx}>
                <rect
                  x={pos.x - 4}
                  y={pos.y - 4}
                  width={8}
                  height={8}
                  rx={1}
                  fill={
                    velvetSpace
                      ? "rgba(255, 0, 138, 0.4)"
                      : isStartSpace
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(255, 255, 255, 0.1)"
                  }
                  stroke={
                    velvetSpace 
                      ? "#FF008A"
                      : isStartSpace
                      ? "white"
                      : "rgba(255, 255, 255, 0.2)"
                  }
                  strokeWidth={0.5}
                />
                {velvetSpace && (
                  <text
                    x={pos.x}
                    y={pos.y + 1.5}
                    textAnchor="middle"
                    fontSize={4}
                    fill="white"
                  >
                    💋
                  </text>
                )}
                {isStartSpace && (
                  <text
                    x={pos.x}
                    y={pos.y + 2}
                    textAnchor="middle"
                    fontSize={5}
                    fill="white"
                    fontWeight="bold"
                  >
                    ★
                  </text>
                )}
              </g>
            );
          })}

          {/* Center home area */}
          <polygon
            points="60,60 75,45 90,60 75,75"
            fill="rgba(255, 0, 138, 0.2)"
            stroke="#FF008A"
            strokeWidth={1}
          />
          <text
            x={75}
            y={65}
            textAnchor="middle"
            fill="#FF008A"
            fontSize={5}
            fontWeight="bold"
          >
            HOME
          </text>

          {/* Home pieces */}
          {gameState.players.map((player, playerIdx) => {
            const homePositions = [
              // Red (bottom-left)
              [{ x: 20, y: 110 }, { x: 40, y: 110 }, { x: 20, y: 130 }, { x: 40, y: 130 }],
              // Blue (top-left)  
              [{ x: 20, y: 20 }, { x: 40, y: 20 }, { x: 20, y: 40 }, { x: 40, y: 40 }],
              // Green (top-right)
              [{ x: 110, y: 20 }, { x: 130, y: 20 }, { x: 110, y: 40 }, { x: 130, y: 40 }],
              // Yellow (bottom-right)
              [{ x: 110, y: 110 }, { x: 130, y: 110 }, { x: 110, y: 130 }, { x: 130, y: 130 }],
            ];

            const homeTokens = player.tokens.filter(t => t.position === "home");
            
            return homeTokens.map((token, tokenIdx) => {
              const homePos = homePositions[playerIdx][tokenIdx];
              const isMovable = movableTokens.some(t => t.id === token.id);
              
              return (
                <motion.g
                  key={`home-${token.id}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={isMovable ? { scale: 1.3 } : {}}
                  onClick={() => isMovable && onMovePiece(token.id)}
                  style={{ cursor: isMovable ? "pointer" : "default" }}
                >
                  <circle
                    cx={homePos.x}
                    cy={homePos.y}
                    r={4}
                    fill={LUDO_COLORS_MAP[player.color]}
                    stroke="white"
                    strokeWidth={0.8}
                    style={{
                      filter: `drop-shadow(0 0 4px ${LUDO_COLORS_MAP[player.color]})`,
                    }}
                  />
                  {isMovable && (
                    <motion.circle
                      cx={homePos.x}
                      cy={homePos.y}
                      r={5}
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth={1}
                      animate={{ r: [4.5, 6.5, 4.5] }}
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
              player.tokens
                .filter((token) => token.position !== "home" && token.position !== "finished")
                .map((token) => {
                  // Main path positions (0-51) - 52 total positions
                  const mainPathPositions = [
                    // Red start area (0-5)
                    { x: 10, y: 80 }, { x: 10, y: 70 }, { x: 10, y: 60 }, { x: 10, y: 50 }, { x: 10, y: 40 }, { x: 10, y: 30 },
                    // Top row going right (6-11)
                    { x: 20, y: 20 }, { x: 30, y: 20 }, { x: 40, y: 20 }, { x: 50, y: 20 }, { x: 60, y: 20 }, { x: 70, y: 20 },
                    // Blue start area (12-17)
                    { x: 80, y: 10 }, { x: 80, y: 20 }, { x: 80, y: 30 }, { x: 80, y: 40 }, { x: 80, y: 50 }, { x: 80, y: 60 },
                    // Right column going down (18-23)
                    { x: 90, y: 70 }, { x: 100, y: 70 }, { x: 110, y: 70 }, { x: 120, y: 70 }, { x: 130, y: 70 }, { x: 140, y: 70 },
                    // Yellow start area (24-29)
                    { x: 140, y: 80 }, { x: 130, y: 80 }, { x: 120, y: 80 }, { x: 110, y: 80 }, { x: 100, y: 80 }, { x: 90, y: 80 },
                    // Bottom row going left (30-35)
                    { x: 80, y: 90 }, { x: 70, y: 90 }, { x: 60, y: 90 }, { x: 50, y: 90 }, { x: 40, y: 90 }, { x: 30, y: 90 },
                    // Green start area (36-41)
                    { x: 20, y: 100 }, { x: 20, y: 110 }, { x: 20, y: 120 }, { x: 20, y: 130 }, { x: 20, y: 140 }, { x: 10, y: 140 },
                    // Left column going up to complete loop (42-51) - 10 positions
                    { x: 10, y: 130 }, { x: 10, y: 120 }, { x: 10, y: 110 }, { x: 10, y: 100 }, 
                    { x: 10, y: 95 }, { x: 10, y: 90 }, { x: 10, y: 85 }, { x: 10, y: 82 },
                    { x: 10, y: 79 }, { x: 10, y: 76 }
                  ];
                  
                  // Color-specific safe path positions (52-56) leading to center
                  const safePathPositions: Record<LudoColor, { x: number; y: number }[]> = {
                    red: [
                      { x: 20, y: 75 }, { x: 30, y: 75 }, { x: 40, y: 75 }, { x: 50, y: 75 }, { x: 60, y: 75 }
                    ],
                    blue: [
                      { x: 75, y: 30 }, { x: 75, y: 40 }, { x: 75, y: 50 }, { x: 75, y: 60 }, { x: 75, y: 70 }
                    ],
                    green: [
                      { x: 120, y: 75 }, { x: 110, y: 75 }, { x: 100, y: 75 }, { x: 90, y: 75 }, { x: 80, y: 75 }
                    ],
                    yellow: [
                      { x: 75, y: 120 }, { x: 75, y: 110 }, { x: 75, y: 100 }, { x: 75, y: 90 }, { x: 75, y: 80 }
                    ]
                  };
                  
                  let pathCell;
                  if (token.pathProgress < LUDO_MAIN_PATH_LENGTH) {
                    // On main path - calculate actual board index based on player's start position
                    const boardIndex = (LUDO_START_POSITIONS[player.color] + token.pathProgress) % LUDO_MAIN_PATH_LENGTH;
                    pathCell = mainPathPositions[boardIndex];
                  } else {
                    // In safe zone (52-56)
                    const safeIndex = token.pathProgress - LUDO_MAIN_PATH_LENGTH;
                    pathCell = safePathPositions[player.color][safeIndex];
                  }
                  
                  if (!pathCell) return null;
                  
                  const isMovable = movableTokens.some(t => t.id === token.id);
                  
                  return (
                    <motion.g
                      key={token.id}
                      initial={{ scale: 0 }}
                      animate={{ 
                        x: pathCell.x,
                        y: pathCell.y,
                        scale: 1
                      }}
                      exit={{ scale: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                      whileHover={isMovable ? { scale: 1.3 } : {}}
                      onClick={() => isMovable && onMovePiece(token.id)}
                      style={{ cursor: isMovable ? "pointer" : "default" }}
                    >
                      <circle
                        r={3.5}
                        fill={LUDO_COLORS_MAP[player.color]}
                        stroke="white"
                        strokeWidth={0.8}
                        style={{
                          filter: `drop-shadow(0 0 4px ${LUDO_COLORS_MAP[player.color]})`,
                        }}
                      />
                      {isMovable && (
                        <motion.circle
                          r={4.5}
                          fill="none"
                          stroke="#FFD700"
                          strokeWidth={1}
                          animate={{ r: [4, 6, 4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.g>
                  );
                })
            )}
          </AnimatePresence>
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

          {canRollDice && (
            <VelvetButton
              velvetVariant="neon"
              onClick={onRollDice}
              className="w-full py-4"
              data-testid="button-roll-dice"
            >
              🎲 Roll Dice
            </VelvetButton>
          )}

          {canMovePiece && movableTokens.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Click a highlighted token to move it {gameState.diceValue} spaces
              </p>
              <p className="text-neon-magenta text-xs">
                {movableTokens.length} token{movableTokens.length > 1 ? 's' : ''} available
              </p>
            </div>
          )}

          {canMovePiece && movableTokens.length === 0 && (
            <div className="space-y-2">
              <p className="text-amber-400 text-sm font-medium">
                No valid moves available!
              </p>
              <VelvetButton
                velvetVariant="ghost-glow"
                onClick={() => {
                  // Auto-advance to next turn - handled by parent
                }}
                className="w-full"
              >
                Next Turn
              </VelvetButton>
            </div>
          )}

          {gameState.diceValue === 6 && (
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
                    idx === gameState.currentPlayerIndex ? "ring-2 ring-neon-magenta" : ""
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
