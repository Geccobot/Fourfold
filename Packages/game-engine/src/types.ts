
export type PlayerId = "player1" | "player2";

export type Element = "fire" | "water" | "wind" | "earth";

export type Phase =
  | "primary-action"
  | "first-response"
  | "final-response"
  | "reveal"
  | "resolution"
  | "turn-end";

export interface Creature {
  id: string;
  name: string;
  element: Element;
  baseScore: number;
  revealed: boolean;
}

export interface Module {
  id: number;
  owner: PlayerId;
  creatures: Creature[];
}

export interface GameState {
  modules: Module[];
  activePlayer: PlayerId;
  phase: Phase;
  round: number;
}

export interface LaneScores {
  player1: number;
  player2: number;
}

export interface LaneResult {
  laneId: number;
  scores: LaneScores;
  winner: PlayerId | null;
}

export interface RoundResult {
  lanes: LaneResult[];
  lanesWon: {
    player1: number;
    player2: number;
  };
  winner: PlayerId | null;
}
