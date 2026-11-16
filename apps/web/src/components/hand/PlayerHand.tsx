import { CARD_BY_ID } from "../../data/cards";
import type { Creature, PlayerId } from "@fourfold/game-engine/types";
import type { CSSProperties } from "react";
import { getPlayerLabel } from "../game/TurnIndicator";
import { Card } from "../cards/Card";

interface PlayerHandProps {
  player: PlayerId;
  hand: Creature[];
  active: boolean;
  selectedCardId: string | null;
  onSelect: (id: string) => void;
}

export function PlayerHand({ player, hand, active, selectedCardId, onSelect }: PlayerHandProps) {
  return (
    <section className={`hand-panel ${player}${active ? " hand-active" : " hand-waiting"}`}>
      <div className="hand-heading">
        <div className="hand-player">
          <span className={`player-dot ${player}`} />
          <strong>{getPlayerLabel(player)}</strong>
          <span className="hand-count">{active ? hand.length : `${hand.length} hidden`}</span>
        </div>
        <span className="hand-hint">{active ? "Choose a creature to commit" : "Waiting for their turn"}</span>
      </div>
      {active ? (
        hand.length > 0 ? (
          <div className="hand-cards">
            {hand.map((creature) => {
              const definition = Array.from(CARD_BY_ID.values()).find((card) => card.name === creature.name);
              const card = definition ?? {
                id: creature.id,
                name: creature.name,
                element: creature.element,
                baseScore: creature.baseScore,
                description: "A creature ready to answer the call.",
              };
              return (
                <Card
                  key={creature.id}
                  card={card}
                  compact
                  selected={selectedCardId === creature.id}
                  onClick={() => onSelect(creature.id)}
                />
              );
            })}
          </div>
        ) : (
          <p className="empty-hand">Your hand is empty. Pass to resolve this response window.</p>
        )
      ) : (
        <div className="concealed-hand" aria-label={`${hand.length} cards concealed`}>
          {hand.slice(0, 5).map((card, index) => <span className="hand-back" key={card.id} style={{ "--card-index": index } as CSSProperties}>✦</span>)}
          <span className="concealed-copy">Cards concealed</span>
        </div>
      )}
    </section>
  );
}
