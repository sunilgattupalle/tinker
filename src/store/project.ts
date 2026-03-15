import { create } from 'zustand'
import type VirtualMachine from 'scratch-vm'
import type { UIBlock, UISprite } from '@/types'

export interface ProjectStore {
  targets: UISprite[]
  editingTargetId: string | null
  blocks: UIBlock[]
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
}

export const useProjectStore = create<ProjectStore>(() => ({
  targets: [],
  editingTargetId: null,
  blocks: [],
  isRunning: false,
  projectName: 'My Tinker Project',
  setEditingTarget: () => undefined,
  addSprite: async () => undefined,
  deleteSprite: () => undefined,
  greenFlag: () => undefined,
  stopAll: () => undefined,
  saveProject: async () => new Blob(),
  loadProject: async () => undefined,
  loadDefaultProject: async () => undefined,
  setProjectName: () => undefined,
  initializeVM: () => undefined,
}))
