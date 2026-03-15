import type { ChatMessage, ProposedBlockSet } from '@/types'

export interface ScriptSummary {
  topBlockOpcode: string
  blockCount: number
  description: string
}

export interface ProjectContext {
  sprites: Array<{
    name: string
    id: string
    scripts: ScriptSummary[]
  }>
  activeSpriteName: string
  activeSpriteId: string
}

export interface CosmoRequest {
  userMessage: string
  projectContext: ProjectContext
  conversationHistory: ChatMessage[]
}

export interface CosmoResponse {
  explanation: string
  proposedBlocks: ProposedBlockSet
}

export async function askCosmo(request: CosmoRequest): Promise<CosmoResponse> {
  void request
  throw new Error('askCosmo is not implemented yet')
}
