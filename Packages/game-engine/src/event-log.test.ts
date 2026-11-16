
import { describe, expect, it } from "vitest";

import { createCreature } from "./cards";

import {
  createGame,
  passAction,
  placeCreature,
} from "./engine";

describe("Fourfold Resolution Event Log", () => {
  it("starts with an empty event log", () => {
    const game = createGame();

    expect(game.lastTurnEvents).toEqual([]);
  });

  it("records creature reveals", () => {
    let game = createGame();

    game = placeCreature(
      game,
      "player1",
      0,
      createCreature("ember-knight", "fire-1")
    );

    game = passAction(game, "player2");
    game = passAction(game, "player1");

    expect(
      game.lastTurnEvents.some(
        (event) =>
          event.type === "creature-revealed" &&
          event.sourceCreatureId === "fire-1"
      )
    ).toBe(true);
  });

  it("records score changes with old and new values", () => {
    let game = createGame();

    game = placeCreature(
      game,
      "player1",
      0,
      createCreature("ember-knight", "fire-1"),
      { targetCreatureId: "water-1" }
    );

    game = placeCreature(
      game,
      "player2",
      3,
      createCreature("drowned-oracle", "water-1")
    );

    game = passAction(game, "player1");

    const event = game.lastTurnEvents.find(
      (item) => item.type === "score-reduced"
    );

    expect(event).toMatchObject({
      turn: 1,
      sourceCreatureId: "fire-1",
      targetCreatureId: "water-1",
      previousScore: 3,
      newScore: 1,
      timing: "normal",
    });
  });

  it("records protection before blocked damage", () => {
    let game = createGame();

    game = placeCreature(
      game,
      "player1",
      0,
      createCreature("ember-knight", "fire-1"),
      { targetCreatureId: "earth-1" }
    );

    game = placeCreature(
      game,
      "player2",
      3,
      createCreature("stone-warden", "earth-1")
    );

    game = passAction(game, "player1");

    const types = game.lastTurnEvents.map(
      (event) => event.type
    );

    const protectionIndex =
      types.indexOf("module-protected");

    const blockedIndex =
      types.indexOf("score-reduction-blocked");

    expect(protectionIndex).toBeGreaterThanOrEqual(0);
    expect(blockedIndex).toBeGreaterThan(protectionIndex);
  });

  it("records creature movement", () => {
    let game = createGame();

    game = placeCreature(
      game,
      "player1",
      0,
      createCreature("ember-knight", "fire-1")
    );

    game = passAction(game, "player2");

    game = placeCreature(
      game,
      "player1",
      1,
      createCreature("gale-wanderer", "wind-1"),
      {
        targetCreatureId: "fire-1",
        destinationModuleId: 2,
      }
    );

    const event = game.lastTurnEvents.find(
      (item) => item.type === "creature-moved"
    );

    expect(event).toMatchObject({
      sourceCreatureId: "wind-1",
      targetCreatureId: "fire-1",
      fromModuleId: 0,
      toModuleId: 2,
    });
  });

  it("replaces the previous turn log after the next turn", () => {
    let game = createGame();

    game = placeCreature(
      game,
      "player1",
      0,
      createCreature("ember-knight", "fire-1")
    );

    game = passAction(game, "player2");
    game = passAction(game, "player1");

    expect(game.lastTurnEvents.length).toBeGreaterThan(0);

    game = passAction(game, "player2");
    game = passAction(game, "player1");
    game = passAction(game, "player2");

    expect(game.turn).toBe(3);
    expect(game.lastTurnEvents).toEqual([]);
  });
});
