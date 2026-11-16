import { motion } from "framer-motion";
import { getLaneScores, getLaneWinner, getModuleScore } from "@fourfold/game-engine";
import type { GameState, PlayerId } from "@fourfold/game-engine/types";
import { HiddenCard } from "../cards/Card";

const laneNames = ["The Cinder March", "Moonwater Basin", "Skyroot Pass"];

interface BattlefieldProps {
  game: GameState;
  actor: PlayerId | null;
  selectedCardId: string | null;
  onPlace: (moduleId: number) => void;
}

export function Battlefield({ game, actor, selectedCardId, onPlace }: BattlefieldProps) {
  return (
    <div className="battlefield" aria-label="Six-module battlefield">
      <div className="battlefield-labels">
        <span className="side-label player-two-label">PLAYER TWO <i /></span>
        <span className="lane-label">THREE CONTESTED LANES</span>
        <span className="side-label player-one-label"><i /> PLAYER ONE</span>
      </div>
      <div className="lane-list">
        {laneNames.map((name, laneId) => {
          const upper = game.modules.find((module) => module.id === laneId + 3);
          const lower = game.modules.find((module) => module.id === laneId);
          if (!upper || !lower) return null;

          const scores = getLaneScores(game, laneId);
          const winner = getLaneWinner(game, laneId);
          const modules = [upper, lower];

          return (
            <section className={`lane-row${winner ? ` lane-won-${winner}` : ""}`} key={laneId}>
              <button
                type="button"
                className={`module-zone opponent-zone${actor === "player2" && selectedCardId ? " can-place" : ""}`}
                onClick={() => onPlace(upper.id)}
                disabled={!actor || actor !== upper.owner || !selectedCardId}
                aria-label={`Place selected creature in Player Two's ${name} module`}
              >
                <ModuleCards creatures={upper.creatures} />
                <span className="zone-total">{getModuleScore(upper)}</span>
              </button>
              <div className="lane-center">
                <span className="lane-name">{name}</span>
                <div className="lane-score" aria-label={`${name} score`}>
                  <strong className={winner === "player2" ? "winning-score" : ""}>{scores.player2}</strong>
                  <span>{winner ? "LEADS" : "VS"}</span>
                  <strong className={winner === "player1" ? "winning-score" : ""}>{scores.player1}</strong>
                </div>
                <span className="lane-marker">0{laneId + 1}</span>
              </div>
              <button
                type="button"
                className={`module-zone home-zone${actor === "player1" && selectedCardId ? " can-place" : ""}`}
                onClick={() => onPlace(lower.id)}
                disabled={!actor || actor !== lower.owner || !selectedCardId}
                aria-label={`Place selected creature in Player One's ${name} module`}
              >
                <ModuleCards creatures={lower.creatures} />
                <span className="zone-total">{getModuleScore(lower)}</span>
              </button>
              <div className="lane-rune" aria-hidden="true">{["ᚠ", "ᛟ", "ᚱ"][laneId]}</div>
              <span className="visually-hidden">
                {modules[0].creatures.length + modules[1].creatures.length} creatures in this lane
              </span>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ModuleCards({ creatures }: { creatures: GameState["modules"][number]["creatures"] }) {
  return (
    <span className="module-creatures">
      {creatures.map((creature) => (
        <motion.span key={creature.id} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}>
          {creature.revealed ? (
            <span className={`revealed-chip element-${creature.element}`} title={`${creature.name} · ${creature.baseScore}`}>
              <span>{creature.name}</span><b>{creature.baseScore}</b>
            </span>
          ) : <HiddenCard />}
        </motion.span>
      ))}
    </span>
  );
}
