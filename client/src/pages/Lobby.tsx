import { useEffect, useCallback, useState, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Play, Users, Clock } from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { HeatMeter } from "@/components/velvet/HeatMeter";
import { PlayerListItem } from "@/components/velvet/PlayerAvatar";
import { FadeIn, SlideIn, StaggerChildren, staggerChildVariants } from "@/components/velvet/PageTransition";
import { useOnlineRoom, useWebSocketConnection } from "@/lib/gameState";
import { useToast } from "@/hooks/use-toast";

export default function Lobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const {
    joinCode, isHost, isConnected, players, gameStarted, gameSlug,
    setConnected, updatePlayers, setGameStarted, initGameState, setGameSlug
  } = useOnlineRoom();
  const { ws, setWebSocket, setRoomAndPlayerId } = useWebSocketConnection();

  // Retrieve playerId from localStorage or generate one if it doesn't exist
  const storedPlayerId = localStorage.getItem(`playerId_${roomId}`);
  const playerId = storedPlayerId || crypto.randomUUID(); // Use playerId directly
  if (!storedPlayerId) {
    localStorage.setItem(`playerId_${roomId}`, playerId);
  }

  const [copied, setCopied] = useState(false);
  const connectionAttempted = useRef(false);

  // WebSocket connection - persists across navigation
  useEffect(() => {
    // Ensure roomId and playerId are available before attempting to connect
    if (!roomId || !playerId) {
      console.error("Missing roomId or playerId for WebSocket connection", { roomId, playerId });
      return;
    }

    // Skip if already connected or if we already tried
    if (ws && ws.readyState === WebSocket.OPEN) {
      return;
    }

    if (connectionAttempted.current && ws && ws.readyState !== WebSocket.OPEN) {
      return;
    }

    connectionAttempted.current = true;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    console.log('Connecting to WebSocket:', wsUrl, 'with playerId:', playerId);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setConnected(true);
      setRoomAndPlayerId(roomId, playerId);
      setWebSocket(socket);
      console.log("WebSocket connected, joining room:", roomId);
      socket.send(JSON.stringify({ type: "join_room", roomId, playerId }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        switch (data.type) {
          case "room_update":
            updatePlayers(data.players);
            if (data.gameSlug) {
              setGameSlug(data.gameSlug);
            }
            break;
          case "game_started":
            console.log("Game started, initializing with prompts:", data.prompts);
            initGameState(data.prompts, data.players);
            setGameStarted(true);
            setLocation(`/games/${data.gameSlug || gameSlug || 'truth-or-dare'}/play`);
            break;
          case "error":
            toast({
              title: "Error",
              description: data.message,
              variant: "destructive",
            });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to game server",
        variant: "destructive",
      });
      setConnected(false);
    };

    // Don't close on cleanup - connection persists across navigation
    return () => {};
  }, [roomId, playerId, setConnected, updatePlayers, setGameSlug, initGameState, setGameStarted, gameSlug, toast, setLocation, ws, setWebSocket, setRoomAndPlayerId]);

  const copyCode = useCallback(() => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Code copied!" });
  }, [joinCode, toast]);

  const copyLink = useCallback(() => {
    if (!joinCode) return; // Ensure joinCode exists
    navigator.clipboard.writeText(`${window.location.origin}/join/${joinCode}`);
    toast({ title: "Link copied!", description: "Share with your partner" });
  }, [joinCode, toast]);

  const toggleReady = useCallback(() => {
    // Re-fetch playerId from localStorage to ensure it's up-to-date
    const currentPlayerId = localStorage.getItem(`playerId_${roomId}`);

    if (ws?.readyState === WebSocket.OPEN && roomId && currentPlayerId) {
      console.log("Toggling ready state for player:", currentPlayerId, "in room:", roomId);
      ws.send(JSON.stringify({
        type: "toggle_ready",
        roomId,
        playerId: currentPlayerId
      }));
    } else {
      console.error("Cannot toggle ready - WebSocket not ready or missing data", {
        wsState: ws?.readyState,
        playerId: currentPlayerId,
        roomId
      });
      toast({
        title: "Connection Issue",
        description: "Could not toggle ready status. Please check your connection.",
        variant: "destructive",
      });
    }
  }, [roomId, toast, ws]); // Dependencies

  const startGame = useCallback(() => {
    if (ws?.readyState === WebSocket.OPEN && roomId) {
      console.log("Starting game in room:", roomId);
      ws.send(JSON.stringify({
        type: "start_game",
        roomId,
        playerId: localStorage.getItem(`playerId_${roomId}`), // Ensure playerId is included
      }));

      // Navigate after a short delay to ensure state is updated
      setTimeout(() => {
        // Use gameSlug from the state if available, otherwise default
        setLocation(`/games/${gameSlug || 'truth-or-dare'}/play`);
      }, 500);
    } else {
      console.error("Cannot start game - WebSocket not ready or missing roomId", {
        wsState: ws?.readyState,
        roomId
      });
      toast({
        title: "Connection Issue",
        description: "Could not start the game. Please check your connection.",
        variant: "destructive",
      });
    }
  }, [roomId, toast, setLocation, gameSlug, ws]);

  const handleStartGame = () => {
    if (!gameSlug) {
      toast({
        title: "No Game Selected",
        description: "Please select a game before starting",
        variant: "destructive",
      });
      return;
    }

    if (!players || players.length < 2) {
      toast({
        title: "Need More Players",
        description: "At least 2 players are required to start",
        variant: "destructive",
      });
      return;
    }

    const allReady = players.every(p => p.isReady || p.isHost);
    if (!allReady) {
      toast({
        title: "Players Not Ready",
        description: "All players must be ready before starting",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting game with slug:", gameSlug);
    startGame();
  };

  const allReady = players.length >= 2 && players.every((p) => p.isReady || p.isHost);
  const readyCount = players.filter((p) => p.isReady || p.isHost).length;
  const heatFromPlayers = Math.min(100, (readyCount / Math.max(players.length, 2)) * 100);

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(255, 0, 138, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(176, 15, 47, 0.25) 0%, transparent 50%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={15} />

      {/* Header */}
      <header className="glass border-b border-plum-deep/30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/">
            <button
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Leave Lobby</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Connection status */}
        <FadeIn className="mb-6">
          <div className="flex items-center justify-center gap-2 text-sm">
            <motion.div
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-muted-foreground">
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </FadeIn>

        {/* Room code card */}
        <SlideIn direction="up" delay={0.1} className="mb-6">
          <VelvetCard tiltEnabled={false} glowColor="rgba(255, 0, 138, 0.35)" className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Room Code</p>
              <div className="flex items-center justify-center gap-3">
                <motion.p
                  className="text-4xl font-mono font-bold tracking-[0.3em] gradient-text"
                  animate={{
                    textShadow: [
                      "0 0 10px rgba(255, 0, 138, 0.5)",
                      "0 0 20px rgba(255, 0, 138, 0.8)",
                      "0 0 10px rgba(255, 0, 138, 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {joinCode || "------"}
                </motion.p>

                <motion.button
                  onClick={copyCode}
                  className="p-2 rounded-lg bg-plum-deep/30 hover:bg-plum-deep/50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid="button-copy-code"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.button>
              </div>

              <VelvetButton
                velvetVariant="ghost-glow"
                size="sm"
                onClick={copyLink}
                className="mt-4"
                data-testid="button-copy-link"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Invite Link
              </VelvetButton>
            </div>
          </VelvetCard>
        </SlideIn>

        {/* Heat meter */}
        <SlideIn direction="up" delay={0.2} className="mb-6">
          <VelvetCard tiltEnabled={false} className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Waiting for players...</span>
            </div>
            <HeatMeter value={heatFromPlayers} size="lg" />
          </VelvetCard>
        </SlideIn>

        {/* Players list */}
        <SlideIn direction="up" delay={0.3} className="mb-6">
          <VelvetCard tiltEnabled={false} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-magenta" />
                Players ({players.length})
              </h2>
              <span className="text-sm text-muted-foreground">
                {readyCount} ready
              </span>
            </div>

            {players.length === 0 ? (
              <div className="text-center py-8">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed border-plum-deep/50 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Users className="w-8 h-8 text-muted-foreground/30" />
                </motion.div>
                <p className="text-muted-foreground">Waiting for players to join...</p>
              </div>
            ) : (
              <StaggerChildren className="space-y-3">
                {players.map((player) => {
                  // Get current playerId from localStorage
                  const currentPlayerId = localStorage.getItem(`playerId_${roomId}`);
                  const isCurrentPlayer = player.id === currentPlayerId;

                  return (
                    <motion.div key={player.id} variants={staggerChildVariants}>
                      <PlayerListItem
                        nickname={player.nickname}
                        color={player.avatarColor}
                        isHost={player.isHost}
                        isReady={player.isReady}
                        showReadyButton={isCurrentPlayer && !player.isHost}
                        onReadyToggle={toggleReady} // Use the updated toggleReady
                      />
                    </motion.div>
                  );
                })}
              </StaggerChildren>
            )}
          </VelvetCard>
        </SlideIn>

        {/* Start button (host only) */}
        {isHost && (
          <SlideIn direction="up" delay={0.4}>
            <VelvetButton
              velvetVariant="velvet"
              className="w-full py-6 text-lg"
              onClick={handleStartGame} // Use the new handler
              disabled={!allReady}
              data-testid="button-start-game"
            >
              {allReady ? "Start Game" : `Waiting for players (${readyCount}/${players.length})`}
            </VelvetButton>
          </SlideIn>
        )}

        {!isHost && (
          <SlideIn direction="up" delay={0.4}>
            <VelvetButton
              velvetVariant="neon"
              className="w-full py-6 text-lg"
              onClick={toggleReady} // Use the updated toggleReady
              data-testid="button-ready"
            >
              {(() => {
                const currentPlayerId = localStorage.getItem(`playerId_${roomId}`);
                const currentPlayer = players.find((p) => p.id === currentPlayerId);
                return currentPlayer?.isReady ? "Ready!" : "Ready Up";
              })()}
            </VelvetButton>
          </SlideIn>
        )}
      </main>
    </div>
  );
}