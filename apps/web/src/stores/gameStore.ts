import {
  createGame,
  getCurrentActor,
  passAction,
  placeCreature,
} from "@fourfold/game-engine";
import type { Creature, GameState, PlayerId } from "@fourfold/game-engine/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CARD_BY_ID, DEFAULT_DECK } from "../data/cards";

type Screen = "home" | "game" | "decks";
type PlayerHands = Record<PlayerId, Creature[]>;

interface GameStore {
  screen: Screen;
  game: GameState | null;
  hands: PlayerHands;
  deckIds: string[];
  selectedCardId: string | null;
  message: string | null;
  startGame: () => void;
  openScreen: (screen: Screen) => void;
  toggleDeckCard: (cardId: string) => void;
  selectCard: (cardId: string | null) => void;
  playSelectedCard: (moduleId: number) => void;
  pass: () => void;
  clearMessage: () => void;
}

function makeHands(deckIds: string[]): PlayerHands {
  const createHand = (playerId: PlayerId): Creature[] =>
    deckIds.flatMap((cardId, index) => {
      const card = CARD_BY_ID.get(cardId);
      return card
        ? [{
            id: `${playerId}-${index}-${card.id}`,
            name: card.name,
            element: card.element,
            baseScore: card.baseScore,
            revealed: false,
          }]
        : [];
    });

  return {
    player1: createHand("player1"),
    player2: createHand("player2"),
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      screen: "home",
      game: null,
      hands: { player1: [], player2: [] },
      deckIds: DEFAULT_DECK,
      selectedCardId: null,
      message: null,
      startGame: () => {
        const deckIds = get().deckIds;
        if (deckIds.length === 0) {
          set({ message: "Add at least one creature to your deck before starting." });
          return;
        }
        set({
          game: createGame(),
          hands: makeHands(deckIds),
          selectedCardId: null,
          message: null,
          screen: "game",
        });
      },
      openScreen: (screen) => set({ screen, selectedCardId: null, message: null }),
      toggleDeckCard: (cardId) => {
        const current = get().deckIds;
        set({
          deckIds: current.includes(cardId)
            ? current.filter((id) => id !== cardId)
            : [...current, cardId],
        });
      },
      selectCard: (selectedCardId) => set({ selectedCardId, message: null }),
      playSelectedCard: (moduleId) => {
        const { game, hands, selectedCardId } = get();
        if (!game || !selectedCardId) return;

        const actor = getCurrentActor(game);
        if (!actor) return;
        const creature = hands[actor].find((card) => card.id === selectedCardId);
        if (!creature) {
          set({ selectedCardId: null, message: "That card is no longer in your hand." });
          return;
        }

        try {
          const nextGame = placeCreature(game, actor, moduleId, creature);
          set({
            game: nextGame,
            hands: {
              ...hands,
              [actor]: hands[actor].filter((card) => card.id !== creature.id),
            },
            selectedCardId: null,
            message: `${creature.name} was committed face down.`,
          });
        } catch (error) {
          set({
            message: error instanceof Error ? error.message : "The creature could not be played.",
          });
        }
      },
      pass: () => {
        const game = get().game;
        if (!game) return;
        const actor = getCurrentActor(game);
        if (!actor) return;

        try {
          const nextGame = passAction(game, actor);
          set({ game: nextGame, selectedCardId: null, message: `${actor === "player1" ? "Player one" : "Player two"} passed.` });
        } catch (error) {
          set({
            message: error instanceof Error ? error.message : "The pass could not be completed.",
          });
        }
      },
      clearMessage: () => set({ message: null }),
    }),
    {
      name: "fourfold-deck",
      partialize: (state) => ({ deckIds: state.deckIds }),
    },
  ),
);
