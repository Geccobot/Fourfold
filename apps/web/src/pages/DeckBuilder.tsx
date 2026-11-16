import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Plus, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/cards/Card";
import { ELEMENT_LABELS } from "../data/cards";
import { fetchCardCatalog } from "../services/api";
import { useGameStore } from "../stores/gameStore";

interface DeckBuilderProps {
  onBack: () => void;
  onStart: () => void;
}

export function DeckBuilder({ onBack, onStart }: DeckBuilderProps) {
  const deckIds = useGameStore((state) => state.deckIds);
  const toggleDeckCard = useGameStore((state) => state.toggleDeckCard);
  const query = useQuery({ queryKey: ["cards"], queryFn: fetchCardCatalog });
  const cards = query.data ?? [];
  const elementCounts = cards.reduce<Record<string, number>>((counts, card) => {
    if (deckIds.includes(card.id)) counts[card.element] = (counts[card.element] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <main className="deck-screen">
      <header className="site-header">
        <Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Return</Button>
        <a className="brand" href="#" aria-label="Fourfold home" onClick={(event) => { event.preventDefault(); onBack(); }}>
          <span className="brand-mark"><span>F</span></span>
          <span className="brand-name">FOURFOLD<small>THE ELEMENTAL CONFLICT</small></span>
        </a>
        <span className="save-label"><span /> SAVED LOCALLY</span>
      </header>

      <div className="deck-layout">
        <section className="deck-main">
          <div className="page-heading">
            <p className="eyebrow"><Sparkles size={14} /> PREPARE FOR THE CONFLICT</p>
            <h1>Deck <em>forge</em></h1>
            <p>Choose your creatures. Each player takes a copy of this deck into the local match.</p>
          </div>
          {query.isLoading && <p className="query-message">Gathering the card catalog…</p>}
          {query.isError && <p className="query-error" role="alert">{query.error.message}</p>}
          {!query.isLoading && !query.isError && (
            <div className="catalog-grid">
              {cards.map((card) => {
                const inDeck = deckIds.includes(card.id);
                return (
                  <div className={`catalog-card${inDeck ? " catalog-card-added" : ""}`} key={card.id}>
                    <Card card={card} />
                    <button className={`add-card ${inDeck ? "added" : ""}`} onClick={() => toggleDeckCard(card.id)} aria-label={`${inDeck ? "Remove" : "Add"} ${card.name} ${inDeck ? "from" : "to"} deck`}>
                      {inDeck ? <Check size={15} /> : <Plus size={15} />}
                      {inDeck ? "In deck" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="deck-sidebar">
          <div className="deck-summary">
            <p className="eyebrow">YOUR DECK</p>
            <div className="deck-count">{deckIds.length}<span> CREATURES</span></div>
            <div className="deck-elements">
              {(["fire", "water", "wind", "earth"] as const).map((element) => (
                <div className={`element-count element-${element}`} key={element}>
                  <span>{ELEMENT_LABELS[element]}</span><strong>{elementCounts[element] ?? 0}</strong>
                </div>
              ))}
            </div>
            <div className="deck-card-list">
              {deckIds.length ? deckIds.map((id, index) => {
                const card = cards.find((item) => item.id === id);
                return card ? (
                  <div className="deck-list-item" key={`${id}-${index}`}>
                    <span className={`player-dot element-${card.element}`} />
                    <span>{card.name}</span><b>{card.baseScore}</b>
                    <button onClick={() => toggleDeckCard(id)} aria-label={`Remove ${card.name} from deck`}>×</button>
                  </div>
                ) : null;
              }) : <p className="deck-empty">Add creatures from the catalog to get started.</p>}
            </div>
            <Button className="launch-button" onClick={onStart} disabled={deckIds.length === 0}>
              Begin local match <span>→</span>
            </Button>
            <button className="reset-deck" onClick={() => {
              deckIds.forEach((id) => toggleDeckCard(id));
            }} disabled={deckIds.length === 0}>
              <RotateCcw size={13} /> Clear deck
            </button>
            <p className="local-note">Deck changes are saved in this browser. Backend deck sync can be connected when the API is ready.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
