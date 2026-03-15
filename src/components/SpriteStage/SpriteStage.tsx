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
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
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
      const y = -((e.clientY - rect.top) * scaleY - STAGE_HEIGHT / 2)
      vm.postIOData('mouse', { x, y, isDown, canvasWidth: STAGE_WIDTH, canvasHeight: STAGE_HEIGHT })
    },
    [vm],
  )

  return (
    <section
      className={`flex flex-col overflow-y-auto bg-white ${className}`}
      aria-label="Sprite stage"
    >
      <div className="flex items-center justify-center bg-gray-50 p-3">
        <div className="overflow-hidden rounded-lg shadow-md">
          <canvas
            ref={canvasRef}
            width={STAGE_WIDTH}
            height={STAGE_HEIGHT}
            className="block bg-white"
            style={{ width: '100%', maxWidth: STAGE_WIDTH, aspectRatio: `${STAGE_WIDTH}/${STAGE_HEIGHT}` }}
            aria-label="Stage canvas"
            onMouseDown={(e) => postMouseData(e, true)}
            onMouseUp={(e) => postMouseData(e, false)}
            onMouseMove={(e) => postMouseData(e, e.buttons > 0)}
          />
        </div>
      </div>

      {activeSprite && (
        <div className="flex items-center gap-2 border-y border-app-border bg-gray-50/50 px-4 py-1.5">
          {(['x', 'y', 'dir', 'size'] as const).map((key) => {
            const val = key === 'dir' ? activeSprite.direction : key === 'size' ? activeSprite.size : activeSprite[key]
            return (
              <span key={key} className="flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-mono text-[11px] text-app-text shadow-sm">
                <span className="font-semibold text-app-secondaryText">{key}</span>
                {val}
              </span>
            )
          })}
        </div>
      )}

      <div className="flex-1 px-4 py-3">
        <h3 className="mb-2 font-inter text-[11px] font-bold uppercase tracking-widest text-app-secondaryText">
          Sprites
        </h3>
        <div className="flex flex-wrap gap-2">
          {targets.map((sprite) => (
            <button
              key={sprite.id}
              onClick={() => setEditingTarget(sprite.id)}
              className={`group flex h-[72px] w-[72px] flex-col items-center justify-center rounded-xl border-2 transition-all ${
                sprite.id === editingTargetId
                  ? 'border-app-primary bg-app-primary/5 shadow-md'
                  : 'border-transparent bg-gray-50 shadow-sm hover:border-gray-300 hover:shadow-md'
              }`}
              aria-label={`Select sprite ${sprite.name}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-events/20 to-events/10 text-xl">
                {sprite.visible ? '🐱' : '👻'}
              </div>
              <span className="mt-1 max-w-[60px] truncate font-inter text-[10px] font-medium text-app-text">
                {sprite.name}
              </span>
            </button>
          ))}

          <button
            onClick={() => void addSprite()}
            className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-all hover:border-app-primary hover:text-app-primary hover:shadow-sm"
            aria-label="Add sprite"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="mt-0.5 text-[9px] font-medium">Add</span>
          </button>
        </div>
      </div>

      {editingTargetId && targets.length > 1 && (
        <div className="border-t border-app-border px-4 py-2">
          <button
            onClick={() => deleteSprite(editingTargetId)}
            className="text-[11px] text-app-stop transition-colors hover:underline"
            aria-label="Delete sprite"
          >
            Delete sprite
          </button>
        </div>
      )}
    </section>
  )
}
