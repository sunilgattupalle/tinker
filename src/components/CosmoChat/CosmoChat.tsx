import { useState } from 'react'

export interface CosmoChatProps {
  className?: string
}

const WELCOME_MESSAGE =
  "Hi! I'm Cosmo 🤖 Tell me what you want to build and I'll help you make it!"

export function CosmoChat({ className = '' }: CosmoChatProps) {
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    setInputValue('')
  }

  return (
    <section
      className={`flex items-start gap-3 border-t border-app-border bg-app-panel px-4 py-3 ${className}`}
      aria-label="Cosmo chat"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-app-cosmo text-lg font-bold text-white"
        aria-label="Cosmo avatar"
      >
        C
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-y-auto">
        <div className="rounded-lg bg-app-cosmo/10 px-3 py-2">
          <p className="font-nunito text-sm text-app-text">{WELCOME_MESSAGE}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend()
          }}
          placeholder="Ask Cosmo something..."
          className="w-64 rounded-input border border-app-border bg-white px-3 py-2 font-inter text-sm text-app-text outline-none placeholder:text-app-secondaryText focus:border-app-cosmo"
          aria-label="Chat input"
        />
        <button
          onClick={handleSend}
          className="flex h-9 w-9 items-center justify-center rounded-button bg-app-cosmo text-white transition-opacity hover:opacity-80"
          aria-label="Send message"
        >
          <span className="text-base">↑</span>
        </button>
      </div>
    </section>
  )
}
