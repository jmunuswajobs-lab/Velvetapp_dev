
import { useParams } from "wouter";
import Gameplay from "./Gameplay";
import LudoGameplay from "./LudoGameplay";
import { useQuery } from "@tanstack/react-query";
import type { Game } from "@shared/schema";

export default function GameRouter() {
  const { slug } = useParams<{ slug?: string }>();

  const { data: game } = useQuery<Game>({
    queryKey: [`/api/games/${slug}`],
    enabled: !!slug,
  });

  // Route to appropriate game component based on slug
  if (slug === "velvet-ludo") {
    return <LudoGameplay />;
  }

  // Default to standard gameplay for all other games
  return <Gameplay />;
}
