import { useState, useRef, useEffect } from 'react'
import { useProjectStore } from '@/store/project'
import { useUIStore } from '@/store/ui'

export function Toolbar() {
  const projectName = useProjectStore((s) => s.projectName)
  const setProjectName = useProjectStore((s) => s.setProjectName)
  const isRunning = useProjectStore((s) => s.isRunning)
  const greenFlag = useProjectStore((s) => s.greenFlag)
  const stopAll = useProjectStore((s) => s.stopAll)
  const openModal = useUIStore((s) => s.openModal)

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
    if (trimmed) setProjectName(trimmed)
    else setEditValue(projectName)
    setIsEditing(false)
  }

  return (
    <header className="flex h-toolbar-h items-center gap-3 border-b border-app-border bg-white px-4 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-app-primary to-indigo-500 text-sm font-bold text-white shadow-sm">
          T
        </div>
        <span className="hidden font-nunito text-lg font-bold text-app-text sm:block">Tinker</span>
      </div>

      <div className="mx-2 h-6 w-px bg-app-border" />

      {/* Run controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={greenFlag}
          aria-label="Green flag"
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
            isRunning
              ? 'bg-app-success/20 text-app-success ring-2 ring-app-success/30'
              : 'bg-app-success text-white shadow-sm hover:shadow-md hover:brightness-110'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>
        <button
          onClick={stopAll}
          disabled={!isRunning}
          aria-label="Stop"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-app-stop text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        </button>
      </div>

      {/* Project name */}
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
            className="w-56 rounded-lg border border-app-primary/30 bg-white px-3 py-1.5 text-center font-inter text-sm font-medium text-app-text outline-none ring-2 ring-app-primary/20"
            aria-label="Project name"
          />
        ) : (
          <button
            onClick={() => {
              setEditValue(projectName)
              setIsEditing(true)
            }}
            className="rounded-lg px-3 py-1.5 font-inter text-sm font-medium text-app-text transition-colors hover:bg-gray-100"
            aria-label="Edit project name"
          >
            {projectName}
          </button>
        )}
      </div>

      {/* Share + Cosmo avatar */}
      <button
        onClick={() => openModal('share')}
        className="flex items-center gap-1.5 rounded-lg border border-app-border bg-white px-3 py-1.5 font-inter text-sm font-medium text-app-text shadow-sm transition-all hover:border-app-primary hover:text-app-primary hover:shadow-md"
        aria-label="Share project"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        <span className="hidden sm:inline">Share</span>
      </button>

      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-app-cosmo to-cyan-600 text-xs font-bold text-white shadow-sm">
        C
      </div>
    </header>
  )
}
