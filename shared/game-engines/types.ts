// Unified game engine types for all arcade/board games

export interface GameEngineState {
  type: string;
  data: any;
}

export interface GameAction {
  type: string;
  payload?: any;
  playerID?: string;
}

export interface GameEngineConfig {
  players: number;
  difficulty?: number;
  [key: string]: any;
}

export interface GameEngineInterface {
  createInitialState(config: GameEngineConfig): GameEngineState;
  applyAction(state: GameEngineState, action: GameAction): GameEngineState;
  isGameOver(state: GameEngineState): { isOver: boolean; winner?: number };
  getValidMoves(state: GameEngineState, playerID: string): GameAction[];
  getGameStatus(state: GameEngineState): any;
}
