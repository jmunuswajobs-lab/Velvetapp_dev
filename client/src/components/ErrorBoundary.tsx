import { Component, type ReactNode, type ErrorInfo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          style={{
            background: `
              radial-gradient(ellipse at 50% 30%, rgba(176, 15, 47, 0.2) 0%, transparent 50%),
              linear-gradient(180deg, #050509 0%, #0A0A12 100%)
            `,
          }}
        >
          <motion.div
            className="glass-card rounded-2xl p-8 max-w-md w-full text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(176, 15, 47, 0.3) 0%, rgba(176, 15, 47, 0.1) 100%)",
                border: "1px solid rgba(176, 15, 47, 0.4)",
              }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(176, 15, 47, 0.3)",
                  "0 0 40px rgba(176, 15, 47, 0.5)",
                  "0 0 20px rgba(176, 15, 47, 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-8 h-8 text-velvet-red" />
            </motion.div>

            <h1 className="text-2xl font-display font-bold mb-2 gradient-text">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              Don't worry, your game progress is safe. Try refreshing the page.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 rounded-lg bg-noir-deep/50 text-left">
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <motion.button
                onClick={this.handleGoHome}
                className="flex-1 py-3 rounded-lg bg-plum-deep/30 text-white font-medium flex items-center justify-center gap-2 border border-plum-deep/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-4 h-4" />
                Go Home
              </motion.button>
              
              <motion.button
                onClick={this.handleRefresh}
                className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(90deg, #FF008A 0%, #B00F2F 100%)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </motion.button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
