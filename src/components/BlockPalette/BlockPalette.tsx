const CATEGORIES = [
  { name: "Motion", color: "bg-block-motion" },
  { name: "Looks", color: "bg-block-looks" },
  { name: "Sound", color: "bg-block-sound" },
  { name: "Events", color: "bg-block-events" },
  { name: "Control", color: "bg-block-control" },
  { name: "Sensing", color: "bg-block-sensing" },
  { name: "Operators", color: "bg-block-operators" },
] as const;

export function BlockPalette() {
  return (
    <aside className="flex w-palette-w shrink-0 flex-col overflow-y-auto border-r border-panel-border bg-panel-bg">
      <h2 className="px-3 pt-3 pb-2 font-ui text-xs font-bold uppercase tracking-wide text-text-secondary">
        Blocks
      </h2>
      <nav className="flex flex-col gap-0.5 px-2 pb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            className="flex items-center gap-2.5 rounded-button px-2.5 py-2 text-left transition-colors hover:bg-app-bg"
          >
            <span
              className={`h-3 w-3 shrink-0 rounded-full ${cat.color}`}
            />
            <span className="font-ui text-sm font-medium text-text-primary">
              {cat.name}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
