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

const BOARD_POSITIONS = generateBoardPositions();

function generateBoardPositions(): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const size = 15;
  const cellSize = 100 / size;

  for (let i = 0; i < 52; i++) {
    let x = 0, y = 0;
    
    if (i < 6) { x = 1 + i; y = 6; }
    else if (i < 13) { x = 6; y = 5 - (i - 6); }
    else if (i < 19) { x = 7 + (i - 13); y = 0; }
    else if (i < 26) { x = 13; y = 1 + (i - 19); }
    else if (i < 32) { x = 14 - (i - 26); y = 6; }
    else if (i < 39) { x = 8; y = 7 + (i - 32); }
    else if (i < 45) { x = 7 - (i - 39); y = 14; }
    else { x = 1; y = 13 - (i - 45); }

    positions.push({ x: x * cellSize, y: y * cellSize });
  }

  return positions;
}

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

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center justify-center w-full max-w-5xl mx-auto">
      <div 
        className="relative w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, rgba(59, 15, 92, 0.4) 0%, rgba(176, 15, 47, 0.2) 100%),
            linear-gradient(180deg, #0A0A12 0%, #050509 100%)
          `,
          boxShadow: "0 0 60px rgba(255, 0, 138, 0.2), inset 0 0 60px rgba(255, 0, 138, 0.05)",
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {BOARD_POSITIONS.map((pos, idx) => {
            const velvetSpace = gameState.velvetSpaces.find(v => v.position === idx);
            const isStartSpace = Object.values(LUDO_START_POSITIONS).includes(idx);
            
            const getTileColor = () => {
              if (!velvetSpace) return "rgba(255, 255, 255, 0.05)";
              switch (velvetSpace.type) {
                case "heat": return "rgba(255, 0, 138, 0.4)";
                case "bond": return "rgba(138, 0, 255, 0.3)";
                case "freeze": return "rgba(0, 200, 255, 0.3)";
                case "wild": return "rgba(255, 200, 0, 0.3)";
                default: return "rgba(255, 0, 138, 0.3)";
              }
            };
            
            const getTileStroke = () => {
              if (!velvetSpace) return "rgba(255, 255, 255, 0.1)";
              switch (velvetSpace.type) {
                case "heat": return "#FF008A";
                case "bond": return "#8A00FF";
                case "freeze": return "#00C8FF";
                case "wild": return "#FFC800";
                default: return "#FF008A";
              }
            };
            
            const getTileIcon = () => {
              if (!velvetSpace) return null;
              switch (velvetSpace.type) {
                case "heat": return "🔥";
                case "bond": return "💕";
                case "freeze": return "❄️";
                case "wild": return "✨";
                default: return "💋";
              }
            };
            
            return (
              <g key={idx}>
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={6.5}
                  height={6.5}
                  rx={1}
                  fill={getTileColor()}
                  stroke={getTileStroke()}
                  strokeWidth={0.3}
                  className="transition-colors"
                />
                {velvetSpace && (
                  <text
                    x={pos.x + 3.25}
                    y={pos.y + 4.5}
                    textAnchor="middle"
                    fontSize={2.5}
                  >
                    {getTileIcon()}
                  </text>
                )}
              </g>
            );
          })}

          <AnimatePresence>
            {gameState.players.map((player) =>
              player.pieces
                .filter((piece) => piece.position >= 0)
                .map((piece) => {
                  const pos = BOARD_POSITIONS[piece.position] || { x: 50, y: 50 };
                  return (
                    <motion.circle
                      key={piece.id}
                      cx={pos.x + 3.25}
                      cy={pos.y + 3.25}
                      r={2.5}
                      fill={LUDO_COLORS_MAP[player.color]}
                      stroke="white"
                      strokeWidth={0.3}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      whileHover={{ scale: 1.2 }}
                      className={canMove ? "cursor-pointer" : ""}
                      onClick={() => canMove && onMovePiece(piece.id)}
                      style={{
                        filter: `drop-shadow(0 0 3px ${LUDO_COLORS_MAP[player.color]})`,
                      }}
                      data-testid={`ludo-piece-${piece.id}`}
                    />
                  );
                })
            )}
          </AnimatePresence>

          {gameState.players.map((player, idx) => {
            const homePositions = [
              { x: 15, y: 15 },
              { x: 75, y: 15 },
              { x: 75, y: 75 },
              { x: 15, y: 75 },
            ];
            const homePos = homePositions[idx];
            const piecesAtHome = player.pieces.filter(p => p.position === -1);

            return (
              <g key={`home-${player.id}`}>
                <rect
                  x={homePos.x - 10}
                  y={homePos.y - 10}
                  width={20}
                  height={20}
                  rx={2}
                  fill={`${LUDO_COLORS_MAP[player.color]}22`}
                  stroke={LUDO_COLORS_MAP[player.color]}
                  strokeWidth={0.5}
                />
                {piecesAtHome.map((piece, pIdx) => {
                  const offsets = [
                    { x: -4, y: -4 },
                    { x: 4, y: -4 },
                    { x: -4, y: 4 },
                    { x: 4, y: 4 },
                  ];
                  return (
                    <motion.circle
                      key={piece.id}
                      cx={homePos.x + offsets[pIdx].x}
                      cy={homePos.y + offsets[pIdx].y}
                      r={2.5}
                      fill={LUDO_COLORS_MAP[player.color]}
                      stroke="white"
                      strokeWidth={0.3}
                      whileHover={canMove && gameState.diceValue === 6 ? { scale: 1.2 } : {}}
                      className={canMove && gameState.diceValue === 6 ? "cursor-pointer" : ""}
                      onClick={() => canMove && gameState.diceValue === 6 && onMovePiece(piece.id)}
                      style={{
                        filter: `drop-shadow(0 0 3px ${LUDO_COLORS_MAP[player.color]})`,
                      }}
                      data-testid={`ludo-piece-home-${piece.id}`}
                    />
                  );
                })}
              </g>
            );
          })}

          <rect
            x={42}
            y={42}
            width={16}
            height={16}
            rx={2}
            fill="rgba(255, 0, 138, 0.2)"
            stroke="#FF008A"
            strokeWidth={0.5}
          />
          <text
            x={50}
            y={51}
            textAnchor="middle"
            fill="#FF008A"
            fontSize={3}
            fontWeight="bold"
          >
            HOME
          </text>
        </svg>
      </div>

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
              Roll Dice
            </VelvetButton>
          )}

          {canMove && (
            <p className="text-muted-foreground text-sm">
              Click a piece to move it {gameState.diceValue} spaces
            </p>
          )}

          {gameState.canRollAgain && (
            <p className="text-neon-magenta text-sm font-medium">
              You rolled a 6! Roll again after moving.
            </p>
          )}

          <div className="pt-4 border-t border-plum-deep/30">
            <p className="text-xs text-muted-foreground mb-2">Players</p>
            <div className="flex justify-center gap-3">
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
