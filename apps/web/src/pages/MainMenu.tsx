import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, BookOpen, Flame, Waves } from "lucide-react";
import { Button } from "../components/ui/button";

interface MainMenuProps {
  onStart: () => void;
  onDecks: () => void;
}

export function MainMenu({ onStart, onDecks }: MainMenuProps) {
  return (
    <main className="home-screen">
      <div className="home-glow home-glow-left" />
      <div className="home-glow home-glow-right" />
      <header className="site-header home-header">
        <a className="brand" href="#" aria-label="Fourfold home">
          <span className="brand-mark"><span>F</span></span>
          <span className="brand-name">FOURFOLD<small>THE ELEMENTAL CONFLICT</small></span>
        </a>
        <Button variant="ghost" onClick={onDecks}><BookOpen size={16} /> Deck forge</Button>
      </header>

      <motion.section className="hero" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="hero-kicker"><span /> A LOCAL TWO-PLAYER CARD GAME <span /></div>
        <h1>Four elements.<br /><em>One</em> battlefield.</h1>
        <p className="hero-intro">Outthink your rival. Commit your creatures in secret. Claim the lanes before the truth is revealed.</p>
        <div className="hero-actions">
          <Button className="hero-start" onClick={onStart}>Enter the arena <ArrowRight size={17} /></Button>
          <Button variant="ghost" onClick={onDecks}>Build your deck <ArrowDownRight size={16} /></Button>
        </div>
        <div className="element-orbit" aria-hidden="true">
          <span className="orbit-line" />
          <span className="orbit-symbol orbit-fire"><Flame /></span>
          <span className="orbit-symbol orbit-water"><Waves /></span>
          <span className="orbit-symbol orbit-wind">⌁</span>
          <span className="orbit-symbol orbit-earth">⬡</span>
          <span className="orbit-core">✦</span>
        </div>
      </motion.section>

      <footer className="home-footer">
        <span>THREE LANES · SIX MODULES · FOUR ELEMENTS</span>
        <span>PASS THE DEVICE TO TAKE YOUR TURN</span>
      </footer>
    </main>
  );
}
