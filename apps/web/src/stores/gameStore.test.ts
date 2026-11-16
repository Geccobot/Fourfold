import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_DECK } from "../data/cards";
import { useGameStore } from "./gameStore";

describe("local match store", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({
      screen: "home",
      game: null,
      hands: { player1: [], player2: [] },
      deckIds: DEFAULT_DECK,
      selectedCardId: null,
      message: null,
    });
    useGameStore.getState().startGame();
  });

  it("plays a selected card through the game engine and keeps it hidden", () => {
    const store = useGameStore.getState();
    const creature = store.hands.player1[0];
    store.selectCard(creature.id);
    store.playSelectedCard(0);

    const next = useGameStore.getState();
    expect(next.game?.phase).toBe("first-response");
    expect(next.game?.modules[0].creatures[0]).toMatchObject({
      name: creature.name,
      revealed: false,
    });
    expect(next.hands.player1).toHaveLength(store.hands.player1.length - 1);
  });

  it("persists deck edits without persisting an in-progress match", () => {
    const { deckIds } = useGameStore.getState();
    useGameStore.getState().toggleDeckCard(deckIds[0]);

    expect(useGameStore.getState().deckIds).toHaveLength(deckIds.length - 1);
    expect(localStorage.getItem("fourfold-deck")).toContain("deckIds");
    expect(localStorage.getItem("fourfold-deck")).not.toContain("activePlayer");
  });
});
