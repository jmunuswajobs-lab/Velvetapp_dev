import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Copy, Check, Users, LogIn } from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { VelvetInput } from "@/components/velvet/VelvetInput";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { IntensitySlider } from "@/components/velvet/IntensitySlider";
import { FadeIn, SlideIn } from "@/components/velvet/PageTransition";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOnlineRoom, getRandomAvatarColor } from "@/lib/gameState";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Game, RoomSettings } from "@shared/schema";

export default function OnlineSetup() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { setRoom } = useOnlineRoom();
  const { toast } = useToast();

  const [nickname, setNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<RoomSettings>({
    intensity: 3,
    allowNSFW: false,
    allowMovement: true,
    coupleMode: false,
    packs: [],
  });

  const { data: game } = useQuery<Game>({
    queryKey: [`/api/games/${slug}`],
    enabled: !!slug,
  });

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/rooms", {
        gameId: game?.id,
        nickname,
        settings,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setRoom(data.roomId, data.joinCode, true);
      localStorage.setItem(`playerId_${data.roomId}`, data.playerId);
      setLocation(`/lobby/${data.roomId}`);
    },
    onError: (error) => {
      toast({
        title: "Error creating room",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/rooms/join", {
        joinCode: joinCode.toUpperCase(),
        nickname,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setRoom(data.roomId, joinCode.toUpperCase(), false);
      localStorage.setItem(`playerId_${data.roomId}`, data.playerId);
      setLocation(`/lobby/${data.roomId}`);
    },
    onError: (error) => {
      toast({
        title: "Error joining room",
        description: error instanceof Error ? error.message : "Invalid room code",
        variant: "destructive",
      });
    },
  });

  const copyJoinLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${joinCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Share this with your partner",
    });
  };

  const isCreateValid = nickname.trim().length >= 2 && game?.id;
  const isJoinValid = nickname.trim().length >= 2 && joinCode.length === 6;

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(255, 0, 138, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(59, 15, 92, 0.3) 0%, transparent 50%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={12} />

      {/* Header */}
      <header className="glass border-b border-plum-deep/30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href={`/games/${slug}`}>
            <button 
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {game?.name}</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <FadeIn className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(255, 0, 138, 0.3) 0%, rgba(176, 15, 47, 0.3) 100%)",
              border: "1px solid rgba(255, 0, 138, 0.4)",
            }}
          >
            <Globe className="w-8 h-8 text-neon-magenta" />
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            Online Play
          </h1>
          <p className="text-muted-foreground">
            Play together across devices in real-time
          </p>
        </FadeIn>

        {/* Nickname input - always visible */}
        <SlideIn direction="up" delay={0.1} className="mb-6">
          <VelvetCard tiltEnabled={false} className="p-6">
            <Label className="text-sm text-muted-foreground mb-2 block">
              Your Nickname
            </Label>
            <VelvetInput
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              data-testid="input-nickname"
            />
          </VelvetCard>
        </SlideIn>

        {/* Tabs for Create/Join */}
        <SlideIn direction="up" delay={0.2}>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="w-full mb-6 bg-noir-soft/50 border border-plum-deep/30">
              <TabsTrigger 
                value="create" 
                className="flex-1 data-[state=active]:bg-neon-magenta/20 data-[state=active]:text-neon-magenta"
                data-testid="tab-create"
              >
                Create Room
              </TabsTrigger>
              <TabsTrigger 
                value="join" 
                className="flex-1 data-[state=active]:bg-neon-magenta/20 data-[state=active]:text-neon-magenta"
                data-testid="tab-join"
              >
                Join Room
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <VelvetCard tiltEnabled={false} className="p-6 mb-6">
                <h2 className="text-lg font-display font-semibold mb-4">
                  Game Settings
                </h2>

                <div className="space-y-6">
                  <IntensitySlider
                    value={settings.intensity}
                    onChange={(v) => setSettings({ ...settings, intensity: v })}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="couple-mode" className="text-sm font-medium">
                          Couple Mode
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Prompts designed for two people
                        </p>
                      </div>
                      <Switch
                        id="couple-mode"
                        checked={settings.coupleMode}
                        onCheckedChange={(v) => setSettings({ ...settings, coupleMode: v })}
                        data-testid="switch-couple-mode"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allow-nsfw" className="text-sm font-medium text-heat-pink">
                          Extra Spicy Mode
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          More daring prompts
                        </p>
                      </div>
                      <Switch
                        id="allow-nsfw"
                        checked={settings.allowNSFW}
                        onCheckedChange={(v) => setSettings({ ...settings, allowNSFW: v })}
                        data-testid="switch-nsfw"
                      />
                    </div>
                  </div>
                </div>
              </VelvetCard>

              <VelvetButton
                velvetVariant="neon"
                className="w-full py-6 text-lg"
                onClick={() => createRoomMutation.mutate()}
                disabled={!isCreateValid || createRoomMutation.isPending}
                data-testid="button-create-room"
              >
                {createRoomMutation.isPending ? (
                  <>Creating Room...</>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Create Room
                  </>
                )}
              </VelvetButton>
            </TabsContent>

            <TabsContent value="join">
              <VelvetCard tiltEnabled={false} className="p-6 mb-6">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Room Code
                </Label>
                <VelvetInput
                  placeholder="Enter 6-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest"
                  data-testid="input-join-code"
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Ask the host for the room code
                </p>
              </VelvetCard>

              <VelvetButton
                velvetVariant="velvet"
                className="w-full py-6 text-lg"
                onClick={() => joinRoomMutation.mutate()}
                disabled={!isJoinValid || joinRoomMutation.isPending}
                data-testid="button-join-room"
              >
                {joinRoomMutation.isPending ? (
                  <>Joining...</>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Join Room
                  </>
                )}
              </VelvetButton>
            </TabsContent>
          </Tabs>
        </SlideIn>
      </main>
    </div>
  );
}
