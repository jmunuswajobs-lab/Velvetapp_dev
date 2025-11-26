import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Dices, RotateCcw, CircleDot } from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetCard } from "@/components/velvet/VelvetCard";
import { HeatDice, SpinBottle, CoinFlip } from "@/components/velvet/SpicyTools";
import { FadeIn, SlideIn, StaggerChildren, staggerChildVariants } from "@/components/velvet/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tools() {
  const [activeTool, setActiveTool] = useState("dice");

  const tools = [
    { id: "dice", name: "Heat Dice", icon: Dices, description: "Roll for intensity" },
    { id: "bottle", name: "Spin Bottle", icon: RotateCcw, description: "Choose a player" },
    { id: "coin", name: "Coin Flip", icon: CircleDot, description: "Heads or tails" },
  ];

  // Demo players for bottle
  const demoPlayers = ["Alex", "Jordan", "Sam", "Riley"];

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(255, 94, 51, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 70%, rgba(59, 15, 92, 0.25) 0%, transparent 50%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={15} />

      {/* Header */}
      <header className="glass border-b border-plum-deep/30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/">
            <button 
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Games</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <FadeIn className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            Spicy Tools
          </h1>
          <p className="text-muted-foreground">
            Add some randomness to your game night
          </p>
        </FadeIn>

        {/* Tool tabs */}
        <SlideIn direction="up" delay={0.1}>
          <Tabs value={activeTool} onValueChange={setActiveTool} className="w-full">
            <TabsList className="w-full mb-8 bg-noir-soft/50 border border-plum-deep/30 p-1">
              {tools.map((tool) => (
                <TabsTrigger
                  key={tool.id}
                  value={tool.id}
                  className="flex-1 gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-velvet-red/20 data-[state=active]:to-neon-magenta/20 data-[state=active]:text-white"
                  data-testid={`tab-${tool.id}`}
                >
                  <tool.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tool.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="dice" className="focus-visible:outline-none">
              <VelvetCard tiltEnabled={false} glowColor="rgba(255, 94, 51, 0.3)" className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-display font-semibold mb-2">Heat Dice</h2>
                  <p className="text-sm text-muted-foreground">
                    Roll to determine the intensity level of your next prompt
                  </p>
                </div>
                <div className="flex justify-center">
                  <HeatDice />
                </div>
              </VelvetCard>
            </TabsContent>

            <TabsContent value="bottle" className="focus-visible:outline-none">
              <VelvetCard tiltEnabled={false} glowColor="rgba(123, 44, 179, 0.3)" className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-display font-semibold mb-2">Spin the Bottle</h2>
                  <p className="text-sm text-muted-foreground">
                    Randomly select a player for the next challenge
                  </p>
                </div>
                <div className="flex justify-center">
                  <SpinBottle players={demoPlayers} />
                </div>
              </VelvetCard>
            </TabsContent>

            <TabsContent value="coin" className="focus-visible:outline-none">
              <VelvetCard tiltEnabled={false} glowColor="rgba(227, 192, 137, 0.3)" className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-display font-semibold mb-2">Coin Flip</h2>
                  <p className="text-sm text-muted-foreground">
                    Let fate decide with a simple heads or tails
                  </p>
                </div>
                <div className="flex justify-center">
                  <CoinFlip />
                </div>
              </VelvetCard>
            </TabsContent>
          </Tabs>
        </SlideIn>

        {/* Tool cards grid */}
        <SlideIn direction="up" delay={0.2} className="mt-8">
          <h2 className="text-lg font-display font-semibold mb-4">All Tools</h2>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <motion.div key={tool.id} variants={staggerChildVariants}>
                <VelvetCard
                  onClick={() => setActiveTool(tool.id)}
                  glowColor={
                    tool.id === "dice" 
                      ? "rgba(255, 94, 51, 0.3)" 
                      : tool.id === "bottle" 
                        ? "rgba(123, 44, 179, 0.3)" 
                        : "rgba(227, 192, 137, 0.3)"
                  }
                  testId={`card-${tool.id}`}
                >
                  <div className="p-5 text-center">
                    <div 
                      className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${
                          tool.id === "dice" 
                            ? "rgba(255, 94, 51, 0.2)" 
                            : tool.id === "bottle" 
                              ? "rgba(123, 44, 179, 0.2)" 
                              : "rgba(227, 192, 137, 0.2)"
                        } 0%, rgba(5, 5, 9, 0.5) 100%)`,
                      }}
                    >
                      <tool.icon className={`w-6 h-6 ${
                        tool.id === "dice" 
                          ? "text-ember-orange" 
                          : tool.id === "bottle" 
                            ? "text-plum-light" 
                            : "text-champagne-gold"
                      }`} />
                    </div>
                    <h3 className="font-display font-semibold">{tool.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                  </div>
                </VelvetCard>
              </motion.div>
            ))}
          </StaggerChildren>
        </SlideIn>
      </main>
    </div>
  );
}
