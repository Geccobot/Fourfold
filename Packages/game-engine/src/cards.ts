
import type {
  CardDefinition,
  Creature,
} from "./types";

export const CARD_REGISTRY: Record<
  string,
  CardDefinition
> = {
  "ember-knight": {
    id: "ember-knight",
    name: "Ember Knight",
    element: "fire",
    baseScore: 5,
    effects: [
      {
        trigger: "onReveal",
        timing: "normal",
        actions: [
          { type: "reduce-score", amount: 2 },
        ],
      },
    ],
  },

  "drowned-oracle": {
    id: "drowned-oracle",
    name: "Drowned Oracle",
    element: "water",
    baseScore: 3,
    effects: [
      {
        trigger: "onReveal",
        timing: "priority",
        actions: [
          { type: "reveal-creature" },
        ],
      },
    ],
  },

  "gale-wanderer": {
    id: "gale-wanderer",
    name: "Gale Wanderer",
    element: "wind",
    baseScore: 4,
    effects: [
      {
        trigger: "onReveal",
        timing: "normal",
        actions: [
          { type: "move-creature" },
        ],
      },
    ],
  },

  "stone-warden": {
    id: "stone-warden",
    name: "Stone Warden",
    element: "earth",
    baseScore: 4,
    effects: [
      {
        trigger: "onReveal",
        timing: "priority",
        actions: [
          { type: "protect-module" },
        ],
      },
    ],
  },
};

export function getCardDefinition(
  cardId: string
): CardDefinition {
  const card = CARD_REGISTRY[cardId];

  if (!card) {
    throw new Error(`Unknown card: ${cardId}`);
  }

  return card;
}

export function createCreature(
  cardId: string,
  instanceId: string
): Creature {
  const card = getCardDefinition(cardId);

  return {
    id: instanceId,
    cardId: card.id,
    name: card.name,
    element: card.element,
    baseScore: card.baseScore,
    currentScore: card.baseScore,
    revealed: false,
  };
}
