import { AnimatePresence, motion } from "framer-motion";
import { DeckBuilder } from "./pages/DeckBuilder";
import { GameScreen } from "./pages/GameScreen";
import { MainMenu } from "./pages/MainMenu";
import { useGameStore } from "./stores/gameStore";

export default function App() {
  const screen = useGameStore((state) => state.screen);
  const openScreen = useGameStore((state) => state.openScreen);
  const startGame = useGameStore((state) => state.startGame);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
        {screen === "home" && <MainMenu onStart={startGame} onDecks={() => openScreen("decks")} />}
        {screen === "decks" && (
          <DeckBuilder
            onBack={() => openScreen(useGameStore.getState().game ? "game" : "home")}
            onStart={startGame}
          />
        )}
        {screen === "game" && <GameScreen onBack={() => openScreen("home")} onDecks={() => openScreen("decks")} />}
      </motion.div>
    </AnimatePresence>
  );
}
