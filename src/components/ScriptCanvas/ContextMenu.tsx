import { useEffect, useRef } from "react";
import { useUIStore } from "@/store/ui";
import { useProjectStore } from "@/store/project";

export function ContextMenu() {
  const contextMenu = useUIStore((s) => s.contextMenu);
  const closeContextMenu = useUIStore((s) => s.closeContextMenu);
  const removeBlock = useProjectStore((s) => s.removeBlock);
  const removeScript = useProjectStore((s) => s.removeScript);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    }
    if (contextMenu) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [contextMenu, closeContextMenu]);

  if (!contextMenu) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] rounded-button border border-panel-border bg-panel-bg py-1 shadow-lg"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      <button
        className="flex w-full items-center px-3 py-1.5 text-left font-ui text-sm text-text-primary hover:bg-app-bg"
        onClick={() => {
          removeBlock(contextMenu.blockId, contextMenu.scriptId);
          closeContextMenu();
        }}
      >
        Delete block
      </button>
      <button
        className="flex w-full items-center px-3 py-1.5 text-left font-ui text-sm text-stop hover:bg-app-bg"
        onClick={() => {
          removeScript(contextMenu.scriptId);
          closeContextMenu();
        }}
      >
        Delete script
      </button>
    </div>
  );
}
