import type VirtualMachine from 'scratch-vm'
import type { UIBlock } from '@/types'
import { opcodeRegistry } from './opcodes'

export interface BlockCreateOptions {
  opcode: string
  inputs?: Record<string, unknown>
  fields?: Record<string, unknown>
  x?: number
  y?: number
}

let vm: VirtualMachine | null = null

export function setVM(vmInstance: VirtualMachine) {
  vm = vmInstance
}

function getVM(): VirtualMachine {
  if (!vm) throw new Error('VM not initialized. Call setVM() first.')
  return vm
}

function generateBlockId(): string {
  return `block_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
}

/**
 * scratch-vm expects Blockly-style event objects dispatched via vm.blockListener().
 * We construct these events to manipulate blocks in the VM's workspace.
 *
 * scratch-vm's internal block format uses arrays for inputs:
 *   inputs: { STEPS: [1, [4, "10"]] }
 *   - [1, [type, value]] for literal (shadow) inputs
 *   - [3, shadowId, [type, value]] for inputs with a reporter plugged in
 *
 * Input type codes: 4 = number, 10 = string
 */

function makeShadowId(): string {
  return `shadow_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
}

function buildVMInputs(
  opcode: string,
  userInputs?: Record<string, unknown>,
): { inputs: Record<string, unknown[]>; shadowBlocks: Array<{ id: string; opcode: string; fields: Record<string, unknown[]> }> } {
  const info = opcodeRegistry.getByOpcode(opcode)
  if (!info) return { inputs: {}, shadowBlocks: [] }

  const inputs: Record<string, unknown[]> = {}
  const shadowBlocks: Array<{ id: string; opcode: string; fields: Record<string, unknown[]> }> = []

  for (const inputDef of info.inputs) {
    if (inputDef.type === 'block') continue
    const val = userInputs?.[inputDef.name] ?? inputDef.defaultValue
    const shadowId = makeShadowId()
    const shadowOpcode = inputDef.type === 'string' ? 'text' : 'math_number'
    const fieldName = inputDef.type === 'string' ? 'TEXT' : 'NUM'

    inputs[inputDef.name] = [1, shadowId]
    shadowBlocks.push({
      id: shadowId,
      opcode: shadowOpcode,
      fields: { [fieldName]: [String(val), null] },
    })
  }

  return { inputs, shadowBlocks }
}

function buildVMFields(
  opcode: string,
  userFields?: Record<string, unknown>,
): Record<string, unknown[]> {
  const info = opcodeRegistry.getByOpcode(opcode)
  if (!info) return {}

  const fields: Record<string, unknown[]> = {}
  for (const fieldDef of info.fields) {
    const val = userFields?.[fieldDef.name] ?? fieldDef.defaultValue
    fields[fieldDef.name] = [String(val), null]
  }
  return fields
}

export function createBlock(targetId: string, options: BlockCreateOptions): string {
  const v = getVM()
  const blockId = generateBlockId()
  const { inputs, shadowBlocks } = buildVMInputs(options.opcode, options.inputs)
  const fields = buildVMFields(options.opcode, options.fields)
  const info = opcodeRegistry.getByOpcode(options.opcode)

  const event = {
    type: 'create',
    blockId,
    xml: {
      outerHTML: `<block type="${options.opcode}" id="${blockId}" x="${options.x ?? 50}" y="${options.y ?? 50}"></block>`,
      getAttribute: (name: string) => {
        if (name === 'type') return options.opcode
        if (name === 'id') return blockId
        return null
      },
    },
    json: {
      id: blockId,
      opcode: options.opcode,
      next: null,
      parent: null,
      inputs,
      fields,
      shadow: false,
      topLevel: true,
      x: options.x ?? 50,
      y: options.y ?? 50,
      ...(info?.hasSubstack ? { inputs: { ...inputs, SUBSTACK: [2, null] } } : {}),
    },
    ids: [blockId, ...shadowBlocks.map((s) => s.id)],
    targetId,
  }

  // For scratch-vm, we dispatch a create event with the full block JSON
  const blocksPayload: Record<string, unknown> = {
    [blockId]: event.json,
  }

  for (const shadow of shadowBlocks) {
    blocksPayload[shadow.id] = {
      id: shadow.id,
      opcode: shadow.opcode,
      next: null,
      parent: blockId,
      inputs: {},
      fields: shadow.fields,
      shadow: true,
      topLevel: false,
    }
  }

  // Use the JSON-based create event that scratch-vm supports
  v.blockListener({
    type: 'create',
    json: blocksPayload,
  })

  return blockId
}

export function connectBlocks(blockId: string, parentId: string, inputName?: string): void {
  const v = getVM()

  if (inputName) {
    v.blockListener({
      type: 'move',
      id: blockId,
      newParent: parentId,
      newInput: inputName,
    })
  } else {
    v.blockListener({
      type: 'move',
      id: blockId,
      newParent: parentId,
      newInput: 'next',
    })
  }
}

export function disconnectBlock(blockId: string): void {
  const v = getVM()
  v.blockListener({
    type: 'move',
    id: blockId,
    oldParent: undefined,
    newParent: undefined,
    newCoordinate: { x: 0, y: 0 },
  })
}

