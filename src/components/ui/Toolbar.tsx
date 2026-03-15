import { useProjectStore } from "@/store/project";
import { useRuntimeStore } from "@/store/runtime";
import { runGreenFlag, stopAll } from "@/blocks/interpreter";
import { saveProject } from "@/utils";

interface ToolbarProps {
  onNewProject?: () => void;
}

export function Toolbar({ onNewProject }: ToolbarProps) {
  const project = useProjectStore((s) => s.project);
  const setProjectName = useProjectStore((s) => s.setProjectName);
  const isRunning = useRuntimeStore((s) => s.isRunning);

  const handleSave = () => {
    saveProject(project);
  };

  return (
    <header className="flex h-toolbar-h shrink-0 items-center border-b border-panel-border bg-panel-bg px-4">
      <div className="flex items-center gap-2">
        <button
          aria-label="Run project"
          onClick={runGreenFlag}
          className={`flex h-8 w-8 items-center justify-center rounded-button text-white transition-all ${
            isRunning
              ? "bg-success/60"
              : "bg-success hover:opacity-80 hover:shadow-md"
          }`}
        >
          <span className="text-sm">▶</span>
        </button>
        <button
          aria-label="Stop project"
          onClick={stopAll}
          disabled={!isRunning}
          className={`flex h-8 w-8 items-center justify-center rounded-button text-white transition-all ${
            isRunning
              ? "bg-stop hover:opacity-80"
              : "bg-stop/40 cursor-not-allowed"
          }`}
        >
          <span className="text-sm">■</span>
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center gap-2">
        <input
          type="text"
          value={project.name}
          onChange={(e) => setProjectName(e.target.value)}
          aria-label="Project name"
          className="w-48 rounded-input border border-panel-border bg-transparent px-3 py-1 text-center font-ui text-sm font-medium text-text-primary outline-none focus:border-accent"
        />
        <button
          onClick={handleSave}
          aria-label="Save project"
          className="rounded-button border border-panel-border px-2.5 py-1 font-ui text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          Save
        </button>
        {onNewProject && (
          <button
            onClick={onNewProject}
            aria-label="New project"
            className="rounded-button border border-panel-border px-2.5 py-1 font-ui text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            New
          </button>
        )}
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
