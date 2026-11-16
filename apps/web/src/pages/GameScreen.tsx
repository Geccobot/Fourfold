import { getCurrentActor } from "@fourfold/game-engine";
import { ArrowLeft, RotateCcw, Swords } from "lucide-react";
import { Battlefield } from "../components/battlefield/Battlefield";
import { PlayerHand } from "../components/hand/PlayerHand";
import { TurnIndicator } from "../components/game/TurnIndicator";
import { Button } from "../components/ui/button";
import { useGameStore } from "../stores/gameStore";

interface GameScreenProps {
  onBack: () => void;
  onDecks: () => void;
}

export function GameScreen({ onBack, onDecks }: GameScreenProps) {
  const game = useGameStore((state) => state.game);
  const hands = useGameStore((state) => state.hands);
  const selectedCardId = useGameStore((state) => state.selectedCardId);
  const message = useGameStore((state) => state.message);
  const selectCard = useGameStore((state) => state.selectCard);
  const playSelectedCard = useGameStore((state) => state.playSelectedCard);
  const pass = useGameStore((state) => state.pass);
  const startGame = useGameStore((state) => state.startGame);

  if (!game) return null;
  const actor = getCurrentActor(game);

  return (
    <main className="game-screen">
      <header className="site-header game-header">
        <Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Exit match</Button>
        <a className="brand" href="#" aria-label="Fourfold home" onClick={(event) => { event.preventDefault(); onBack(); }}>
          <span className="brand-mark"><span>F</span></span>
          <span className="brand-name">FOURFOLD<small>THE ELEMENTAL CONFLICT</small></span>
        </a>
        <div className="header-actions">
          <Button variant="ghost" onClick={onDecks}>Deck forge</Button>
          <Button variant="secondary" onClick={startGame}><RotateCcw size={15} /> New match</Button>
        </div>
      </header>

      <div className="match-title">
        <p className="eyebrow"><Swords size={14} /> LOCAL MATCH</p>
        <h1>Claim the <em>lanes</em></h1>
      </div>

      <PlayerHand
        player="player2"
        hand={hands.player2}
        active={actor === "player2"}
        selectedCardId={selectedCardId}
        onSelect={selectCard}
      />

      <TurnIndicator
        game={game}
        onPass={pass}
      />

      <Battlefield
        game={game}
        actor={actor}
        selectedCardId={selectedCardId}
        onPlace={playSelectedCard}
      />

      <PlayerHand
        player="player1"
        hand={hands.player1}
        active={actor === "player1"}
        selectedCardId={selectedCardId}
        onSelect={selectCard}
      />

      <div className={`game-message${message ? " has-message" : ""}`} aria-live="polite">
        {message ?? <><span className="message-dot" /> Select a creature, then choose one of your modules to commit it face down.</>}
      </div>
    </main>
  );
}
