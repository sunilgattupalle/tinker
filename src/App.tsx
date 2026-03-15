import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Toolbar } from "./components/ui";
import { BlockPalette } from "./components/BlockPalette";
import { ScriptCanvas } from "./components/ScriptCanvas";
import { SpriteStage } from "./components/SpriteStage";
import { CosmoChat } from "./components/CosmoChat";
import { Welcome } from "./components/Welcome";
import { Block } from "./components/Block";
import { getBlockDefinition } from "./blocks/registry";
import { runKeyPressScripts } from "./blocks/interpreter";
import { C_SHAPED_BLOCKS } from "./blocks/definitions";
import { useProjectStore, generateId } from "./store/project";
import { useRuntimeStore } from "./store/runtime";
import { useUIStore } from "./store/ui";
import { loadTemplate, getTemplateInfo } from "./templates";
import { saveProject, loadSavedProject } from "./utils";
import type { BlockDefinition, BlockInstance } from "./types";

const BREAKPOINT = 1024;
const AUTOSAVE_INTERVAL = 30_000;

function createBlockInstance(def: BlockDefinition): BlockInstance {
  const args: Record<string, string | number | boolean> = {};
  for (const input of def.inputs) {
    args[input.name] = input.default;
  }
  return {
    id: generateId(),
    definitionId: def.id,
    args,
    next: null,
    parent: null,
    ...(C_SHAPED_BLOCKS.has(def.id) ? { branch: {} } : {}),
  };
}

export function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(
    () => window.innerWidth >= BREAKPOINT,
  );
  const [isNarrow, setIsNarrow] = useState(
    () => window.innerWidth < BREAKPOINT,
  );
  const [draggedDef, setDraggedDef] = useState<BlockDefinition | null>(null);

  const addScript = useProjectStore((s) => s.addScript);
  const addBlock = useProjectStore((s) => s.addBlock);
  const addBlockToBody = useProjectStore((s) => s.addBlockToBody);
  const loadProject = useProjectStore((s) => s.loadProject);
  const resetProject = useProjectStore((s) => s.resetProject);
  const addChatMessage = useUIStore((s) => s.addChatMessage);
  const clearChat = useUIStore((s) => s.clearChat);

  useEffect(() => {
    function handleResize() {
      const narrow = window.innerWidth < BREAKPOINT;
      setIsNarrow(narrow);
      if (!narrow) setPaletteOpen(true);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (showWelcome) return;
      useRuntimeStore.getState().setKeyPressed(e.key, true);
      runKeyPressScripts(e.key);
    }
    function handleKeyUp(e: KeyboardEvent) {
      useRuntimeStore.getState().setKeyPressed(e.key, false);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showWelcome]);

  useEffect(() => {
    if (showWelcome) return;
    const interval = setInterval(() => {
      const project = useProjectStore.getState().project;
      saveProject(project);
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [showWelcome]);

  const enterEditor = useCallback(
    (greeting?: string) => {
      setShowWelcome(false);
      if (greeting) {
        clearChat();
        addChatMessage({ role: "cosmo", content: greeting });
      }
    },
    [clearChat, addChatMessage],
  );

  const handleSelectTemplate = useCallback(
    (id: string) => {
      const project = loadTemplate(id);
      if (!project) return;
      loadProject(project);
      const info = getTemplateInfo(id);
      enterEditor(info?.cosmoGreeting);
    },
    [loadProject, enterEditor],
  );

  const handleBlankProject = useCallback(() => {
    resetProject();
    enterEditor();
  }, [resetProject, enterEditor]);

  const handleContinueSaved = useCallback(() => {
    const saved = loadSavedProject();
    if (saved) {
      loadProject(saved);
      enterEditor("Welcome back! Let's keep building 🚀");
    } else {
      handleBlankProject();
    }
  }, [loadProject, enterEditor, handleBlankProject]);

  const handleNewProject = useCallback(() => {
    setShowWelcome(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === "palette-block") {
      const def = getBlockDefinition(data.definitionId as string);
      if (def) setDraggedDef(def);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggedDef(null);
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      if (activeData?.type === "palette-block") {
        const def = getBlockDefinition(activeData.definitionId as string);
        if (!def) return;
        const block = createBlockInstance(def);

        if (overData?.type === "canvas-drop") {
          if (def.shape === "hat") {
            addScript(block);
          } else {
            addScript({ ...block, id: generateId() } as BlockInstance);
          }
        } else if (overData?.type === "block-drop") {
          addBlock(block, overData.scriptId as string, overData.afterBlockId as string);
        } else if (overData?.type === "body-drop") {
          addBlockToBody(block, overData.scriptId as string, overData.parentBlockId as string);
        }
      }
    },
    [addScript, addBlock, addBlockToBody],
  );

  if (showWelcome) {
    return (
      <Welcome
        onSelectTemplate={handleSelectTemplate}
        onBlankProject={handleBlankProject}
        onContinue={handleContinueSaved}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col overflow-hidden">
        <Toolbar onNewProject={handleNewProject} />

        <div className="relative flex flex-1 overflow-hidden">
          {isNarrow && (
            <button
              aria-label={paletteOpen ? "Hide block palette" : "Show block palette"}
              onClick={() => setPaletteOpen((v) => !v)}
              className="absolute top-2 left-2 z-20 flex h-8 w-8 items-center justify-center rounded-button bg-accent text-white shadow-md transition-opacity hover:opacity-80"
            >
              <span className="text-xs font-bold">
                {paletteOpen ? "✕" : "☰"}
              </span>
            </button>
          )}

          {paletteOpen && (
            <div
              className={
                isNarrow
                  ? "absolute inset-y-0 left-0 z-10 shadow-lg"
                  : ""
              }
            >
              <BlockPalette />
            </div>
          )}

          <ScriptCanvas />
          <SpriteStage />
        </div>

        <CosmoChat />
      </div>

      <DragOverlay dropAnimation={null}>
        {draggedDef && (
          <div className="opacity-70">
            <Block definition={draggedDef} readonly />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
