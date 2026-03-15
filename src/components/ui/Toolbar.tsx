import { useState, useRef, useEffect } from 'react'
import { useProjectStore } from '@/store/project'

export interface ToolbarProps {
  className?: string
}

export function Toolbar({ className = '' }: ToolbarProps) {
  const projectName = useProjectStore((s) => s.projectName)
  const setProjectName = useProjectStore((s) => s.setProjectName)
  const isRunning = useProjectStore((s) => s.isRunning)
  const greenFlag = useProjectStore((s) => s.greenFlag)
  const stopAll = useProjectStore((s) => s.stopAll)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(projectName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleNameSubmit = () => {
    const trimmed = editValue.trim()
    if (trimmed) {
      setProjectName(trimmed)
    } else {
      setEditValue(projectName)
    }
    setIsEditing(false)
  }

  return (
    <header
      className={`flex h-toolbar-h items-center border-b border-app-border bg-app-panel px-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={greenFlag}
          aria-label="Green flag"
          className="flex h-8 w-8 items-center justify-center rounded-button bg-app-success text-white transition-opacity hover:opacity-80"
        >
          <span className="text-sm">▶</span>
        </button>
        <button
          onClick={stopAll}
          aria-label="Stop"
          className="flex h-8 w-8 items-center justify-center rounded-button bg-app-stop text-white transition-opacity hover:opacity-80"
        >
          <span className="text-sm">■</span>
        </button>
        {isRunning && (
          <span className="ml-1 text-xs font-medium text-app-success">Running</span>
        )}
      </div>

      <div className="flex flex-1 justify-center">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit()
              if (e.key === 'Escape') {
                setEditValue(projectName)
                setIsEditing(false)
              }
            }}
            className="w-48 rounded-input border border-app-border bg-white px-2 py-1 text-center font-inter text-sm font-medium text-app-text outline-none focus:border-app-primary"
            aria-label="Project name"
          />
        ) : (
          <button
            onClick={() => {
              setEditValue(projectName)
              setIsEditing(true)
            }}
            className="rounded-input px-3 py-1 font-inter text-sm font-medium text-app-text hover:bg-gray-100"
            aria-label="Project name"
          >
            {projectName}
          </button>
        )}
      </div>

      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-app-cosmo text-sm font-bold text-white"
        aria-label="Cosmo avatar"
      >
        C
      </div>
    </header>
  )
}
