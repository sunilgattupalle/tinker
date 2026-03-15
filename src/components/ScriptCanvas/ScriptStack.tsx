import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { BlockInstance, Script } from "@/types";
import { getBlockDefinition } from "@/blocks/registry";
import { C_SHAPED_BLOCKS } from "@/blocks/definitions";
import { Block } from "@/components/Block";
import { useProjectStore } from "@/store/project";
import { useUIStore } from "@/store/ui";

interface ScriptStackProps {
  script: Script;
}

function CanvasBlock({
  block,
  script,
  allBlocks,
}: {
  block: BlockInstance;
  script: Script;
  allBlocks: Record<string, BlockInstance>;
}) {
  const def = getBlockDefinition(block.definitionId);
  const updateBlockArgs = useProjectStore((s) => s.updateBlockArgs);
  const openContextMenu = useUIStore((s) => s.openContextMenu);

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `canvas-${block.id}`,
    data: { type: "canvas-block", blockId: block.id, scriptId: script.id },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-after-${block.id}`,
    data: { type: "block-drop", afterBlockId: block.id, scriptId: script.id },
  });

  if (!def) return null;

  const isCShape = C_SHAPED_BLOCKS.has(def.id);
  const bodyBlockId = block.branch?.body;
  const bodyBlocks: BlockInstance[] = [];
  if (bodyBlockId) {
    let current: BlockInstance | undefined = allBlocks[bodyBlockId];
    while (current) {
      bodyBlocks.push(current);
      current = current.next ? allBlocks[current.next] : undefined;
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(e.clientX, e.clientY, block.id, script.id);
  };

  return (
    <div
      style={{ opacity: isDragging ? 0.4 : 1 }}
      onContextMenu={handleContextMenu}
    >
      <div ref={setDragRef} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
        <Block
          id={block.id}
          definition={def}
          args={block.args}
          onArgsChange={(name, value) =>
            updateBlockArgs(block.id, script.id, { [name]: value })
          }
          {...(isCShape
            ? {
                children: (
                  <BodyDropZone
                    parentBlockId={block.id}
                    scriptId={script.id}
                    bodyBlocks={bodyBlocks}
                    script={script}
                    allBlocks={allBlocks}
                  />
                ),
              }
            : {})}
        />
      </div>

      <div
        ref={setDropRef}
        className="h-1 transition-all"
        style={{
          backgroundColor: isOver ? "#4C6EF5" : "transparent",
          height: isOver ? "6px" : "2px",
          borderRadius: "2px",
        }}
      />

      {block.next && allBlocks[block.next] && (
        <CanvasBlock
          block={allBlocks[block.next]}
          script={script}
          allBlocks={allBlocks}
        />
      )}
    </div>
  );
}

function BodyDropZone({
  parentBlockId,
  scriptId,
  bodyBlocks,
  script,
  allBlocks,
}: {
  parentBlockId: string;
  scriptId: string;
  bodyBlocks: BlockInstance[];
  script: Script;
  allBlocks: Record<string, BlockInstance>;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-body-${parentBlockId}`,
    data: { type: "body-drop", parentBlockId, scriptId },
  });

  if (bodyBlocks.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className="flex min-h-[28px] items-center justify-center rounded px-2 text-xs text-white/50"
        style={{
          backgroundColor: isOver ? "rgba(76,110,245,0.25)" : "transparent",
        }}
      >
        {isOver ? "" : "…"}
      </div>
    );
  }

  return (
    <div ref={setNodeRef}>
      {bodyBlocks.map((b) => (
        <CanvasBlock key={b.id} block={b} script={script} allBlocks={allBlocks} />
      ))}
    </div>
  );
}

export function ScriptStack({ script }: ScriptStackProps) {
  const hatBlock = script.blocks[script.hatBlockId];
  if (!hatBlock) return null;

  return (
    <div className="inline-block">
      <CanvasBlock
        block={hatBlock}
        script={script}
        allBlocks={script.blocks}
      />
    </div>
  );
}
