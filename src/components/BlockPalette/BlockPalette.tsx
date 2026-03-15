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
      className={`cursor-grab transition-transform active:cursor-grabbing ${isDragging ? 'scale-95 opacity-40' : 'hover:scale-[1.02]'}`}
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
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

  return (
    <section
      className={`flex flex-col overflow-hidden bg-white ${className}`}
      aria-label="Block palette"
    >
      <div className="border-b border-app-border px-4 py-2.5">
        <h2 className="font-inter text-xs font-bold uppercase tracking-widest text-app-secondaryText">
          Blocks
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col py-1">
          {CATEGORIES.map((cat) => {
            const blocks = opcodeRegistry.getByCategory(cat.id)
            const isExpanded = expandedCategories.has(cat.id)
            const isSelected = selectedCategory === cat.id

            return (
              <div key={cat.id}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors ${
                    isSelected
                      ? 'bg-gray-50 font-semibold'
                      : 'hover:bg-gray-50/60'
                  }`}
                  aria-expanded={isExpanded}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 shrink-0 rounded-full shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1 font-inter text-[13px] text-app-text">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-app-secondaryText transition-transform" style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                    ▾
                  </span>
                </button>

                {isExpanded && blocks.length > 0 && (
                  <div className="flex flex-col gap-1.5 px-3 pb-2 pt-1">
                    {blocks.map((info) => (
                      <DraggablePaletteBlock key={info.opcode} info={info} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
