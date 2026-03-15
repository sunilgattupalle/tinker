import { useRef, useEffect, useCallback } from "react";
import { useProjectStore, generateId } from "@/store/project";
import { useRuntimeStore } from "@/store/runtime";
import { renderFrame, hitTestSprite } from "@/sprites/renderer";
import { runSpriteClickScripts } from "@/blocks/interpreter";

export function SpriteStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const project = useProjectStore((s) => s.project);
  const setActiveSprite = useProjectStore((s) => s.setActiveSprite);
  const addSprite = useProjectStore((s) => s.addSprite);
  const speechBubbles = useRuntimeStore((s) => s.speechBubbles);

  const activeSprite = project.sprites.find(
    (s) => s.id === project.activeSpriteId,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      const currentProject = useProjectStore.getState().project;
      const currentBubbles = useRuntimeStore.getState().speechBubbles;
      renderFrame(ctx!, currentProject.sprites, currentProject.stage, currentBubbles);
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const currentProject = useProjectStore.getState().project;
      for (let i = currentProject.sprites.length - 1; i >= 0; i--) {
        const sprite = currentProject.sprites[i];
        if (hitTestSprite(sprite, cx, cy, currentProject.stage)) {
          runSpriteClickScripts(sprite.id);
          return;
        }
      }
    },
    [],
  );

  const handleAddSprite = useCallback(() => {
    const id = generateId();
    addSprite({
      id,
      name: `Sprite${project.sprites.length + 1}`,
      x: 0,
      y: 0,
      direction: 90,
      size: 100,
      visible: true,
      costumes: [
        {
          name: "cat",
          url: "/tinker/assets/sprites/cat.svg",
          width: 48,
          height: 48,
          centerX: 24,
          centerY: 24,
        },
      ],
      currentCostumeIndex: 0,
      scripts: [],
      rotationStyle: "all_around",
    });
    setActiveSprite(id);
  }, [addSprite, setActiveSprite, project.sprites.length]);

  return (
    <aside className="flex w-stage-w shrink-0 flex-col border-l border-panel-border bg-panel-bg">
      <div className="flex flex-1 items-start justify-center p-2">
        <canvas
          ref={canvasRef}
          id="sprite-stage-canvas"
          width={480}
          height={360}
          aria-label="Sprite stage"
          className="cursor-pointer rounded border border-panel-border"
          onClick={handleCanvasClick}
        />
      </div>

      <div className="border-t border-panel-border px-3 py-2">
        <div className="flex items-center justify-between pb-1.5">
          <h3 className="font-ui text-xs font-bold uppercase tracking-wide text-text-secondary">
            Sprites
          </h3>
          {activeSprite && (
            <span className="font-ui text-[10px] text-text-secondary">
              x: {Math.round(activeSprite.x)} y: {Math.round(activeSprite.y)}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {project.sprites.map((sprite) => {
            const bubble = speechBubbles.get(sprite.id);
            return (
              <button
                key={sprite.id}
                onClick={() => setActiveSprite(sprite.id)}
                className={`flex h-12 w-12 flex-col items-center justify-center rounded-button border font-ui text-[10px] font-medium ${
                  sprite.id === project.activeSpriteId
                    ? "border-accent bg-white text-accent"
                    : "border-panel-border bg-white text-text-secondary hover:border-accent/50"
                }`}
                title={bubble ? `${sprite.name}: "${bubble.text}"` : sprite.name}
              >
                <span className="truncate max-w-[40px]">{sprite.name}</span>
              </button>
            );
          })}
          <button
            onClick={handleAddSprite}
            aria-label="Add sprite"
            className="flex h-12 w-12 items-center justify-center rounded-button border border-dashed border-panel-border text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            <span className="text-lg">+</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
