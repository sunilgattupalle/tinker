import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { Toolbar, ShareModal, WelcomeScreen } from '@/components/ui'
import { BlockPalette } from '@/components/BlockPalette'
import { ScriptCanvas } from '@/components/ScriptCanvas'
import { SpriteStage } from '@/components/SpriteStage'
import { CosmoChat } from '@/components/CosmoChat'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useUIStore } from '@/store/ui'
import { useProjectStore } from '@/store/project'
import { Block } from '@/components/ui/Block'
import { opcodeRegistry } from '@/scratch/opcodes'
import { createBlock, connectBlocks } from '@/scratch/blockAdapter'
import { setupDropZone, importProject } from '@/sharing/import'
import { getProjectFromCurrentURL, clearURLFragment } from '@/sharing/urlShare'

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
  const vm = useProjectStore((s) => s.vm)

  const showPalette = isNarrow ? isPaletteOpen : true

  const [draggedOpcode, setDraggedOpcode] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingURLData, setPendingURLData] = useState<ArrayBuffer | null>(() => getProjectFromCurrentURL())

  // File drop zone
  useEffect(() => {
    return setupDropZone((file) => setPendingFile(file))
  }, [])

  const handleFileImport = async () => {
    if (!pendingFile || !vm) return
    try {
      await importProject(vm, pendingFile)
    } catch (err) {
      console.error('Import failed:', err)
    }
    setPendingFile(null)
  }

  const handleURLImport = async () => {
    if (!pendingURLData || !vm) return
    try {
      await vm.loadProject(pendingURLData)
    } catch (err) {
      console.error('URL import failed:', err)
    }
    setPendingURLData(null)
    clearURLFragment()
  }

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined
    if (data?.type === 'palette-block') setDraggedOpcode(data.opcode)
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

  const draggedInfo = draggedOpcode ? opcodeRegistry.getByOpcode(draggedOpcode) : null

  return (
    <>
      <WelcomeScreen />

      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-app-background">
          <Toolbar />

          <div className="relative flex min-h-0 flex-1">
            {isNarrow && (
              <button
                onClick={togglePalette}
                className="absolute left-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-lg bg-app-primary text-white shadow-md transition-all hover:shadow-lg"
                aria-label={isPaletteOpen ? 'Hide block palette' : 'Show block palette'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}

            {showPalette && (
              <BlockPalette
                className={`w-palette-w shrink-0 border-r border-app-border ${
                  isNarrow ? 'absolute inset-y-0 left-0 z-10 shadow-xl' : ''
                }`}
              />
            )}

            <ScriptCanvas className="min-w-0 flex-1" />
            <SpriteStage className="w-stage-w shrink-0 border-l border-app-border" />
          </div>

          <CosmoChat className="h-chatbar-h shrink-0" />
        </div>

        <DragOverlay>
          {draggedInfo && <Block info={draggedInfo} isOverlay />}
        </DragOverlay>
      </DndContext>

      <ShareModal />

      <ConfirmModal
        open={pendingFile !== null}
        title="Open project?"
        message={`Load "${pendingFile?.name}"? This will replace your current project.`}
        confirmLabel="Load"
        onConfirm={() => void handleFileImport()}
        onCancel={() => setPendingFile(null)}
      />

      <ConfirmModal
        open={pendingURLData !== null && vm !== null}
        title="Open shared project?"
        message="Someone shared a project with you. Load it?"
        confirmLabel="Load"
        onConfirm={() => void handleURLImport()}
        onCancel={() => { setPendingURLData(null); clearURLFragment() }}
      />
    </>
  )
}
