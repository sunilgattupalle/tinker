import type { SharedProject } from "@/types";

interface ImportModalProps {
  isOpen: boolean;
  project: SharedProject | null;
  onConfirm: () => void;
  onCancel: () => void;
  errorMessage?: string;
}

export function ImportModal({
  isOpen,
  project,
  onConfirm,
  onCancel,
  errorMessage,
}: ImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-panel-border bg-panel-bg p-6 shadow-xl">
        {errorMessage ? (
          <>
            <h2 className="mb-4 font-display text-xl font-bold text-text-primary">
              Import Failed
            </h2>
            <p className="mb-6 font-ui text-sm text-text-secondary">
              {errorMessage}
            </p>
            <button
              onClick={onCancel}
              className="w-full rounded-button bg-accent px-4 py-2 font-ui text-sm font-medium text-white transition-colors hover:opacity-80"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <h2 className="mb-4 font-display text-xl font-bold text-text-primary">
              Load Project?
            </h2>
            <p className="mb-6 font-ui text-sm text-text-secondary">
              Load "{project?.name || "Untitled"}"
              {project?.author && ` by ${project.author}`}? This will replace
              your current project.
            </p>
            {project?.description && (
              <p className="mb-6 rounded-input border border-panel-border bg-transparent px-3 py-2 font-ui text-xs italic text-text-secondary">
                {project.description}
              </p>
            )}
            {project?.thumbnail && (
              <div className="mb-6 flex justify-center">
                <img
                  src={project.thumbnail}
                  alt="Project preview"
                  className="rounded border border-panel-border"
                />
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 rounded-button border border-panel-border px-4 py-2 font-ui text-sm transition-colors hover:border-accent hover:text-accent"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-button bg-accent px-4 py-2 font-ui text-sm font-medium text-white transition-colors hover:opacity-80"
              >
                Load Project
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
