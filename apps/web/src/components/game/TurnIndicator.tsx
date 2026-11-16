import { ArrowDown, ArrowLeftRight, Check, Hand } from "lucide-react";
import type { GameState, PlayerId } from "@fourfold/game-engine/types";
import { getCurrentActor } from "@fourfold/game-engine";

const phaseNames: Record<GameState["phase"], string> = {
  "primary-action": "Opening move",
  "first-response": "First response",
  "final-response": "Final response",
  reveal: "Reveal",
  resolution: "Resolution",
  "turn-end": "Turn end",
};

interface TurnIndicatorProps {
  game: GameState;
  onPass: () => void;
}

export function TurnIndicator({ game, onPass }: TurnIndicatorProps) {
  const actor = getCurrentActor(game);
  const activePlayerName = game.activePlayer === "player1" ? "Player One" : "Player Two";
  const actorName = actor === "player1" ? "Player One" : "Player Two";

  return (
    <section className="turn-strip" aria-label="Turn controls">
      <div className="turn-state">
        <span className={`turn-avatar ${actor ?? game.activePlayer}`}>
          <Hand size={17} />
        </span>
        <div>
          <p className="eyebrow">{phaseNames[game.phase]} · Turn {game.turn}</p>
          <strong>{actor ? `${actorName}, your move` : "Resolving the turn"}</strong>
        </div>
      </div>
      <div className="turn-context">
        <ArrowLeftRight size={15} />
        <span>{activePlayerName} opened this turn</span>
      </div>
      <button className="button button-quiet pass-button" onClick={onPass} disabled={!actor}>
        <Check size={16} />
        Pass
        <ArrowDown size={14} />
      </button>
    </section>
  );
}

export function getPlayerLabel(player: PlayerId) {
  return player === "player1" ? "Player One" : "Player Two";
}
