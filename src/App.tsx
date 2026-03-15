import { useState, useEffect } from "react";
import { Toolbar } from "./components/ui";
import { BlockPalette } from "./components/BlockPalette";
import { ScriptCanvas } from "./components/ScriptCanvas";
import { SpriteStage } from "./components/SpriteStage";
import { CosmoChat } from "./components/CosmoChat";

const BREAKPOINT = 1024;

export function App() {
  const [paletteOpen, setPaletteOpen] = useState(
    () => window.innerWidth >= BREAKPOINT,
  );
  const [isNarrow, setIsNarrow] = useState(
    () => window.innerWidth < BREAKPOINT,
  );

  useEffect(() => {
    function handleResize() {
      const narrow = window.innerWidth < BREAKPOINT;
      setIsNarrow(narrow);
      if (!narrow) setPaletteOpen(true);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Toolbar />

      <div className="relative flex flex-1 overflow-hidden">
        {isNarrow && (
          <button
            aria-label={paletteOpen ? "Hide block palette" : "Show block palette"}
            onClick={() => setPaletteOpen((v) => !v)}
            className="absolute top-2 left-2 z-20 flex h-8 w-8 items-center justify-center rounded-button bg-accent text-white shadow-md transition-opacity hover:opacity-80"
          >
            <span className="text-xs font-bold">{paletteOpen ? "✕" : "☰"}</span>
          </button>
        )}

        {paletteOpen && (
          <div className={isNarrow ? "absolute inset-y-0 left-0 z-10 shadow-lg" : ""}>
            <BlockPalette />
          </div>
        )}

        <ScriptCanvas />
        <SpriteStage />
      </div>

      <CosmoChat />
    </div>
  );
}
