
import { describe, expect, it } from "vitest";

import {
  createGame,
  getCurrentActor,
  getLaneModules,
  getLaneScores,
  getLaneWinner,
  getModuleScore,
  getOpponent,
  getRoundResult,
  getRoundWinner,
  passAction,
  placeCreature,
} from "./engine";

import type {
  Creature,
  GameState,
} from "./types";

function makeCreature(
  id: string,
  score: number,
  revealed = true
): Creature {
  return {
    id,
    name: `Creature ${id}`,
    element: "fire",
    baseScore: score,
    revealed,
  };
}

function addCreature(
  state: GameState,
  moduleId: number,
  score: number,
  revealed = true
): void {
  const module = state.modules.find(
    (m) => m.id === moduleId
  );

  if (!module) {
    throw new Error("Module not found.");
  }

  module.creatures.push(
    makeCreature(
      `creature-${moduleId}-${module.creatures.length}`,
      score,
      revealed
    )
  );
}

describe("Fourfold Game Engine", () => {
  it("creates six modules", () => {
    const game = createGame();

    expect(game.modules).toHaveLength(6);
    expect(game.activePlayer).toBe("player1");
    expect(game.turn).toBe(1);
    expect(game.pendingActions).toEqual([]);
  });

  it("allows a player to place a creature", () => {
    const game = createGame();

    const next = placeCreature(
      game,
      "player1",
      0,
      makeCreature("fire-001", 5)
    );

    expect(next.modules[0].creatures).toHaveLength(1);
    expect(next.modules[0].creatures[0].revealed)
      .toBe(false);
    expect(next.phase).toBe("first-response");
    expect(game.modules[0].creatures).toHaveLength(0);
  });

  it("rejects placement in opponent modules", () => {
    const game = createGame();

    expect(() =>
      placeCreature(
        game,
        "player1",
        4,
        makeCreature("fire-002", 5)
      )
    ).toThrow("Cannot place in opponent module.");
  });

  it("calculates revealed creature scores", () => {
    const game = createGame();

    addCreature(game, 0, 5);

    expect(getModuleScore(game.modules[0])).toBe(5);
  });
});

describe("Lane Scoring", () => {
  it("pairs the correct opposing modules", () => {
    const game = createGame();

    expect(getLaneModules(game, 0).player1.id).toBe(0);
    expect(getLaneModules(game, 0).player2.id).toBe(3);
    expect(getLaneModules(game, 1).player1.id).toBe(1);
    expect(getLaneModules(game, 1).player2.id).toBe(4);
    expect(getLaneModules(game, 2).player1.id).toBe(2);
    expect(getLaneModules(game, 2).player2.id).toBe(5);
  });

  it("rejects invalid lane IDs", () => {
    const game = createGame();

    expect(() => getLaneScores(game, -1)).toThrow();
    expect(() => getLaneScores(game, 3)).toThrow();
    expect(() => getLaneScores(game, 0.5)).toThrow();
  });

  it("calculates both players' lane scores", () => {
    const game = createGame();

    addCreature(game, 0, 5);
    addCreature(game, 0, 3);
    addCreature(game, 3, 6);

    expect(getLaneScores(game, 0)).toEqual({
      player1: 8,
      player2: 6,
    });
  });

  it("does not count unrevealed creatures", () => {
    const game = createGame();

    addCreature(game, 0, 5, true);
    addCreature(game, 0, 10, false);

    expect(getLaneScores(game, 0).player1).toBe(5);
  });

  it("awards a lane to the higher score", () => {
    const game = createGame();

    addCreature(game, 0, 8);
    addCreature(game, 3, 5);

    expect(getLaneWinner(game, 0)).toBe("player1");
  });

  it("awards tied lanes to neither player", () => {
    const game = createGame();

    addCreature(game, 0, 7);
    addCreature(game, 3, 7);

    expect(getLaneWinner(game, 0)).toBeNull();
  });

  it("treats an empty lane as a tie", () => {
    expect(getLaneWinner(createGame(), 0)).toBeNull();
  });
});

describe("Round Scoring", () => {
  it("awards the round to the player winning more lanes", () => {
    const game = createGame();

    addCreature(game, 0, 8);
    addCreature(game, 3, 5);
    addCreature(game, 1, 3);
    addCreature(game, 4, 9);
    addCreature(game, 2, 7);
    addCreature(game, 5, 4);

    const result = getRoundResult(game);

    expect(result.lanesWon).toEqual({
      player1: 2,
      player2: 1,
    });
    expect(result.winner).toBe("player1");
    expect(getRoundWinner(game)).toBe("player1");
  });

  it("does not award tied lanes to either player", () => {
    const game = createGame();

    addCreature(game, 0, 5);
    addCreature(game, 3, 5);
    addCreature(game, 1, 8);
    addCreature(game, 4, 3);

    const result = getRoundResult(game);

    expect(result.lanesWon).toEqual({
      player1: 1,
      player2: 0,
    });
    expect(result.winner).toBe("player1");
  });

  it("returns a draw when both players win equal lanes", () => {
    const game = createGame();

    addCreature(game, 0, 8);
    addCreature(game, 3, 3);
    addCreature(game, 1, 2);
    addCreature(game, 4, 9);
    addCreature(game, 2, 5);
    addCreature(game, 5, 5);

    const result = getRoundResult(game);

    expect(result.lanesWon).toEqual({
      player1: 1,
      player2: 1,
    });
    expect(result.winner).toBeNull();
  });

  it("returns a draw for an empty battlefield", () => {
    const result = getRoundResult(createGame());

    expect(result.lanesWon).toEqual({
      player1: 0,
      player2: 0,
    });
    expect(result.winner).toBeNull();
  });
});

