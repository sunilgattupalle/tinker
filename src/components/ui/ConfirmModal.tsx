import { useRef, useEffect } from 'react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Load',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [open])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-full max-w-sm rounded-2xl border-none bg-white p-6 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      onClose={onCancel}
    >
      <h2 className="font-nunito text-lg font-bold text-app-text">{title}</h2>
      <p className="mt-2 font-inter text-sm text-app-secondaryText">{message}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2 font-inter text-sm font-medium text-app-secondaryText transition-colors hover:bg-gray-100"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg bg-app-primary px-4 py-2 font-inter text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
