import { useRef, useEffect } from "react";

export function SpriteStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <aside className="flex w-stage-w shrink-0 flex-col border-l border-panel-border bg-panel-bg">
      <div className="flex flex-1 items-start justify-center p-2">
        <canvas
          ref={canvasRef}
          width={480}
          height={360}
          aria-label="Sprite stage"
          className="rounded border border-panel-border"
        />
      </div>
      <div className="border-t border-panel-border px-3 py-2">
        <h3 className="pb-1.5 font-ui text-xs font-bold uppercase tracking-wide text-text-secondary">
          Sprites
        </h3>
        <div className="flex gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-button border border-accent bg-white font-ui text-[10px] font-medium text-accent">
            Sprite1
          </div>
        </div>
      </div>
    </aside>
  );
}
