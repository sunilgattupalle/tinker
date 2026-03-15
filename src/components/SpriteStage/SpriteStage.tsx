import { useRef } from 'react'

export interface SpriteStageProps {
  className?: string
}

export function SpriteStage({ className = '' }: SpriteStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  return (
    <section
      className={`flex flex-col overflow-y-auto bg-app-panel ${className}`}
      aria-label="Sprite stage"
    >
      <div className="flex items-center justify-center border-b border-app-border p-3">
        <canvas
          ref={canvasRef}
          width={480}
          height={360}
          className="rounded border border-app-border bg-white"
          aria-label="Stage canvas"
        />
      </div>

      <div className="flex-1 p-3">
        <h3 className="mb-2 font-inter text-xs font-bold uppercase tracking-wide text-app-secondaryText">
          Sprites
        </h3>
        <div className="flex gap-2">
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-app-primary bg-white p-1">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-events/20 text-lg">
              🐱
            </div>
            <span className="mt-0.5 font-inter text-[10px] font-medium text-app-text">
              Sprite1
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
