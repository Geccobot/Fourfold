import { motion } from "framer-motion";
import { ELEMENT_LABELS, type CardDefinition } from "../../data/cards";

interface CardProps {
  card: CardDefinition;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const elementGlyph = {
  fire: "✦",
  water: "◒",
  wind: "⌁",
  earth: "⬡",
} as const;

export function Card({ card, selected = false, onClick, compact = false }: CardProps) {
  return (
    <motion.button
      type="button"
      layout
      whileHover={onClick ? { y: -7, scale: 1.025 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`creature-card element-${card.element}${selected ? " is-selected" : ""}${compact ? " is-compact" : ""}`}
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
      disabled={!onClick}
    >
      <span className="card-art" aria-hidden="true">
        <span className="card-art-glyph">{elementGlyph[card.element]}</span>
        <span className="card-score">{card.baseScore}</span>
      </span>
      <span className="card-copy">
        <span className="card-name">{card.name}</span>
        <span className="card-element">{ELEMENT_LABELS[card.element]} creature</span>
        {!compact && <span className="card-description">{card.description}</span>}
      </span>
    </motion.button>
  );
}

export function HiddenCard() {
  return (
    <div className="hidden-card" aria-label="Unrevealed creature">
      <span aria-hidden="true">✦</span>
      <small>UNREVEALED</small>
    </div>
  );
}
