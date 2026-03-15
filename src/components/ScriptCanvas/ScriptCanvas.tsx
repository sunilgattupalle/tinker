import { useState, useCallback } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useProjectStore } from '@/store/project'
import { opcodeRegistry } from '@/scratch/opcodes'
import { changeBlockInput, changeBlockField, deleteBlock } from '@/scratch/blockAdapter'
import { Block } from '@/components/ui/Block'
import type { UIBlock } from '@/types'

export interface ScriptCanvasProps {
  className?: string
}

interface ContextMenuState {
  x: number
  y: number
  blockId: string
}

function CanvasBlock({
  block,
  allBlocks,
}: {
  block: UIBlock
  allBlocks: UIBlock[]
}) {
  const editingTargetId = useProjectStore((s) => s.editingTargetId)
  const info = opcodeRegistry.getByOpcode(block.opcode)
  const isCap = info?.shape === 'cap'
  const hasSubstack = info?.hasSubstack ?? false

  const { setNodeRef: setSnapRef, isOver: isSnapOver } = useDroppable({
    id: `snap-below-${block.id}`,
    data: { type: 'block-snap', blockId: block.id, accepts: 'next' },
    disabled: isCap || !info,
  })

  const { setNodeRef: setSubstackRef, isOver: isSubstackOver } = useDroppable({
    id: `snap-substack-${block.id}`,
    data: { type: 'block-snap', blockId: block.id, accepts: 'SUBSTACK' },
    disabled: !hasSubstack,
  })

  if (!info) return null

  const handleInputChange = (inputName: string, value: unknown) => {
    changeBlockInput(block.id, inputName, value)
  }

  const handleFieldChange = (fieldName: string, value: unknown) => {
    changeBlockField(block.id, fieldName, value)
  }

  const substackBlocks: UIBlock[] = []
  if (block.children?.SUBSTACK) {
    let childId: string | null = block.children.SUBSTACK
    while (childId) {
      const child = allBlocks.find((b) => b.id === childId)
      if (child) {
        substackBlocks.push(child)
        childId = child.next
      } else {
        break
      }
    }
  }

  const nextBlock = block.next ? allBlocks.find((b) => b.id === block.next) : null

  return (
    <div data-block-id={block.id} data-canvas-block>
      <Block
        info={info}
        block={block}
        onInputChange={handleInputChange}
        onFieldChange={handleFieldChange}
      >
        {hasSubstack && (
          <div
            ref={setSubstackRef}
            className={`min-h-[28px] rounded p-0.5 transition-all ${
              isSubstackOver ? 'bg-app-primary/20 ring-2 ring-app-primary/40' : ''
            }`}
          >
            {substackBlocks.length > 0 ? (
              substackBlocks.map((child) => (
                <CanvasBlock key={child.id} block={child} allBlocks={allBlocks} />
              ))
            ) : (
              <div className="flex h-7 items-center justify-center rounded border border-dashed border-gray-300 text-[10px] text-gray-400">
                drop blocks here
              </div>
            )}
          </div>
        )}
      </Block>

      {!isCap && !block.next && (
        <div
          ref={setSnapRef}
          className={`h-2 transition-all ${
            isSnapOver ? 'h-6 rounded bg-app-primary/20 ring-2 ring-app-primary/40' : ''
          }`}
        />
      )}

      {nextBlock && (
        <CanvasBlock block={nextBlock} allBlocks={allBlocks} />
      )}

      {!block.next && editingTargetId && <div className="h-0" />}
    </div>
  )
}

export function ScriptCanvas({ className = '' }: ScriptCanvasProps) {
  const blocks = useProjectStore((s) => s.blocks)
  const scriptRoots = useProjectStore((s) => s.scriptRoots)
  const editingTargetId = useProjectStore((s) => s.editingTargetId)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: 'script-canvas',
    data: { type: 'canvas' },
  })

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const blockEl = (e.target as HTMLElement).closest('[data-canvas-block]')
    if (blockEl) {
      const blockId = blockEl.getAttribute('data-block-id')
      if (blockId) setContextMenu({ x: e.clientX, y: e.clientY, blockId })
    }
  }, [])

  const handleDeleteBlock = useCallback(() => {
    if (!contextMenu || !editingTargetId) return
    deleteBlock(editingTargetId, contextMenu.blockId)
    setContextMenu(null)
  }, [contextMenu, editingTargetId])

  const handleClick = useCallback(() => setContextMenu(null), [])

  const topLevelBlocks = blocks.filter((b) => b.topLevel && scriptRoots.includes(b.id))
  const isEmpty = topLevelBlocks.length === 0

  return (
    <section
      ref={setNodeRef}
      className={`relative overflow-auto ${className}`}
      aria-label="Script canvas"
      style={{
        backgroundColor: '#F9F7F3',
        backgroundImage: 'radial-gradient(circle, #D4D2CE 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      {isEmpty ? (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <div className={`rounded-2xl px-8 py-6 text-center transition-all ${
            isOver
              ? 'bg-app-primary/10 shadow-lg ring-2 ring-app-primary/30'
              : 'bg-white/80 shadow-sm'
          }`}>
            <div className="mb-2 text-3xl">🧩</div>
            <p className="font-nunito text-sm font-semibold text-app-text">
              Drag blocks here
            </p>
            <p className="mt-1 font-inter text-xs text-app-secondaryText">
              or ask Cosmo to help you build something!
            </p>
          </div>
        </div>
      ) : (
        <div className="relative min-h-full p-4">
          {topLevelBlocks.map((rootBlock) => (
            <div
              key={rootBlock.id}
              className="absolute"
              style={{ left: rootBlock.x ?? 50, top: rootBlock.y ?? 50 }}
            >
              <CanvasBlock block={rootBlock} allBlocks={blocks} />
            </div>
          ))}
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed z-50 overflow-hidden rounded-xl border border-app-border bg-white py-1 shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={handleDeleteBlock}
            className="flex w-full items-center gap-2 px-4 py-2 text-left font-inter text-sm text-app-stop transition-colors hover:bg-red-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete block
          </button>
        </div>
      )}
    </section>
  )
}
