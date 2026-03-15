import { useUIStore } from '@/store/ui'

export interface BlockPaletteProps {
  className?: string
}

const CATEGORIES = [
  { id: 'motion', name: 'Motion', color: '#4C97FF' },
  { id: 'looks', name: 'Looks', color: '#9966FF' },
  { id: 'sound', name: 'Sound', color: '#CF63CF' },
  { id: 'events', name: 'Events', color: '#FFBF00' },
  { id: 'control', name: 'Control', color: '#FFAB19' },
  { id: 'sensing', name: 'Sensing', color: '#5CB1D6' },
  { id: 'operators', name: 'Operators', color: '#59C059' },
] as const

export function BlockPalette({ className = '' }: BlockPaletteProps) {
  const selectedCategory = useUIStore((s) => s.selectedCategory)
  const setSelectedCategory = useUIStore((s) => s.setSelectedCategory)

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
      <nav className="flex flex-col gap-0.5 p-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2.5 rounded-button px-3 py-2 text-left transition-colors ${
              selectedCategory === cat.id
                ? 'bg-gray-100 font-semibold'
                : 'hover:bg-gray-50'
            }`}
            aria-current={selectedCategory === cat.id ? 'true' : undefined}
          >
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <span className="font-inter text-sm text-app-text">{cat.name}</span>
          </button>
        ))}
      </nav>
    </section>
  )
}
