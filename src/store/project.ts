import { create } from 'zustand'
import type VirtualMachine from 'scratch-vm'
import type { UIBlock, UISprite } from '@/types'
import { getBlocksForTarget, getScriptRoots } from '@/scratch/blockAdapter'
import { initializeScratchVM, loadDefaultProject } from '@/scratch/setup'
import { setSpriteVM, addDefaultSprite, deleteSprite as deleteSpriteAdapter } from '@/scratch/spriteAdapter'

export interface ProjectStore {
  vm: VirtualMachine | null
  targets: UISprite[]
  editingTargetId: string | null
  blocks: UIBlock[]
  scriptRoots: string[]
  isRunning: boolean
  projectName: string
  setEditingTarget: (targetId: string) => void
  addSprite: () => Promise<void>
  deleteSprite: (targetId: string) => void
  greenFlag: () => void
  stopAll: () => void
  saveProject: () => Promise<Blob>
  loadProject: (data: ArrayBuffer) => Promise<void>
  loadDefaultProject: () => Promise<void>
  setProjectName: (name: string) => void
  initializeVM: (vm: VirtualMachine) => void
  refreshBlocks: () => void
  canvasSetup: (canvas: HTMLCanvasElement) => void
}

function extractTargets(vm: VirtualMachine): UISprite[] {
  return vm.runtime.targets
    .filter((t) => !t.isStage)
    .map((t) => ({
      id: t.id,
      name: t.sprite.name,
      x: Math.round(t.x),
      y: Math.round(t.y),
      direction: Math.round(t.direction),
      size: Math.round(t.size),
      visible: t.visible,
      costumeName: t.sprite.costumes[t.currentCostume]?.name ?? '',
      isStage: t.isStage,
    }))
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  vm: null,
  targets: [],
  editingTargetId: null,
  blocks: [],
  scriptRoots: [],
  isRunning: false,
  projectName: 'My Tinker Project',

  setEditingTarget: (targetId) => {
    const { vm } = get()
    if (!vm) return
    vm.setEditingTarget(targetId)
    set({
      editingTargetId: targetId,
      blocks: getBlocksForTarget(targetId),
      scriptRoots: getScriptRoots(targetId),
    })
  },

  addSprite: async () => {
    try {
      await addDefaultSprite()
    } catch {
      // scratch-vm may throw if storage not ready
    }
  },

  deleteSprite: (targetId) => {
    const { vm } = get()
    if (!vm) return
    try {
      deleteSpriteAdapter(targetId)
    } catch {
      // cannot delete last sprite or stage
    }
  },

  greenFlag: () => {
    const { vm } = get()
    if (!vm) return
    vm.greenFlag()
    set({ isRunning: true })
  },

  stopAll: () => {
    const { vm } = get()
    if (!vm) return
    vm.stopAll()
    set({ isRunning: false })
  },

  saveProject: async () => {
    const { vm } = get()
    if (!vm) return new Blob()
    return vm.saveProjectSb3()
  },

  loadProject: async (data) => {
    const { vm } = get()
    if (!vm) return
    await vm.loadProject(data)
  },

  loadDefaultProject: async () => {
    const { vm } = get()
    if (!vm) return
    await loadDefaultProject(vm)
  },

  setProjectName: (name) => set({ projectName: name }),

  refreshBlocks: () => {
    const { editingTargetId } = get()
    if (!editingTargetId) return
    set({
      blocks: getBlocksForTarget(editingTargetId),
      scriptRoots: getScriptRoots(editingTargetId),
    })
  },

  canvasSetup: (canvas: HTMLCanvasElement) => {
    const existing = get().vm
    if (existing) return

    const vm = initializeScratchVM(canvas)
    setSpriteVM(vm)
    vm.start()
    get().initializeVM(vm)

    loadDefaultProject(vm).catch(() => {
      // default project load failed — VM will still work with empty project
    })
  },

  initializeVM: (vmInstance) => {
    set({ vm: vmInstance })

    vmInstance.on('targetsUpdate', () => {
      const targets = extractTargets(vmInstance)
      const editingId = vmInstance.editingTarget?.id ?? null
      set({
        targets,
        editingTargetId: editingId,
      })
    })

    vmInstance.on('workspaceUpdate', () => {
      const editingId = vmInstance.editingTarget?.id
      if (editingId) {
        set({
          blocks: getBlocksForTarget(editingId),
          scriptRoots: getScriptRoots(editingId),
        })
      }
    })

    vmInstance.on('PROJECT_RUN_START', () => set({ isRunning: true }))
    vmInstance.on('PROJECT_RUN_STOP', () => set({ isRunning: false }))

    const targets = extractTargets(vmInstance)
    const editingId = vmInstance.editingTarget?.id ?? targets[0]?.id ?? null
    if (editingId && vmInstance.editingTarget?.id !== editingId) {
      vmInstance.setEditingTarget(editingId)
    }
    set({
      targets,
      editingTargetId: editingId,
      blocks: editingId ? getBlocksForTarget(editingId) : [],
      scriptRoots: editingId ? getScriptRoots(editingId) : [],
    })
  },
}))
