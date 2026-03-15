import type { ProposedBlock, ProposedBlockSet } from '@/types'
import { createBlock, connectBlocks } from '@/scratch/blockAdapter'

function placeBlock(
  targetId: string,
  proposed: ProposedBlock,
  x: number,
  y: number,
): string {
  const blockId = createBlock(targetId, {
    opcode: proposed.opcode,
    inputs: proposed.inputs,
    fields: proposed.fields,
    x,
    y,
  })

  if (proposed.children) {
    for (const [substackKey, firstChild] of Object.entries(proposed.children)) {
      let current: ProposedBlock | undefined = firstChild
      let prevChildId: string | null = null
      while (current) {
        const childId = placeBlock(targetId, current, 0, 0)
        if (!prevChildId) {
          connectBlocks(childId, blockId, substackKey)
        } else {
          connectBlocks(childId, prevChildId)
        }
        prevChildId = childId
        current = current.next
      }
    }
  }

  return blockId
}

export function applyProposal(proposal: ProposedBlockSet, targetId: string): void {
  const startX = 80 + Math.round(Math.random() * 100)
  const startY = 60 + Math.round(Math.random() * 100)

  let prevBlockId: string | null = null

  for (const proposed of proposal.blocks) {
    const blockId = placeBlock(
      targetId,
      proposed,
      prevBlockId ? 0 : startX,
      prevBlockId ? 0 : startY,
    )

    if (prevBlockId) {
      connectBlocks(blockId, prevBlockId)
    }

    prevBlockId = blockId
  }
}
