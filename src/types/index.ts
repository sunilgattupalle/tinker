export interface UIBlockInput {
  value: unknown
  type: string
}

export interface UIBlockField {
  value: unknown
  options?: string[]
}

export interface UIBlock {
  id: string
  opcode: string
  category: string
  color: string
  label: string
  shape: 'stack' | 'hat' | 'cap' | 'reporter' | 'boolean'
  inputs: Record<string, UIBlockInput>
  fields: Record<string, UIBlockField>
  next: string | null
  parent: string | null
  topLevel: boolean
  x?: number
  y?: number
  children?: Record<string, string>
}

export interface UISprite {
  id: string
  name: string
  x: number
  y: number
  direction: number
  size: number
  visible: boolean
  costumeName: string
  costumeUrl?: string
  isStage: boolean
}

export interface ProposedBlock {
  opcode: string
  inputs?: Record<string, unknown>
  fields?: Record<string, unknown>
  next?: ProposedBlock
  children?: Record<string, ProposedBlock>
}

export interface ProposedBlockSet {
  blocks: ProposedBlock[]
  targetSprite: string
  action: 'add_script' | 'modify_script' | 'add_blocks'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'cosmo'
  content: string
  proposedBlocks?: ProposedBlockSet
  accepted?: boolean
  timestamp: number
}
