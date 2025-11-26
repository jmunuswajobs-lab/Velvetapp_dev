import { motion } from "framer-motion";
import { Crown, Check } from "lucide-react";

interface PlayerAvatarProps {
  nickname: string;
  color?: string;
  isHost?: boolean;
  isReady?: boolean;
  isCurrentTurn?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: { container: "w-8 h-8", text: "text-xs", badge: "w-3 h-3" },
  md: { container: "w-12 h-12", text: "text-sm", badge: "w-4 h-4" },
  lg: { container: "w-16 h-16", text: "text-lg", badge: "w-5 h-5" },
};

export function PlayerAvatar({ 
  nickname, 
  color = "#FF008A", 
  isHost = false, 
  isReady = false,
  isCurrentTurn = false,
  size = "md",
  className = "",
}: PlayerAvatarProps) {
  const styles = sizeStyles[size];
  const initials = nickname.slice(0, 2).toUpperCase();

  return (
    <div className={`relative ${className}`} data-testid={`avatar-${nickname}`}>
      <motion.div
        className={`
          ${styles.container} rounded-full flex items-center justify-center
          font-semibold ${styles.text}
          border-2 transition-all duration-300
        `}
        style={{
          background: `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`,
          borderColor: isCurrentTurn ? color : `${color}50`,
          boxShadow: isCurrentTurn ? `0 0 20px ${color}60` : undefined,
        }}
        animate={isCurrentTurn ? {
          scale: [1, 1.05, 1],
          boxShadow: [
            `0 0 10px ${color}40`,
            `0 0 25px ${color}60`,
            `0 0 10px ${color}40`,
          ],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: isCurrentTurn ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <span style={{ color }}>{initials}</span>
      </motion.div>

      {/* Host crown */}
      {isHost && (
        <motion.div
          className={`absolute -top-1 -right-1 ${styles.badge} rounded-full bg-champagne-gold flex items-center justify-center`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500 }}
          style={{
            boxShadow: "0 0 10px rgba(227, 192, 137, 0.6)",
          }}
        >
          <Crown className="w-2/3 h-2/3 text-noir-black" />
        </motion.div>
      )}

      {/* Ready indicator */}
      {isReady && !isHost && (
        <motion.div
          className={`absolute -top-1 -right-1 ${styles.badge} rounded-full bg-green-500 flex items-center justify-center`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
          style={{
            boxShadow: "0 0 10px rgba(74, 222, 128, 0.6)",
          }}
        >
          <Check className="w-2/3 h-2/3 text-white" />
        </motion.div>
      )}
    </div>
  );
}

interface PlayerListItemProps {
  nickname: string;
  color?: string;
  isHost?: boolean;
  isReady?: boolean;
  isCurrentTurn?: boolean;
  onReadyToggle?: () => void;
  showReadyButton?: boolean;
}

export function PlayerListItem({
  nickname,
  color = "#FF008A",
  isHost = false,
  isReady = false,
  isCurrentTurn = false,
  onReadyToggle,
  showReadyButton = false,
}: PlayerListItemProps) {
  return (
    <motion.div
      className={`
        flex items-center gap-3 p-3 rounded-lg
        bg-noir-soft/50 border transition-all duration-300
        ${isCurrentTurn ? "border-neon-magenta/50" : "border-plum-deep/30"}
      `}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        boxShadow: isCurrentTurn ? `0 0 15px ${color}30` : undefined,
      }}
      data-testid={`player-item-${nickname}`}
    >
      <PlayerAvatar
        nickname={nickname}
        color={color}
        isHost={isHost}
        isReady={isReady}
        isCurrentTurn={isCurrentTurn}
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{nickname}</p>
        <p className="text-xs text-muted-foreground">
          {isHost ? "Host" : isReady ? "Ready" : "Waiting..."}
        </p>
      </div>

      {showReadyButton && !isHost && (
        <motion.button
          onClick={onReadyToggle}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-300
            ${isReady 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-plum-deep/30 text-white/70 border border-plum-deep/50 hover:border-neon-magenta/50"
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid={`ready-button-${nickname}`}
        >
          {isReady ? "Ready!" : "Ready?"}
        </motion.button>
      )}
    </motion.div>
  );
}
