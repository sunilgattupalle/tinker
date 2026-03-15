import type { ProposedBlockSet, ProposedBlock } from '@/types'
import { opcodeRegistry } from '@/scratch/opcodes'
import type { CosmoResponse } from './client'

function extractJSON(raw: string): string | null {
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()

  const braceMatch = raw.match(/\{[\s\S]*\}/)
  if (braceMatch) return braceMatch[0].trim()

  return null
}

function validateBlock(block: Record<string, unknown>): ProposedBlock | null {
  const opcode = block.opcode as string
  if (!opcode || !opcodeRegistry.isValidOpcode(opcode)) return null

  const result: ProposedBlock = { opcode }

  if (block.inputs && typeof block.inputs === 'object') {
    result.inputs = block.inputs as Record<string, unknown>
  }

  if (block.fields && typeof block.fields === 'object') {
    result.fields = block.fields as Record<string, unknown>
  }

  if (block.children && typeof block.children === 'object') {
    const children: Record<string, ProposedBlock> = {}
    for (const [key, val] of Object.entries(block.children as Record<string, unknown>)) {
      if (Array.isArray(val)) {
        const validChildren = val
          .map((child) => validateBlock(child as Record<string, unknown>))
          .filter((c): c is ProposedBlock => c !== null)
        if (validChildren.length > 0) {
          for (let i = 0; i < validChildren.length - 1; i++) {
            validChildren[i].next = validChildren[i + 1]
          }
          children[key] = validChildren[0]
        }
      }
    }
    if (Object.keys(children).length > 0) {
      result.children = children
    }
  }

  return result
}

export function parseCosmoResponse(raw: string): CosmoResponse {
  const jsonStr = extractJSON(raw)

  if (!jsonStr) {
    const cleanText = raw.replace(/```[\s\S]*?```/g, '').trim()
    return { explanation: cleanText || raw.trim() }
  }

  try {
    const parsed = JSON.parse(jsonStr)
    const explanation = (parsed.explanation as string) || 'Here are some blocks for you!'

    if (!Array.isArray(parsed.blocks) || parsed.blocks.length === 0) {
      return { explanation }
    }

    const validBlocks = parsed.blocks
      .map((b: Record<string, unknown>) => validateBlock(b))
      .filter((b: ProposedBlock | null): b is ProposedBlock => b !== null)

    if (validBlocks.length === 0) {
      return { explanation: `${explanation}\n\n(I suggested some blocks but they weren't quite right — try asking differently!)` }
    }

    const proposedBlocks: ProposedBlockSet = {
      blocks: validBlocks,
      targetSprite: (parsed.targetSprite as string) || 'Sprite1',
      action: (['add_script', 'modify_script', 'add_blocks'].includes(parsed.action)
        ? parsed.action
        : 'add_script') as ProposedBlockSet['action'],
    }

    return { explanation, proposedBlocks }
  } catch {
    const cleanText = raw.replace(/```[\s\S]*?```/g, '').trim()
    return { explanation: cleanText || "I tried to suggest blocks but got confused. Ask me again! 🤔" }
  }
}
