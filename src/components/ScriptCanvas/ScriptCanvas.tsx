import { useDroppable } from "@dnd-kit/core";
import { useProjectStore } from "@/store/project";
import { ScriptStack } from "./ScriptStack";
import { ContextMenu } from "./ContextMenu";

export function ScriptCanvas() {
  const activeSprite = useProjectStore((s) =>
    s.project.sprites.find((sp) => sp.id === s.project.activeSpriteId),
  );

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop",
    data: { type: "canvas-drop" },
  });

  const scripts = activeSprite?.scripts ?? [];

  return (
    <div
      ref={setNodeRef}
      className="relative flex flex-1 overflow-auto bg-app-bg"
      style={{
        backgroundImage:
          "radial-gradient(circle, #d1d0cc 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {scripts.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <p className="pointer-events-none select-none font-display text-base text-text-secondary">
            Drag blocks here or ask Cosmo to help!
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-start gap-6 p-4">
        {scripts.map((script) => (
          <ScriptStack key={script.id} script={script} />
        ))}
      </div>

      {isOver && (
        <div className="pointer-events-none absolute inset-0 rounded border-2 border-dashed border-accent/30 bg-accent/5" />
      )}

      <ContextMenu />
    </div>
  );
}
