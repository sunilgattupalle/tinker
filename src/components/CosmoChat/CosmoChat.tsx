import { useState } from "react";

export function CosmoChat() {
  const [input, setInput] = useState("");

  return (
    <footer className="flex h-chatbar-h shrink-0 items-stretch border-t border-panel-border bg-panel-bg">
      <div className="flex w-14 shrink-0 items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmo font-display text-lg font-bold text-white">
          C
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center overflow-y-auto py-2 pr-2">
        <div className="flex flex-col gap-2">
          <div className="max-w-prose rounded-lg bg-app-bg px-3 py-2 font-display text-sm text-text-primary">
            Hi! I&apos;m Cosmo 🤖 Tell me what you want to build and
            I&apos;ll help you make it!
          </div>
        </div>
      </div>

      <div className="flex w-72 shrink-0 items-center gap-2 px-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Cosmo anything..."
          aria-label="Chat input"
          className="flex-1 rounded-input border border-panel-border px-3 py-2 font-ui text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
        />
        <button
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-button bg-cosmo text-white transition-opacity hover:opacity-80"
        >
          <span className="text-base">↑</span>
        </button>
      </div>
    </footer>
  );
}
