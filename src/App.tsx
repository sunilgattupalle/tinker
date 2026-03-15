import { useEffect, useState } from 'react'
import { initializeScratchVM } from '@/scratch/setup'
import { Toolbar } from '@/components/ui'
import { BlockPalette } from '@/components/BlockPalette'
import { ScriptCanvas } from '@/components/ScriptCanvas'
import { SpriteStage } from '@/components/SpriteStage'
import { CosmoChat } from '@/components/CosmoChat'
import { useUIStore } from '@/store/ui'

function getIsNarrow(breakpoint: number) {
  return typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
}

function useIsNarrow(breakpoint = 1024) {
  const [isNarrow, setIsNarrow] = useState(() => getIsNarrow(breakpoint))

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])

  return isNarrow
}

export function App() {
  const isPaletteOpen = useUIStore((s) => s.isPaletteOpen)
  const togglePalette = useUIStore((s) => s.togglePalette)
  const isNarrow = useIsNarrow()

  const showPalette = isNarrow ? isPaletteOpen : true

  useEffect(() => {
    const vm = initializeScratchVM()
    vm.start()
  }, [])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <Toolbar />

      <div className="relative flex min-h-0 flex-1">
        {isNarrow && (
          <button
            onClick={togglePalette}
            className="absolute left-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-button bg-app-primary text-xs font-bold text-white shadow-md"
            aria-label={isPaletteOpen ? 'Hide block palette' : 'Show block palette'}
          >
            ☰
          </button>
        )}

        {showPalette && (
          <BlockPalette
            className={`w-palette-w shrink-0 border-r border-app-border ${
              isNarrow
                ? 'absolute inset-y-0 left-0 z-10 shadow-lg'
                : ''
            }`}
          />
        )}

        <ScriptCanvas className="min-w-0 flex-1" />

        <SpriteStage className="w-stage-w shrink-0 border-l border-app-border" />
      </div>

      <CosmoChat className="h-chatbar-h shrink-0" />
    </div>
  )
}
