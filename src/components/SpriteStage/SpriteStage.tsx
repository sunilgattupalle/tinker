import { useRef, useEffect, useCallback } from 'react'
import { useProjectStore } from '@/store/project'

export interface SpriteStageProps {
  className?: string
}

const STAGE_WIDTH = 480
const STAGE_HEIGHT = 360

export function SpriteStage({ className = '' }: SpriteStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const targets = useProjectStore((s) => s.targets)
  const editingTargetId = useProjectStore((s) => s.editingTargetId)
  const setEditingTarget = useProjectStore((s) => s.setEditingTarget)
  const addSprite = useProjectStore((s) => s.addSprite)
  const deleteSprite = useProjectStore((s) => s.deleteSprite)
  const vm = useProjectStore((s) => s.vm)
  const activeSprite = targets.find((t) => t.id === editingTargetId)
  const canvasSetup = useProjectStore((s) => s.canvasSetup)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvasSetup(canvas)
  }, [canvasSetup])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!vm) return
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return
      vm.postIOData('keyboard', { key: e.key, isDown: true })
    },
    [vm],
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!vm) return
      vm.postIOData('keyboard', { key: e.key, isDown: false })
    },
    [vm],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const postMouseData = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, isDown: boolean) => {
      if (!vm || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const scaleX = STAGE_WIDTH / rect.width
      const scaleY = STAGE_HEIGHT / rect.height
      const x = (e.clientX - rect.left) * scaleX - STAGE_WIDTH / 2
      const y = -(((e.clientY - rect.top) * scaleY) - STAGE_HEIGHT / 2)
      vm.postIOData('mouse', {
        x,
        y,
        isDown,
        canvasWidth: STAGE_WIDTH,
        canvasHeight: STAGE_HEIGHT,
      })
    },
    [vm],
  )

  return (
    <section
      className={`flex flex-col overflow-y-auto bg-app-panel ${className}`}
      aria-label="Sprite stage"
    >
      <div className="flex items-center justify-center border-b border-app-border p-3">
        <canvas
          ref={canvasRef}
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          className="rounded border border-app-border bg-white"
          style={{ width: '100%', maxWidth: STAGE_WIDTH, aspectRatio: `${STAGE_WIDTH}/${STAGE_HEIGHT}` }}
          aria-label="Stage canvas"
          onMouseDown={(e) => postMouseData(e, true)}
          onMouseUp={(e) => postMouseData(e, false)}
          onMouseMove={(e) => postMouseData(e, e.buttons > 0)}
        />
      </div>

      {activeSprite && (
        <div
          className="flex items-center gap-3 border-b border-app-border px-3 py-2"
          aria-label="Sprite info"
        >
          <InfoChip label="x" value={activeSprite.x} />
          <InfoChip label="y" value={activeSprite.y} />
          <InfoChip label="dir" value={activeSprite.direction} />
          <InfoChip label="size" value={activeSprite.size} />
        </div>
      )}

      <div className="flex-1 p-3">
        <h3 className="mb-2 font-inter text-xs font-bold uppercase tracking-wide text-app-secondaryText">
          Sprites
        </h3>
        <div className="flex flex-wrap gap-2">
          {targets.map((sprite) => (
            <button
              key={sprite.id}
              onClick={() => setEditingTarget(sprite.id)}
              className={`flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 p-1 transition-colors ${
                sprite.id === editingTargetId
                  ? 'border-app-primary bg-white'
                  : 'border-transparent bg-white hover:border-gray-300'
              }`}
              aria-label={`Select sprite ${sprite.name}`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-events/20 text-lg">
                {sprite.visible ? '🐱' : '👻'}
              </div>
              <span className="mt-0.5 max-w-full truncate font-inter text-[10px] font-medium text-app-text">
                {sprite.name}
              </span>
            </button>
          ))}

          <button
            onClick={() => void addSprite()}
            className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white text-gray-400 transition-colors hover:border-app-primary hover:text-app-primary"
            aria-label="Add sprite"
          >
            <span className="text-2xl leading-none">+</span>
          </button>
        </div>
      </div>

      {editingTargetId && targets.length > 1 && (
        <div className="border-t border-app-border px-3 py-2">
          <button
            onClick={() => deleteSprite(editingTargetId)}
            className="text-xs text-app-stop hover:underline"
            aria-label="Delete sprite"
          >
            Delete sprite
          </button>
        </div>
      )}
    </section>
  )
}

function InfoChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-app-text">
      <span className="font-bold text-app-secondaryText">{label}</span>
      {value}
    </span>
  )
}
