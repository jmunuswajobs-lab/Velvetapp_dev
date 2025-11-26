import { motion } from "framer-motion";
import { Shield, Heart, Wine, AlertTriangle } from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";
import { useAgeVerification } from "@/lib/gameState";
import { useLocation } from "wouter";

export default function AgeGate() {
  const { setVerified } = useAgeVerification();
  const [, setLocation] = useLocation();

  const handleConfirm = () => {
    setVerified();
    setLocation("/");
  };

  const handleDecline = () => {
    window.location.href = "https://google.com";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(59, 15, 92, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(176, 15, 47, 0.3) 0%, transparent 50%),
            linear-gradient(180deg, #050509 0%, #0A0A12 50%, #050509 100%)
          `,
        }}
      />

      {/* Ember particles */}
      <EmberParticles count={30} />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{
              background: "linear-gradient(135deg, #FF008A 0%, #B00F2F 100%)",
              boxShadow: "0 0 40px rgba(255, 0, 138, 0.4)",
            }}
            animate={{
              boxShadow: [
                "0 0 30px rgba(255, 0, 138, 0.4)",
                "0 0 50px rgba(255, 0, 138, 0.6)",
                "0 0 30px rgba(255, 0, 138, 0.4)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-4xl font-display font-bold text-white">V</span>
          </motion.div>
          
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            VelvetPlay Online
          </h1>
          <p className="text-muted-foreground text-sm">
            Premium Couples & Party Games
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* 18+ Badge */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-velvet-red"
              style={{
                background: "linear-gradient(135deg, rgba(176, 15, 47, 0.3) 0%, rgba(176, 15, 47, 0.1) 100%)",
              }}
            >
              <span className="text-2xl font-bold text-velvet-red">18+</span>
            </div>
          </motion.div>

          {/* Disclaimer items */}
          <div className="space-y-4 mb-6">
            {[
              { icon: Shield, text: "This content is for adults only (18+)" },
              { icon: Heart, text: "Games contain flirty, spicy, but non-explicit content" },
              { icon: Wine, text: "Please drink responsibly if playing drinking games" },
              { icon: AlertTriangle, text: "Respect boundaries and prioritize consent" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-plum-deep/30">
                  <item.icon className="w-4 h-4 text-neon-magenta" />
                </div>
                <p className="text-sm text-foreground/80 pt-1">{item.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Buttons */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <VelvetButton
              velvetVariant="neon"
              className="w-full"
              onClick={handleConfirm}
              data-testid="button-confirm-age"
            >
              I am 18 or older - Enter
            </VelvetButton>
            
            <button
              onClick={handleDecline}
              className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-decline-age"
            >
              I am under 18 - Exit
            </button>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          By entering, you agree to our terms and confirm you are of legal age.
        </motion.p>
      </motion.div>
    </div>
  );
}
