
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  CARD_REGISTRY,
  createCreature,
} from "./cards";

import {
  collectEffects,
} from "./effects";

import {
  createGame,
  getLaneScores,
  passAction,
  placeCreature,
} from "./engine";

describe("Fourfold Card Definitions", () => {
  it("creates unique instances of the same card", () => {
    const first = createCreature(
      "ember-knight",
      "ember-1"
    );

    const second = createCreature(
      "ember-knight",
      "ember-2"
    );

    expect(first.cardId).toBe(second.cardId);
    expect(first.id).not.toBe(second.id);
    expect(first.baseScore).toBe(5);
    expect(first.currentScore).toBe(5);
  });

  it("rejects unknown card definitions", () => {
    expect(() =>
      createCreature("missing-card", "instance-1")
    ).toThrow("Unknown card");
  });
});

describe("Fourfold Effect Resolution", () => {
  it("reduces an opposing creature's score", () => {
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
      createCreature("drowned-oracle", "water-1"),
      { targetCreatureId: "fire-1" }
    );

    game = passAction(game, "player1");

    expect(
      game.modules[3].creatures[0].currentScore
    ).toBe(1);

    expect(getLaneScores(game, 0)).toEqual({
      player1: 5,
      player2: 1,
    });
  });

  it("resolves priority protection before normal damage", () => {
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

    const queue = collectEffects(game);

    expect(queue.map((effect) => effect.timing))
      .toEqual(["priority", "normal"]);

    game = passAction(game, "player1");

    expect(
      game.modules[3].protectedFromReduction
    ).toBe(true);

    expect(
      game.modules[3].creatures[0].currentScore
    ).toBe(4);
  });

  it("moves a friendly creature between modules", () => {
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

    expect(
      game.modules[0].creatures
    ).toHaveLength(0);

    expect(
      game.modules[2].creatures.map(
        (creature) => creature.id
      )
    ).toContain("fire-1");
  });

  it("does not allow Wind to move enemy creatures", () => {
    let game = createGame();

    game = placeCreature(
      game,
      "player1",
      1,
      createCreature("gale-wanderer", "wind-1"),
      {
        targetCreatureId: "earth-1",
        destinationModuleId: 2,
      }
    );

    game = placeCreature(
      game,
      "player2",
      3,
      createCreature("stone-warden", "earth-1")
    );

    game = passAction(game, "player1");

    expect(
      game.modules[3].creatures[0].id
    ).toBe("earth-1");

    expect(
      game.modules[2].creatures
    ).toHaveLength(0);
  });


    it("keeps effects in play order at equal timing", () => {
    let game = createGame();

    // Player 1 plays Ember Knight (normal timing).
    game = placeCreature(
        game,
        "player1",
        0,
        createCreature("ember-knight", "fire-1")
    );

    // Player 2 plays Gale Wanderer (normal timing).
    game = placeCreature(
        game,
        "player2",
        4,
        createCreature("gale-wanderer", "wind-1")
    );

    // We're now in final-response.
    // Effects haven't resolved yet.
    expect(game.phase).toBe("final-response");

    const queue = collectEffects(game);

    expect(
        queue.map((effect) => effect.sourceCreatureId)
    ).toEqual(["fire-1", "wind-1"]);
    });


  it("places delayed effects after normal effects", () => {
    const original =
      CARD_REGISTRY["gale-wanderer"];

    const delayedEffect = {
      ...original.effects[0],
      timing: "delayed" as const,
    };

    // Temporarily replace the definition for this test.
    CARD_REGISTRY["gale-wanderer"] = {
      ...original,
      effects: [delayedEffect],
    };

    try {
      let game = createGame();

      game = placeCreature(
        game,
        "player1",
        0,
        createCreature("gale-wanderer", "wind-1")
      );

      game = placeCreature(
        game,
        "player2",
        3,
        createCreature("ember-knight", "fire-1")
      );

      const queue = collectEffects(game);

      expect(
        queue.map(
          (effect) => effect.sourceCreatureId
        )
      ).toEqual(["fire-1", "wind-1"]);
    } finally {
      CARD_REGISTRY["gale-wanderer"] = original;
    }
  });

  it("does not mutate previous game states", () => {
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

    const beforeResolution = game;
    const afterResolution = passAction(
      game,
      "player1"
    );

    expect(
      beforeResolution.modules[3]
        .protectedFromReduction
    ).toBe(false);

    expect(
      beforeResolution.modules[3]
        .creatures[0].revealed
    ).toBe(false);

    expect(
      afterResolution.modules[3]
        .protectedFromReduction
    ).toBe(true);

    expect(
      afterResolution.modules[3]
        .creatures[0].revealed
    ).toBe(true);
  });
});
