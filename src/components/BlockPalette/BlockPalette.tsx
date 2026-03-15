import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useUIStore } from '@/store/ui'
import { opcodeRegistry, CATEGORIES } from '@/scratch/opcodes'
import type { OpcodeInfo } from '@/scratch/opcodes'
import { Block } from '@/components/ui/Block'

export interface BlockPaletteProps {
  className?: string
}

function DraggablePaletteBlock({ info }: { info: OpcodeInfo }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${info.opcode}`,
    data: { type: 'palette-block', opcode: info.opcode },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40' : ''}`}
    >
      <Block info={info} isPalette />
    </div>
  )
}

export function BlockPalette({ className = '' }: BlockPaletteProps) {
  const selectedCategory = useUIStore((s) => s.selectedCategory)
  const setSelectedCategory = useUIStore((s) => s.setSelectedCategory)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set([selectedCategory]),
  )

  const toggleCategory = (catId: string) => {
    setSelectedCategory(catId)
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catId)) {
        next.delete(catId)
      } else {
        next.add(catId)
      }
      return next
    })
  }

  return (
    <section
      className={`flex flex-col overflow-y-auto bg-app-panel ${className}`}
      aria-label="Block palette"
    >
      <div className="border-b border-app-border px-3 py-2">
        <h2 className="font-inter text-xs font-bold uppercase tracking-wide text-app-secondaryText">
          Blocks
        </h2>
      </div>
      <div className="flex flex-col gap-0.5 p-1">
        {CATEGORIES.map((cat) => {
          const blocks = opcodeRegistry.getByCategory(cat.id)
          const isExpanded = expandedCategories.has(cat.id)

          return (
            <div key={cat.id}>
              <button
                onClick={() => toggleCategory(cat.id)}
                className={`flex w-full items-center gap-2 rounded-button px-3 py-1.5 text-left transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-gray-100 font-semibold'
                    : 'hover:bg-gray-50'
                }`}
                aria-expanded={isExpanded}
                aria-current={selectedCategory === cat.id ? 'true' : undefined}
              >
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 font-inter text-sm text-app-text">
                  {cat.name}
                </span>
                <span className="text-xs text-app-secondaryText">
                  {isExpanded ? '▾' : '▸'}
                </span>
              </button>

              {isExpanded && blocks.length > 0 && (
                <div className="flex flex-col gap-1 px-2 py-1">
                  {blocks.map((info) => (
                    <DraggablePaletteBlock key={info.opcode} info={info} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
