
export type PlayerId = "player1" | "player2";

export type Element = "fire" | "water" | "wind" | "earth";

export type Phase =
  | "primary-action"
  | "first-response"
  | "final-response"
  | "reveal"
  | "resolution"
  | "turn-end";

export type ActionPhase =
  | "primary-action"
  | "first-response"
  | "final-response";

export type EffectTiming = "priority" | "normal" | "delayed";

export type EffectAction =
  | { type: "reduce-score"; amount: number }
  | { type: "reveal-creature" }
  | { type: "move-creature" }
  | { type: "protect-module" };

export interface CardEffect {
  trigger: "onReveal";
  timing?: EffectTiming;
  actions: EffectAction[];
}

export interface CardDefinition {
  id: string;
  name: string;
  element: Element;
  baseScore: number;
  effects: CardEffect[];
}

export interface Creature {
  id: string;
  cardId?: string;
  name: string;
  element: Element;
  baseScore: number;
  currentScore?: number;
  revealed: boolean;
}

export interface Module {
  id: number;
  owner: PlayerId;
  creatures: Creature[];
  protectedFromReduction?: boolean;
}

export interface EffectTargets {
  targetCreatureId?: string;
  destinationModuleId?: number;
}

export interface PendingAction {
  player: PlayerId;
  phase: ActionPhase;
  type: "place-creature" | "pass";
  cardId?: string;
  moduleId?: number;
  targets?: EffectTargets;
}

export type ResolutionEventType =
  | "creature-revealed"
  | "score-reduced"
  | "score-reduction-blocked"
  | "creature-moved"
  | "module-protected"
  | "effect-fizzled";

export interface ResolutionEvent {
  type: ResolutionEventType;
  turn: number;
  message: string;
  sourceCreatureId?: string;
  targetCreatureId?: string;
  moduleId?: number;
  fromModuleId?: number;
  toModuleId?: number;
  previousScore?: number;
  newScore?: number;
  timing?: EffectTiming;
}

export interface GameState {
  modules: Module[];
  activePlayer: PlayerId;
  phase: Phase;
  round: number;
  turn: number;
  pendingActions: PendingAction[];
  lastTurnEvents: ResolutionEvent[];
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

export interface QueuedEffect {
  sourceCreatureId: string;
  player: PlayerId;
  playOrder: number;
  effectIndex: number;
  timing: EffectTiming;
  effect: CardEffect;
  targets: EffectTargets;
}
