import { useDraggable } from "@dnd-kit/core";
import type { BlockCategory, BlockDefinition } from "@/types";
import { getBlocksByCategory } from "@/blocks/registry";
import { useUIStore } from "@/store/ui";
import { Block } from "@/components/Block";

const CATEGORIES: { name: string; key: BlockCategory; color: string }[] = [
  { name: "Motion", key: "motion", color: "bg-block-motion" },
  { name: "Looks", key: "looks", color: "bg-block-looks" },
  { name: "Events", key: "events", color: "bg-block-events" },
  { name: "Control", key: "control", color: "bg-block-control" },
  { name: "Sensing", key: "sensing", color: "bg-block-sensing" },
  { name: "Operators", key: "operators", color: "bg-block-operators" },
];

function PaletteDraggableBlock({ definition }: { definition: BlockDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.id}`,
    data: { type: "palette-block", definitionId: definition.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Block definition={definition} readonly />
    </div>
  );
}

export function BlockPalette() {
  const expandedCategories = useUIStore((s) => s.expandedCategories);
  const toggleCategory = useUIStore((s) => s.toggleCategory);

  return (
    <aside className="flex h-full w-palette-w shrink-0 flex-col overflow-y-auto border-r border-panel-border bg-panel-bg">
      <h2 className="px-3 pt-3 pb-2 font-ui text-xs font-bold uppercase tracking-wide text-text-secondary">
        Blocks
      </h2>
      <div className="flex flex-col gap-1 px-2 pb-3">
        {CATEGORIES.map((cat) => {
          const isExpanded = expandedCategories.has(cat.key);
          const blocks = getBlocksByCategory(cat.key);
          return (
            <div key={cat.key}>
              <button
                onClick={() => toggleCategory(cat.key)}
                className="flex w-full items-center gap-2.5 rounded-button px-2.5 py-2 text-left transition-colors hover:bg-app-bg"
                aria-expanded={isExpanded}
              >
                <span className={`h-3 w-3 shrink-0 rounded-full ${cat.color}`} />
                <span className="flex-1 font-ui text-sm font-medium text-text-primary">
                  {cat.name}
                </span>
                <span className="text-xs text-text-secondary">
                  {isExpanded ? "▾" : "▸"}
                </span>
              </button>
              {isExpanded && (
                <div className="flex flex-col gap-1 py-1 pl-2">
                  {blocks.map((def) => (
                    <PaletteDraggableBlock key={def.id} definition={def} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
