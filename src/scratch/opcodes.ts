export interface OpcodeInfo {
  opcode: string
  category: string
  label: string
  color: string
  shape: 'stack' | 'hat' | 'cap' | 'reporter' | 'boolean'
}

export const opcodeRegistry: OpcodeInfo[] = []
