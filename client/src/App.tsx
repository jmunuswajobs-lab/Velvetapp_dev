import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAgeVerification } from "@/lib/gameState";

// Pages
import AgeGate from "@/pages/AgeGate";
import Home from "@/pages/Home";
import GameDetail from "@/pages/GameDetail";
import LocalSetup from "@/pages/LocalSetup";
import OnlineSetup from "@/pages/OnlineSetup";
import Lobby from "@/pages/Lobby";
import Gameplay from "@/pages/Gameplay";
import Tools from "@/pages/Tools";
import Summary from "@/pages/Summary";
import Rules from "@/pages/Rules";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const { isVerified } = useAgeVerification();

  // Force age verification on all routes except admin
  if (!isVerified && !location.startsWith("/admin")) {
    return <AgeGate />;
  }

  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        {/* Home */}
        <Route path="/" component={Home} />

        {/* Game routes */}
        <Route path="/games/:slug" component={GameDetail} />
        <Route path="/games/:slug/local" component={LocalSetup} />
        <Route path="/games/:slug/online" component={OnlineSetup} />
        <Route path="/games/:slug/play" component={Gameplay} />
        <Route path="/games/:slug/summary" component={Summary} />

        {/* Online routes */}
        <Route path="/lobby/:roomId" component={Lobby} />
        <Route path="/lobby/:roomId/play" component={Gameplay} />
        <Route path="/lobby/:roomId/summary" component={Summary} />
        <Route path="/join/:joinCode" component={OnlineSetup} />

        {/* Tools & Rules */}
        <Route path="/tools" component={Tools} />
        <Route path="/rules" component={Rules} />

        {/* Admin */}
        <Route path="/admin" component={Admin} />

        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;