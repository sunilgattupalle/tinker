import type VirtualMachine from 'scratch-vm'
import type { ProjectContext, ScriptSummary } from './client'
import { opcodeRegistry } from '@/scratch/opcodes'

export function buildProjectContext(vm: VirtualMachine): ProjectContext {
  const targets = vm.runtime.targets.filter((t) => !t.isStage)
  const editing = vm.editingTarget

  const sprites = targets.map((t) => {
    const scriptIds = t.blocks.getScripts()
    const scripts: ScriptSummary[] = scriptIds.map((scriptId) => {
      const topBlock = t.blocks.getBlock(scriptId)
      let count = 0
      let currentId: string | null = scriptId
      while (currentId) {
        count++
        currentId = t.blocks.getNextBlock(currentId)
      }
      const info = opcodeRegistry.getByOpcode(topBlock?.opcode ?? '')
      return {
        topBlockOpcode: topBlock?.opcode ?? 'unknown',
        blockCount: count,
        description: info?.label ?? topBlock?.opcode ?? 'unknown block',
      }
    })

    return {
      name: t.sprite.name,
      id: t.id,
      scripts,
    }
  })

  return {
    sprites,
    activeSpriteName: editing?.sprite?.name ?? targets[0]?.sprite?.name ?? 'Sprite1',
    activeSpriteId: editing?.id ?? targets[0]?.id ?? '',
  }
}
