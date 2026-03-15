import type VirtualMachine from 'scratch-vm'

export async function validateSb3File(file: File): Promise<ArrayBuffer> {
  if (!file.name.endsWith('.sb3')) {
    throw new Error('This doesn\'t look like a Scratch project file (.sb3).')
  }

  const buffer = await file.arrayBuffer()
  const view = new Uint8Array(buffer)

  // .sb3 files are ZIP archives — check for PK magic bytes
  if (view.length < 4 || view[0] !== 0x50 || view[1] !== 0x4b) {
    throw new Error('This file doesn\'t look like a valid Scratch project.')
  }

  return buffer
}

export async function importProject(vm: VirtualMachine, file: File): Promise<void> {
  const buffer = await validateSb3File(file)
  await vm.loadProject(buffer)
}

export function setupDropZone(
  onFile: (file: File) => void,
): () => void {
  let overlayEl: HTMLDivElement | null = null

  const showOverlay = () => {
    if (overlayEl) return
    overlayEl = document.createElement('div')
    overlayEl.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-app-primary/10 backdrop-blur-sm'
    overlayEl.innerHTML = `
      <div class="rounded-2xl border-4 border-dashed border-app-primary bg-white/90 px-12 py-8 text-center shadow-2xl">
        <p class="text-2xl font-bold text-app-primary">Drop to open project</p>
        <p class="mt-2 text-sm text-app-secondaryText">Accepts .sb3 files</p>
      </div>
    `
    document.body.appendChild(overlayEl)
  }

  const hideOverlay = () => {
    if (overlayEl) {
      document.body.removeChild(overlayEl)
      overlayEl = null
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    const types = e.dataTransfer?.types ?? []
    if (types.includes('Files')) showOverlay()
  }

  const handleDragLeave = (e: DragEvent) => {
    if (e.relatedTarget === null) hideOverlay()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    hideOverlay()
    const file = e.dataTransfer?.files[0]
    if (file?.name.endsWith('.sb3')) onFile(file)
  }

  document.addEventListener('dragover', handleDragOver)
  document.addEventListener('dragleave', handleDragLeave)
  document.addEventListener('drop', handleDrop)

  return () => {
    document.removeEventListener('dragover', handleDragOver)
    document.removeEventListener('dragleave', handleDragLeave)
    document.removeEventListener('drop', handleDrop)
    hideOverlay()
  }
}
