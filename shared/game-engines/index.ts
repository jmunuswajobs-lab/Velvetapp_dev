// Export all game engines
export { ludoEngine } from "./ludoEngine";
export { memoryEngine } from "./memoryEngine";
export { beerPongEngine } from "./beerPongEngine";
export type { GameEngineState, GameAction, GameEngineConfig, GameEngineInterface } from "./types";

export function getEngineForType(engineType: string) {
  switch (engineType) {
    case "board-ludo":
      return require("./ludoEngine").ludoEngine;
    case "memory-match":
      return require("./memoryEngine").memoryEngine;
    case "pong":
      return require("./beerPongEngine").beerPongEngine;
    default:
      return null;
  }
}
