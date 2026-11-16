import type { Element } from "@fourfold/game-engine/types";

export interface CardDefinition {
  id: string;
  name: string;
  element: Element;
  baseScore: number;
  description: string;
}

export const CARD_CATALOG: CardDefinition[] = [
  { id: "ember-fox", name: "Ember Fox", element: "fire", baseScore: 4, description: "A quick flame that never burns alone." },
  { id: "ash-knight", name: "Ashen Knight", element: "fire", baseScore: 6, description: "Forged in the last light of a dying star." },
  { id: "sun-stag", name: "Sun Stag", element: "fire", baseScore: 7, description: "Its crown heralds the break of dawn." },
  { id: "tide-seer", name: "Tide Seer", element: "water", baseScore: 3, description: "The current remembers every path." },
  { id: "mist-heron", name: "Mist Heron", element: "water", baseScore: 5, description: "A silent watcher between the worlds." },
  { id: "deep-warden", name: "Deep Warden", element: "water", baseScore: 8, description: "An ancient force stirs beneath the waves." },
  { id: "gale-hawk", name: "Gale Hawk", element: "wind", baseScore: 4, description: "Faster than the storm that follows." },
  { id: "cloud-dancer", name: "Cloud Dancer", element: "wind", baseScore: 6, description: "A fleeting shape across the open sky." },
  { id: "sky-titan", name: "Sky Titan", element: "wind", baseScore: 8, description: "The heavens bend to its passing." },
  { id: "mossling", name: "Mossling", element: "earth", baseScore: 3, description: "Small roots can split the oldest stone." },
  { id: "granite-bear", name: "Granite Bear", element: "earth", baseScore: 5, description: "Patient, steady, impossible to move." },
  { id: "worldroot", name: "Worldroot Colossus", element: "earth", baseScore: 9, description: "The mountain itself has awakened." },
];

export const CARD_BY_ID = new Map(
  CARD_CATALOG.map((card) => [card.id, card]),
);

export const DEFAULT_DECK = [
  "ember-fox",
  "ash-knight",
  "sun-stag",
  "tide-seer",
  "mist-heron",
  "deep-warden",
  "gale-hawk",
  "cloud-dancer",
  "sky-titan",
  "mossling",
  "granite-bear",
  "worldroot",
];

export const ELEMENT_LABELS: Record<Element, string> = {
  fire: "Fire",
  water: "Water",
  wind: "Wind",
  earth: "Earth",
};
