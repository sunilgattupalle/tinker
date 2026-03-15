export interface BlockCreateOptions {
  opcode: string
  inputs?: Record<string, unknown>
  fields?: Record<string, unknown>
  x?: number
  y?: number
}

export interface BlockAdapter {
  createBlock: (targetId: string, options: BlockCreateOptions) => string
}

export const blockAdapter: BlockAdapter = {
  createBlock: (_targetId, _options) => {
    throw new Error('blockAdapter.createBlock is not implemented yet')
  },
}
