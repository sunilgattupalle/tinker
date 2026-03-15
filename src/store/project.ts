import { create } from 'zustand'
import type VirtualMachine from 'scratch-vm'
import type { UIBlock, UISprite } from '@/types'
import { getBlocksForTarget, getScriptRoots } from '@/scratch/blockAdapter'

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
}

function extractTargets(vm: VirtualMachine): UISprite[] {
  return vm.runtime.targets
    .filter((t) => !t.isStage)
    .map((t) => ({
      id: t.id,
      name: t.sprite.name,
      x: t.x,
      y: t.y,
      direction: t.direction,
      size: t.size,
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

  addSprite: async () => undefined,
  deleteSprite: () => undefined,

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

  loadDefaultProject: async () => undefined,

  setProjectName: (name) => set({ projectName: name }),

  refreshBlocks: () => {
    const { editingTargetId } = get()
    if (!editingTargetId) return
    set({
      blocks: getBlocksForTarget(editingTargetId),
      scriptRoots: getScriptRoots(editingTargetId),
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

    // Set initial state
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
