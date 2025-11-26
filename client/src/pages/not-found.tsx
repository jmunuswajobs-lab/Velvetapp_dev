import { Link } from "wouter";
import { motion } from "framer-motion";
import { Flame, Home, ArrowLeft } from "lucide-react";
import { EmberParticles } from "@/components/velvet/EmberParticles";
import { VelvetButton } from "@/components/velvet/VelvetButton";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(59, 15, 92, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 70%, rgba(176, 15, 47, 0.2) 0%, transparent 50%),
            linear-gradient(180deg, #050509 0%, #0A0A12 100%)
          `,
        }}
      />
      <EmberParticles count={15} />

      <motion.div
        className="text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 404 number */}
        <motion.div
          className="text-8xl md:text-9xl font-display font-bold mb-4"
          style={{
            background: "linear-gradient(90deg, #FF008A 0%, #FF2E6D 50%, #FF5E33 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          animate={{
            textShadow: [
              "0 0 20px rgba(255, 0, 138, 0.4)",
              "0 0 40px rgba(255, 0, 138, 0.6)",
              "0 0 20px rgba(255, 0, 138, 0.4)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          404
        </motion.div>

        {/* Icon */}
        <motion.div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(255, 0, 138, 0.2) 0%, rgba(176, 15, 47, 0.2) 100%)",
            border: "1px solid rgba(255, 0, 138, 0.3)",
          }}
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 20px rgba(255, 0, 138, 0.3)",
              "0 0 40px rgba(255, 0, 138, 0.5)",
              "0 0 20px rgba(255, 0, 138, 0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame className="w-10 h-10 text-neon-magenta" />
        </motion.div>

        {/* Text */}
        <h1 className="text-2xl font-display font-bold mb-2">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like this page got a little too spicy and disappeared. 
          Let's get you back to the good stuff.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <VelvetButton velvetVariant="neon" data-testid="button-go-home">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </VelvetButton>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
