import { useProjectStore } from "@/store/project";

export function Toolbar() {
  const projectName = useProjectStore((s) => s.project.name);
  const setProjectName = useProjectStore((s) => s.setProjectName);

  return (
    <header className="flex h-toolbar-h shrink-0 items-center border-b border-panel-border bg-panel-bg px-4">
      <div className="flex items-center gap-2">
        <button
          aria-label="Run project"
          className="flex h-8 w-8 items-center justify-center rounded-button bg-success text-white transition-opacity hover:opacity-80"
        >
          <span className="text-sm">▶</span>
        </button>
        <button
          aria-label="Stop project"
          className="flex h-8 w-8 items-center justify-center rounded-button bg-stop text-white transition-opacity hover:opacity-80"
        >
          <span className="text-sm">■</span>
        </button>
      </div>

      <div className="flex flex-1 justify-center">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          aria-label="Project name"
          className="w-48 rounded-input border border-panel-border bg-transparent px-3 py-1 text-center font-ui text-sm font-medium text-text-primary outline-none focus:border-accent"
        />
      </div>

      <div
        aria-label="Cosmo avatar"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-cosmo font-display text-sm font-bold text-white"
      >
        C
      </div>
    </header>
  );
}