describe("Turn State Machine", () => {
  it("identifies the correct acting player", () => {
    let game = createGame();

    expect(getCurrentActor(game)).toBe("player1");

    game = passAction(game, "player1");
    expect(getCurrentActor(game)).toBe("player2");

    game = passAction(game, "player2");
    expect(getCurrentActor(game)).toBe("player1");
  });

  it("rejects actions from the wrong player", () => {
    const game = createGame();

    expect(() =>
      passAction(game, "player2")
    ).toThrow("Not this player's action window.");
  });

  it("advances when a player passes", () => {
    const game = passAction(
      createGame(),
      "player1"
    );

    expect(game.phase).toBe("first-response");
    expect(game.pendingActions).toHaveLength(1);
    expect(game.pendingActions[0].type).toBe("pass");
  });

  it("allows the opponent to place a response creature", () => {
    let game = createGame();

    game = passAction(game, "player1");

    game = placeCreature(
      game,
      "player2",
      3,
      makeCreature("water-001", 4)
    );

    expect(game.phase).toBe("final-response");
    expect(game.modules[3].creatures).toHaveLength(1);
    expect(game.modules[3].creatures[0].revealed)
      .toBe(false);
  });

  it("rejects a second action in a completed window", () => {
    const game = passAction(
      createGame(),
      "player1"
    );

    expect(() =>
      placeCreature(
        game,
        "player1",
        0,
        makeCreature("fire-003", 5)
      )
    ).toThrow("Not this player's action window.");
  });

  it("completes a turn after three passes", () => {
    let game = createGame();

    game = passAction(game, "player1");
    game = passAction(game, "player2");
    game = passAction(game, "player1");

    expect(game.turn).toBe(2);
    expect(game.activePlayer).toBe("player2");
    expect(game.phase).toBe("primary-action");
    expect(game.pendingActions).toEqual([]);
  });

  it("reveals creatures automatically at turn end", () => {
    let game = createGame();

    game = placeCreature(
      game,
      "player1",
      0,
      makeCreature("fire-004", 6)
    );

    expect(game.modules[0].creatures[0].revealed)
      .toBe(false);

    game = passAction(game, "player2");
    game = passAction(game, "player1");

    expect(game.modules[0].creatures[0].revealed)
      .toBe(true);
    expect(getLaneScores(game, 0).player1).toBe(6);
  });

  it("supports three card plays in one turn", () => {
    let game = createGame();

    game = placeCreature(
      game,
      "player1",
      0,
      makeCreature("fire-a", 5)
    );

    game = placeCreature(
      game,
      "player2",
      3,
      makeCreature("water-a", 4)
    );

    game = placeCreature(
      game,
      "player1",
      1,
      makeCreature("earth-a", 3)
    );

    expect(game.turn).toBe(2);
    expect(game.modules[0].creatures[0].revealed)
      .toBe(true);
    expect(game.modules[3].creatures[0].revealed)
      .toBe(true);
    expect(game.modules[1].creatures[0].revealed)
      .toBe(true);
    expect(getLaneWinner(game, 0)).toBe("player1");
  });

  it("alternates the active player every turn", () => {
    let game = createGame();

    for (const player of [
      "player1",
      "player2",
      "player1",
      "player2",
      "player1",
      "player2",
    ] as const) {
      game = passAction(game, player);
    }

    expect(game.turn).toBe(3);
    expect(game.activePlayer).toBe("player1");
  });

  it("does not mutate the previous game state", () => {
    const original = createGame();

    const next = placeCreature(
      original,
      "player1",
      0,
      makeCreature("fire-005", 5)
    );

    expect(original.modules[0].creatures).toHaveLength(0);
    expect(original.pendingActions).toHaveLength(0);
    expect(original.phase).toBe("primary-action");

    expect(next.modules[0].creatures).toHaveLength(1);
    expect(next.pendingActions).toHaveLength(1);
  });

  it("returns the correct opponent", () => {
    expect(getOpponent("player1")).toBe("player2");
    expect(getOpponent("player2")).toBe("player1");
  });
});
