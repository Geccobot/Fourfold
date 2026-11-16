

import type {
  Creature,
  GameState,
  LaneResult,
  LaneScores,
  Module,
  PlayerId,
  RoundResult,
} from "./types.ts";

export const LANE_COUNT = 3;

export function createGame(): GameState {
  const modules: Module[] = Array.from(
    { length: LANE_COUNT * 2 },
    (_, index) => ({
      id: index,
      owner: index < LANE_COUNT ? "player1" : "player2",
      creatures: [],
    })
  );

  return {
    modules,
    activePlayer: "player1",
    phase: "primary-action",
    round: 1,
  };
}

export function placeCreature(
  state: GameState,
  player: PlayerId,
  moduleId: number,
  creature: Creature
): GameState {
  if (state.activePlayer !== player) {
    throw new Error("Not this player's turn.");
  }

  if (state.phase !== "primary-action") {
    throw new Error("Cannot place a creature now.");
  }

  const module = state.modules.find(
    (m) => m.id === moduleId
  );

  if (!module) {
    throw new Error("Module does not exist.");
  }

  if (module.owner !== player) {
    throw new Error("Cannot place in opponent module.");
  }

  if (
    state.modules.some((m) =>
      m.creatures.some((c) => c.id === creature.id)
    )
  ) {
    throw new Error("Creature is already in play.");
  }

  return {
    ...state,
    modules: state.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            creatures: [
              ...m.creatures,
              { ...creature, revealed: false },
            ],
          }
        : m
    ),
    phase: "first-response",
  };
}

export function getModuleScore(module: Module): number {
  return module.creatures.reduce(
    (total, creature) =>
      total + (creature.revealed ? creature.baseScore : 0),
    0
  );
}

export function getLaneModules(
  state: GameState,
  laneId: number
): { player1: Module; player2: Module } {
  if (
    !Number.isInteger(laneId) ||
    laneId < 0 ||
    laneId >= LANE_COUNT
  ) {
    throw new Error("Invalid lane ID.");
  }

  const player1 = state.modules.find(
    (module) =>
      module.id === laneId &&
      module.owner === "player1"
  );

  const player2 = state.modules.find(
    (module) =>
      module.id === laneId + LANE_COUNT &&
      module.owner === "player2"
  );

  if (!player1 || !player2) {
    throw new Error("Lane modules are missing.");
  }

  return { player1, player2 };
}

export function getLaneScores(
  state: GameState,
  laneId: number
): LaneScores {
  const { player1, player2 } = getLaneModules(
    state,
    laneId
  );

  return {
    player1: getModuleScore(player1),
    player2: getModuleScore(player2),
  };
}

export function getLaneWinner(
  state: GameState,
  laneId: number
): PlayerId | null {
  const scores = getLaneScores(state, laneId);

  if (scores.player1 > scores.player2) {
    return "player1";
  }

  if (scores.player2 > scores.player1) {
    return "player2";
  }

  return null;
}

export function getRoundResult(
  state: GameState
): RoundResult {
  const lanes: LaneResult[] = Array.from(
    { length: LANE_COUNT },
    (_, laneId) => ({
      laneId,
      scores: getLaneScores(state, laneId),
      winner: getLaneWinner(state, laneId),
    })
  );

  const lanesWon = {
    player1: lanes.filter(
      (lane) => lane.winner === "player1"
    ).length,
    player2: lanes.filter(
      (lane) => lane.winner === "player2"
    ).length,
  };

  let winner: PlayerId | null = null;

  if (lanesWon.player1 > lanesWon.player2) {
    winner = "player1";
  } else if (lanesWon.player2 > lanesWon.player1) {
    winner = "player2";
  }

  return {
    lanes,
    lanesWon,
    winner,
  };
}

export function getRoundWinner(
  state: GameState
): PlayerId | null {
  return getRoundResult(state).winner;
}
