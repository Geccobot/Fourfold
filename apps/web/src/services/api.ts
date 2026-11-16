import { CARD_CATALOG, type CardDefinition } from "../data/cards";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export async function fetchCardCatalog(): Promise<CardDefinition[]> {
  if (!apiBaseUrl) {
    return CARD_CATALOG;
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/cards`);
  if (!response.ok) {
    throw new Error(`Could not load cards (${response.status}).`);
  }

  return response.json() as Promise<CardDefinition[]>;
}
