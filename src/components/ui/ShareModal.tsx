import { useState, useEffect, useRef } from 'react'
import { useUIStore } from '@/store/ui'
import { useProjectStore } from '@/store/project'
import { exportProject } from '@/sharing/export'
import { encodeProjectToURL } from '@/sharing/urlShare'
import { generateThumbnail } from '@/sharing/thumbnail'

export function ShareModal() {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const vm = useProjectStore((s) => s.vm)
  const projectName = useProjectStore((s) => s.projectName)

  const [shareURL, setShareURL] = useState<string | null>(null)
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const isOpen = activeModal === 'share'

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
      if (vm) {
        encodeProjectToURL(vm).then(setShareURL).catch(() => setShareURL(null))
        const stageCanvas = document.querySelector<HTMLCanvasElement>('[aria-label="Stage canvas"]')
        if (stageCanvas) setThumbnailSrc(generateThumbnail(stageCanvas))
      }
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen, vm])

  const handleDownload = async () => {
    if (!vm) return
    setExporting(true)
    try {
      await exportProject(vm, projectName)
    } finally {
      setExporting(false)
    }
  }

  const handleCopy = async () => {
    if (!shareURL) return
    await navigator.clipboard.writeText(shareURL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-2xl border-none bg-white p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      onClose={closeModal}
      onClick={(e) => { if (e.target === dialogRef.current) closeModal() }}
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-nunito text-xl font-bold text-app-text">
            Share "{projectName}"
          </h2>
          <button
            onClick={closeModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-app-secondaryText transition-colors hover:bg-gray-100 hover:text-app-text"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {thumbnailSrc && (
          <div className="mb-4 overflow-hidden rounded-lg border border-app-border">
            <img src={thumbnailSrc} alt="Project preview" className="w-full" />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-inter text-sm font-semibold text-app-text">Download</h3>
            <button
              onClick={() => void handleDownload()}
              disabled={exporting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-app-primary py-3 font-inter text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exporting ? 'Exporting...' : 'Download .sb3 file'}
            </button>
            <p className="mt-1.5 text-center text-xs text-app-secondaryText">
              Opens in Tinker and Scratch!
            </p>
          </div>

          {shareURL ? (
            <div>
              <h3 className="mb-2 font-inter text-sm font-semibold text-app-text">Share via link</h3>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareURL}
                  className="min-w-0 flex-1 truncate rounded-lg border border-app-border bg-gray-50 px-3 py-2 font-mono text-xs text-app-secondaryText"
                />
                <button
                  onClick={() => void handleCopy()}
                  className={`shrink-0 rounded-lg px-4 py-2 font-inter text-xs font-semibold shadow-sm transition-all ${
                    copied
                      ? 'bg-app-success text-white'
                      : 'bg-white text-app-text hover:bg-gray-50'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-center text-xs text-app-secondaryText">
                This project is too big for a link. Download the .sb3 file instead.
              </p>
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
