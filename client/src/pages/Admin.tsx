import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Plus, Edit, Trash2, Flame, 
  Package, MessageSquare, Save, X, Shield
} from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { VelvetInput } from "@/components/velvet/VelvetInput";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { IntensitySlider } from "@/components/velvet/IntensitySlider";
import { SpiceIndicator } from "@/components/velvet/SpicyBadge";
import { FadeIn, SlideIn } from "@/components/velvet/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Game, Pack, Prompt, PromptType, PromptFlags } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("games");
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [showNewPromptForm, setShowNewPromptForm] = useState(false);

  // Queries
  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const { data: packs } = useQuery<Pack[]>({
    queryKey: ["/api/packs"],
  });

  const { data: prompts } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
  });

  // New prompt form state
  const [newPrompt, setNewPrompt] = useState({
    gameId: "",
    packId: "",
    text: "",
    type: "truth" as PromptType,
    intensity: 3,
    flags: {} as PromptFlags,
  });

  // Mutations
  const createPromptMutation = useMutation({
    mutationFn: async (data: typeof newPrompt) => {
      const res = await apiRequest("POST", "/api/prompts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      setShowNewPromptForm(false);
      setNewPrompt({
        gameId: "",
        packId: "",
        text: "",
        type: "truth",
        intensity: 3,
        flags: {},
      });
      toast({ title: "Prompt created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error creating prompt",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const deletePromptMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/prompts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({ title: "Prompt deleted" });
    },
  });

  const stats = {
    totalGames: games?.length || 0,
    totalPacks: packs?.length || 0,
    totalPrompts: prompts?.length || 0,
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 10% 20%, rgba(59, 15, 92, 0.2) 0%, transparent 40%),
            radial-gradient(ellipse at 90% 80%, rgba(176, 15, 47, 0.15) 0%, transparent 40%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={8} />

      {/* Header */}
      <header className="glass border-b border-plum-deep/30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <button 
                className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to App</span>
              </button>
            </Link>

            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-champagne-gold" />
              <span className="font-display font-semibold">Admin Panel</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <FadeIn className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            <VelvetCard tiltEnabled={false} className="p-4 text-center">
              <Flame className="w-6 h-6 text-velvet-red mx-auto mb-2" />
              <p className="text-2xl font-display font-bold">{stats.totalGames}</p>
              <p className="text-xs text-muted-foreground">Games</p>
            </VelvetCard>
            <VelvetCard tiltEnabled={false} className="p-4 text-center">
              <Package className="w-6 h-6 text-plum-light mx-auto mb-2" />
              <p className="text-2xl font-display font-bold">{stats.totalPacks}</p>
              <p className="text-xs text-muted-foreground">Packs</p>
            </VelvetCard>
            <VelvetCard tiltEnabled={false} className="p-4 text-center">
              <MessageSquare className="w-6 h-6 text-neon-magenta mx-auto mb-2" />
              <p className="text-2xl font-display font-bold">{stats.totalPrompts}</p>
              <p className="text-xs text-muted-foreground">Prompts</p>
            </VelvetCard>
          </div>
        </FadeIn>

        {/* Tabs */}
        <SlideIn direction="up" delay={0.1}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6 bg-noir-soft/50 border border-plum-deep/30">
              <TabsTrigger 
                value="games" 
                className="flex-1 data-[state=active]:bg-neon-magenta/20"
                data-testid="tab-games"
              >
                Games
              </TabsTrigger>
              <TabsTrigger 
                value="packs" 
                className="flex-1 data-[state=active]:bg-neon-magenta/20"
                data-testid="tab-packs"
              >
                Packs
              </TabsTrigger>
              <TabsTrigger 
                value="prompts" 
                className="flex-1 data-[state=active]:bg-neon-magenta/20"
                data-testid="tab-prompts"
              >
                Prompts
              </TabsTrigger>
            </TabsList>

            {/* Games Tab */}
            <TabsContent value="games">
              <VelvetCard tiltEnabled={false} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-display font-semibold">Games</h2>
                </div>

                <div className="space-y-3">
                  {games?.map((game) => (
                    <div 
                      key={game.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-noir-soft/50 border border-plum-deep/30"
                    >
                      <div className="flex items-center gap-3">
                        <Flame className="w-5 h-5 text-velvet-red" />
                        <div>
                          <p className="font-medium">{game.name}</p>
                          <p className="text-xs text-muted-foreground">{game.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <SpiceIndicator level={3} size="sm" />
                        <button className="p-1.5 text-muted-foreground hover:text-white">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </VelvetCard>
            </TabsContent>

            {/* Packs Tab */}
            <TabsContent value="packs">
              <VelvetCard tiltEnabled={false} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-display font-semibold">Packs</h2>
                </div>

                <div className="space-y-3">
                  {packs?.map((pack) => (
                    <div 
                      key={pack.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-noir-soft/50 border border-plum-deep/30"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-plum-light" />
                        <div>
                          <p className="font-medium">{pack.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Intensity: {pack.intensity}
                          </p>
                        </div>
                      </div>
                      <button className="p-1.5 text-muted-foreground hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </VelvetCard>
            </TabsContent>

            {/* Prompts Tab */}
            <TabsContent value="prompts">
              <VelvetCard tiltEnabled={false} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-display font-semibold">Prompts</h2>
                  <VelvetButton
                    velvetVariant="neon"
                    size="sm"
                    onClick={() => setShowNewPromptForm(true)}
                    data-testid="button-add-prompt"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Prompt
                  </VelvetButton>
                </div>

                {/* New Prompt Form */}
                {showNewPromptForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-6 p-4 rounded-lg bg-noir-deep border border-neon-magenta/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">New Prompt</h3>
                      <button
                        onClick={() => setShowNewPromptForm(false)}
                        className="text-muted-foreground hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Game</Label>
                          <Select
                            value={newPrompt.gameId}
                            onValueChange={(v) => setNewPrompt({ ...newPrompt, gameId: v })}
                          >
                            <SelectTrigger data-testid="select-game">
                              <SelectValue placeholder="Select game" />
                            </SelectTrigger>
                            <SelectContent>
                              {games?.map((game) => (
                                <SelectItem key={game.id} value={game.id}>
                                  {game.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm">Type</Label>
                          <Select
                            value={newPrompt.type}
                            onValueChange={(v) => setNewPrompt({ ...newPrompt, type: v as PromptType })}
                          >
                            <SelectTrigger data-testid="select-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="truth">Truth</SelectItem>
                              <SelectItem value="dare">Dare</SelectItem>
                              <SelectItem value="challenge">Challenge</SelectItem>
                              <SelectItem value="confession">Confession</SelectItem>
                              <SelectItem value="vote">Vote</SelectItem>
                              <SelectItem value="rule">Rule</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm">Prompt Text</Label>
                        <Textarea
                          value={newPrompt.text}
                          onChange={(e) => setNewPrompt({ ...newPrompt, text: e.target.value })}
                          placeholder="Enter the prompt text..."
                          className="bg-noir-soft border-plum-deep/50"
                          data-testid="input-prompt-text"
                        />
                      </div>

                      <IntensitySlider
                        value={newPrompt.intensity}
                        onChange={(v) => setNewPrompt({ ...newPrompt, intensity: v })}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Flirty</Label>
                          <Switch
                            checked={newPrompt.flags.isFlirty || false}
                            onCheckedChange={(v) => setNewPrompt({
                              ...newPrompt,
                              flags: { ...newPrompt.flags, isFlirty: v }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Bold</Label>
                          <Switch
                            checked={newPrompt.flags.isBold || false}
                            onCheckedChange={(v) => setNewPrompt({
                              ...newPrompt,
                              flags: { ...newPrompt.flags, isBold: v }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Couple Only</Label>
                          <Switch
                            checked={newPrompt.flags.isCoupleExclusive || false}
                            onCheckedChange={(v) => setNewPrompt({
                              ...newPrompt,
                              flags: { ...newPrompt.flags, isCoupleExclusive: v }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Remote Safe</Label>
                          <Switch
                            checked={newPrompt.flags.safeForRemote || false}
                            onCheckedChange={(v) => setNewPrompt({
                              ...newPrompt,
                              flags: { ...newPrompt.flags, safeForRemote: v }
                            })}
                          />
                        </div>
                      </div>

                      <VelvetButton
                        velvetVariant="velvet"
                        className="w-full"
                        onClick={() => createPromptMutation.mutate(newPrompt)}
                        disabled={!newPrompt.gameId || !newPrompt.text || createPromptMutation.isPending}
                        data-testid="button-save-prompt"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {createPromptMutation.isPending ? "Saving..." : "Save Prompt"}
                      </VelvetButton>
                    </div>
                  </motion.div>
                )}

                {/* Prompts list */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {prompts?.slice(0, 50).map((prompt) => (
                    <div 
                      key={prompt.id}
                      className="flex items-start justify-between p-3 rounded-lg bg-noir-soft/50 border border-plum-deep/30"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2">{prompt.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-plum-deep/30 text-plum-light">
                            {prompt.type}
                          </span>
                          <SpiceIndicator level={prompt.intensity} size="sm" />
                        </div>
                      </div>
                      <button
                        onClick={() => deletePromptMutation.mutate(prompt.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive ml-2"
                        data-testid={`button-delete-prompt-${prompt.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </VelvetCard>
            </TabsContent>
          </Tabs>
        </SlideIn>
      </main>
    </div>
  );
}