export function deleteBlock(targetId: string, blockId: string): void {
  const v = getVM()
  void targetId

  // Delete in reverse order: children first, then the block itself
  const target = v.editingTarget
  if (!target) return

  const block = target.blocks._blocks[blockId]
  if (!block) return

  // Delete child blocks (next chain)
  if (block.next) {
    deleteBlock(targetId, block.next)
  }

  // Delete substack children
  for (const [key, val] of Object.entries(block.inputs)) {
    if (key.startsWith('SUBSTACK') && Array.isArray(val) && val[1]) {
      deleteBlock(targetId, val[1] as string)
    }
  }

  // Delete shadow blocks
  for (const val of Object.values(block.inputs)) {
    if (Array.isArray(val)) {
      const shadowId = val[1] as string
      if (shadowId && target.blocks._blocks[shadowId]?.shadow) {
        v.blockListener({ type: 'delete', blockId: shadowId, ids: [shadowId] })
      }
    }
  }

  v.blockListener({ type: 'delete', blockId, ids: [blockId] })
}

export function changeBlockInput(blockId: string, inputName: string, value: unknown): void {
  const v = getVM()
  const target = v.editingTarget
  if (!target) return

  const block = target.blocks._blocks[blockId]
  if (!block) return

  // Find the shadow block for this input
  const inputArr = block.inputs[inputName]
  if (!inputArr || !Array.isArray(inputArr)) return

  const shadowId = inputArr[1] as string
  if (!shadowId) return

  const shadow = target.blocks._blocks[shadowId]
  if (!shadow) return

  // Determine the field name in the shadow block
  const fieldName = Object.keys(shadow.fields)[0]
  if (!fieldName) return

  v.blockListener({
    type: 'change',
    blockId: shadowId,
    element: 'field',
    name: fieldName,
    value: String(value),
  })
}

export function changeBlockField(blockId: string, fieldName: string, value: unknown): void {
  const v = getVM()
  v.blockListener({
    type: 'change',
    blockId,
    element: 'field',
    name: fieldName,
    value: String(value),
  })
}

export function moveBlock(blockId: string, x: number, y: number): void {
  const v = getVM()
  v.blockListener({
    type: 'move',
    id: blockId,
    newCoordinate: { x, y },
  })
}

export function getBlocksForTarget(targetId: string): UIBlock[] {
  const v = getVM()
  const target = v.runtime.targets.find((t) => t.id === targetId)
  if (!target) return []

  const blocks: UIBlock[] = []
  const rawBlocks = target.blocks._blocks

  for (const [id, raw] of Object.entries(rawBlocks)) {
    if (raw.shadow) continue

    const info = opcodeRegistry.getByOpcode(raw.opcode)
    if (!info) continue

    const uiInputs: Record<string, { value: unknown; type: string }> = {}
    for (const [inputName, inputArr] of Object.entries(raw.inputs)) {
      if (inputName.startsWith('SUBSTACK')) continue
      if (!Array.isArray(inputArr)) continue

      const shadowId = inputArr[1] as string
      if (shadowId && rawBlocks[shadowId]) {
        const shadow = rawBlocks[shadowId]
        const fieldName = Object.keys(shadow.fields)[0]
        const fieldVal = fieldName ? shadow.fields[fieldName] : undefined
        uiInputs[inputName] = {
          value: fieldVal ? (fieldVal as unknown[])[0] : '',
          type: shadow.opcode === 'text' ? 'string' : 'number',
        }
      }
    }

    const uiFields: Record<string, { value: unknown; options?: string[] }> = {}
    for (const [fieldName, fieldArr] of Object.entries(raw.fields)) {
      const fieldInfo = info.fields.find((f) => f.name === fieldName)
      uiFields[fieldName] = {
        value: (fieldArr as unknown[])[0],
        options: fieldInfo?.options,
      }
    }

    const children: Record<string, string> = {}
    for (const [inputName, inputArr] of Object.entries(raw.inputs)) {
      if (inputName.startsWith('SUBSTACK') && Array.isArray(inputArr) && inputArr[1]) {
        children[inputName] = inputArr[1] as string
      }
    }

    blocks.push({
      id,
      opcode: raw.opcode,
      category: info.category,
      color: info.color,
      label: info.label,
      shape: info.shape,
      inputs: uiInputs,
      fields: uiFields,
      next: raw.next,
      parent: raw.parent,
      topLevel: raw.topLevel,
      x: raw.x,
      y: raw.y,
      children: Object.keys(children).length > 0 ? children : undefined,
    })
  }

  return blocks
}

export function getScriptRoots(targetId: string): string[] {
  const v = getVM()
  const target = v.runtime.targets.find((t) => t.id === targetId)
  if (!target) return []
  return target.blocks.getScripts()
}

export const blockAdapter = {
  createBlock,
  connectBlocks,
  disconnectBlock,
  deleteBlock,
  changeBlockInput,
  changeBlockField,
  moveBlock,
  getBlocksForTarget,
  getScriptRoots,
}
