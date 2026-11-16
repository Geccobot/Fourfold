
import { describe, expect, it } from "vitest";

import {
  createGame,
  getLaneModules,
  getLaneScores,
  getLaneWinner,
  getModuleScore,
  getRoundResult,
  getRoundWinner,
  placeCreature,
} from "./engine";

import type {
  Creature,
  GameState,
  PlayerId,
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
    (module) => module.id === moduleId
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
    const game = createGame();

    expect(getLaneWinner(game, 0)).toBeNull();
  });
});

describe("Round Scoring", () => {
  it("awards the round to the player winning more lanes", () => {
    const game = createGame();

    // Lane 1: Player 1 wins.
    addCreature(game, 0, 8);
    addCreature(game, 3, 5);

    // Lane 2: Player 2 wins.
    addCreature(game, 1, 3);
    addCreature(game, 4, 9);

    // Lane 3: Player 1 wins.
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
    const game = createGame();

    const result = getRoundResult(game);

    expect(result.lanesWon).toEqual({
      player1: 0,
      player2: 0,
    });

    expect(result.winner).toBeNull();
  });
});
