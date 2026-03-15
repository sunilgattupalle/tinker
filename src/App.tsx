import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { Toolbar } from '@/components/ui'
import { BlockPalette } from '@/components/BlockPalette'
import { ScriptCanvas } from '@/components/ScriptCanvas'
import { SpriteStage } from '@/components/SpriteStage'
import { CosmoChat } from '@/components/CosmoChat'
import { useUIStore } from '@/store/ui'
import { useProjectStore } from '@/store/project'
import { Block } from '@/components/ui/Block'
import { opcodeRegistry } from '@/scratch/opcodes'
import { createBlock, connectBlocks } from '@/scratch/blockAdapter'

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

interface DragData {
  type: 'palette-block'
  opcode: string
}

export function App() {
  const isPaletteOpen = useUIStore((s) => s.isPaletteOpen)
  const togglePalette = useUIStore((s) => s.togglePalette)
  const isNarrow = useIsNarrow()
  const editingTargetId = useProjectStore((s) => s.editingTargetId)

  const showPalette = isNarrow ? isPaletteOpen : true

  const [draggedOpcode, setDraggedOpcode] = useState<string | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined
    if (data?.type === 'palette-block') {
      setDraggedOpcode(data.opcode)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedOpcode(null)
    const data = event.active.data.current as DragData | undefined
    if (!data || data.type !== 'palette-block' || !editingTargetId) return

    const over = event.over
    if (!over) return

    const overData = over.data.current as { type: string; blockId?: string; accepts?: string } | undefined

    if (overData?.type === 'canvas') {
      const pointerX = (event.activatorEvent as PointerEvent)?.clientX ?? 100
      const pointerY = (event.activatorEvent as PointerEvent)?.clientY ?? 100
      createBlock(editingTargetId, {
        opcode: data.opcode,
        x: pointerX - 250,
        y: pointerY - 80,
      })
    } else if (overData?.type === 'block-snap' && overData.blockId) {
      const newBlockId = createBlock(editingTargetId, {
        opcode: data.opcode,
        x: 0,
        y: 0,
      })
      connectBlocks(newBlockId, overData.blockId, overData.accepts)
    }
  }

  const draggedInfo = draggedOpcode
    ? opcodeRegistry.getByOpcode(draggedOpcode)
    : null

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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

      <DragOverlay>
        {draggedInfo && (
          <Block info={draggedInfo} isOverlay />
        )}
      </DragOverlay>
    </DndContext>
  )
}
