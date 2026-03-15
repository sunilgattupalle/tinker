export interface OpcodeInput {
  name: string
  type: 'number' | 'string' | 'block'
  defaultValue: unknown
}

export interface OpcodeField {
  name: string
  options?: string[]
  defaultValue: unknown
}

export interface OpcodeInfo {
  opcode: string
  category: string
  label: string
  color: string
  shape: 'stack' | 'hat' | 'cap' | 'reporter' | 'boolean'
  inputs: OpcodeInput[]
  fields: OpcodeField[]
  hasSubstack?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  motion: '#4C97FF',
  looks: '#9966FF',
  sound: '#CF63CF',
  events: '#FFBF00',
  control: '#FFAB19',
  sensing: '#5CB1D6',
  operators: '#59C059',
  variables: '#FF8C1A',
}

const OPCODE_DEFS: OpcodeInfo[] = [
  // --- Motion ---
  {
    opcode: 'motion_movesteps',
    category: 'motion',
    label: 'move {STEPS} steps',
    color: CATEGORY_COLORS.motion,
    shape: 'stack',
    inputs: [{ name: 'STEPS', type: 'number', defaultValue: 10 }],
    fields: [],
  },
  {
    opcode: 'motion_turnright',
    category: 'motion',
    label: 'turn ↻ {DEGREES} degrees',
    color: CATEGORY_COLORS.motion,
    shape: 'stack',
    inputs: [{ name: 'DEGREES', type: 'number', defaultValue: 15 }],
    fields: [],
  },
  {
    opcode: 'motion_turnleft',
    category: 'motion',
    label: 'turn ↺ {DEGREES} degrees',
    color: CATEGORY_COLORS.motion,
    shape: 'stack',
    inputs: [{ name: 'DEGREES', type: 'number', defaultValue: 15 }],
    fields: [],
  },
  {
    opcode: 'motion_gotoxy',
    category: 'motion',
    label: 'go to x: {X} y: {Y}',
    color: CATEGORY_COLORS.motion,
    shape: 'stack',
    inputs: [
      { name: 'X', type: 'number', defaultValue: 0 },
      { name: 'Y', type: 'number', defaultValue: 0 },
    ],
    fields: [],
  },
  {
    opcode: 'motion_setx',
    category: 'motion',
    label: 'set x to {X}',
    color: CATEGORY_COLORS.motion,
    shape: 'stack',
    inputs: [{ name: 'X', type: 'number', defaultValue: 0 }],
    fields: [],
  },
  {
    opcode: 'motion_sety',
    category: 'motion',
    label: 'set y to {Y}',
    color: CATEGORY_COLORS.motion,
    shape: 'stack',
    inputs: [{ name: 'Y', type: 'number', defaultValue: 0 }],
    fields: [],
  },

  // --- Looks ---
  {
    opcode: 'looks_say',
    category: 'looks',
    label: 'say {MESSAGE}',
    color: CATEGORY_COLORS.looks,
    shape: 'stack',
    inputs: [{ name: 'MESSAGE', type: 'string', defaultValue: 'Hello!' }],
    fields: [],
  },
  {
    opcode: 'looks_sayforsecs',
    category: 'looks',
    label: 'say {MESSAGE} for {SECS} seconds',
    color: CATEGORY_COLORS.looks,
    shape: 'stack',
    inputs: [
      { name: 'MESSAGE', type: 'string', defaultValue: 'Hello!' },
      { name: 'SECS', type: 'number', defaultValue: 2 },
    ],
    fields: [],
  },
  {
    opcode: 'looks_show',
    category: 'looks',
    label: 'show',
    color: CATEGORY_COLORS.looks,
    shape: 'stack',
    inputs: [],
    fields: [],
  },
  {
    opcode: 'looks_hide',
    category: 'looks',
    label: 'hide',
    color: CATEGORY_COLORS.looks,
    shape: 'stack',
    inputs: [],
    fields: [],
  },
  {
    opcode: 'looks_setsizeto',
    category: 'looks',
    label: 'set size to {SIZE}%',
    color: CATEGORY_COLORS.looks,
    shape: 'stack',
    inputs: [{ name: 'SIZE', type: 'number', defaultValue: 100 }],
    fields: [],
  },

  // --- Events (hat blocks) ---
  {
    opcode: 'event_whenflagclicked',
    category: 'events',
    label: 'when 🟢 clicked',
    color: CATEGORY_COLORS.events,
    shape: 'hat',
    inputs: [],
    fields: [],
  },
  {
    opcode: 'event_whenkeypressed',
    category: 'events',
    label: 'when {KEY_OPTION} key pressed',
    color: CATEGORY_COLORS.events,
    shape: 'hat',
    inputs: [],
    fields: [
      {
        name: 'KEY_OPTION',
        options: ['space', 'up arrow', 'down arrow', 'left arrow', 'right arrow', 'any', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        defaultValue: 'space',
      },
    ],
  },
  {
    opcode: 'event_whenthisspriteclicked',
    category: 'events',
    label: 'when this sprite clicked',
    color: CATEGORY_COLORS.events,
    shape: 'hat',
    inputs: [],
    fields: [],
  },

  // --- Control ---
  {
    opcode: 'control_wait',
    category: 'control',
    label: 'wait {DURATION} seconds',
    color: CATEGORY_COLORS.control,
    shape: 'stack',
    inputs: [{ name: 'DURATION', type: 'number', defaultValue: 1 }],
    fields: [],
  },
  {
    opcode: 'control_repeat',
    category: 'control',
    label: 'repeat {TIMES}',
    color: CATEGORY_COLORS.control,
    shape: 'stack',
    inputs: [{ name: 'TIMES', type: 'number', defaultValue: 10 }],
    fields: [],
    hasSubstack: true,
  },
  {
    opcode: 'control_forever',
    category: 'control',
    label: 'forever',
    color: CATEGORY_COLORS.control,
    shape: 'stack',
    inputs: [],
    fields: [],
    hasSubstack: true,
  },
  {
    opcode: 'control_if',
    category: 'control',
    label: 'if {CONDITION} then',
    color: CATEGORY_COLORS.control,
    shape: 'stack',
    inputs: [{ name: 'CONDITION', type: 'block', defaultValue: null }],
    fields: [],
    hasSubstack: true,
  },
  {
    opcode: 'control_stop',
    category: 'control',
    label: 'stop [all v]',
    color: CATEGORY_COLORS.control,
    shape: 'cap',
    inputs: [],
    fields: [
      {
        name: 'STOP_OPTION',
        options: ['all', 'this script', 'other scripts in sprite'],
        defaultValue: 'all',
      },
    ],
  },

  // --- Sensing ---
  {
    opcode: 'sensing_keypressed',
    category: 'sensing',
    label: 'key {KEY_OPTION} pressed?',
    color: CATEGORY_COLORS.sensing,
    shape: 'boolean',
    inputs: [],
    fields: [
      {
        name: 'KEY_OPTION',
        options: ['space', 'up arrow', 'down arrow', 'left arrow', 'right arrow', 'any', 'a', 'b', 'c'],
        defaultValue: 'space',
      },
    ],
  },

  // --- Operators ---
  {
    opcode: 'operator_random',
    category: 'operators',
    label: 'pick random {FROM} to {TO}',
    color: CATEGORY_COLORS.operators,
    shape: 'reporter',
    inputs: [
      { name: 'FROM', type: 'number', defaultValue: 1 },
      { name: 'TO', type: 'number', defaultValue: 10 },
    ],
    fields: [],
  },
  {
    opcode: 'operator_add',
    category: 'operators',
    label: '{NUM1} + {NUM2}',
    color: CATEGORY_COLORS.operators,
    shape: 'reporter',
    inputs: [
      { name: 'NUM1', type: 'number', defaultValue: 0 },
      { name: 'NUM2', type: 'number', defaultValue: 0 },
    ],
    fields: [],
  },
]

const opcodeMap = new Map<string, OpcodeInfo>()
for (const info of OPCODE_DEFS) {
  opcodeMap.set(info.opcode, info)
}

export const CATEGORIES = [
  { id: 'motion', name: 'Motion', color: CATEGORY_COLORS.motion },
  { id: 'looks', name: 'Looks', color: CATEGORY_COLORS.looks },
  { id: 'sound', name: 'Sound', color: CATEGORY_COLORS.sound },
  { id: 'events', name: 'Events', color: CATEGORY_COLORS.events },
  { id: 'control', name: 'Control', color: CATEGORY_COLORS.control },
  { id: 'sensing', name: 'Sensing', color: CATEGORY_COLORS.sensing },
  { id: 'operators', name: 'Operators', color: CATEGORY_COLORS.operators },
] as const

export interface OpcodeRegistry {
  getAll(): OpcodeInfo[]
  getByCategory(category: string): OpcodeInfo[]
  getByOpcode(opcode: string): OpcodeInfo | undefined
  getCategories(): string[]
  isValidOpcode(opcode: string): boolean
}

export const opcodeRegistry: OpcodeRegistry = {
  getAll: () => OPCODE_DEFS,
  getByCategory: (category) => OPCODE_DEFS.filter((o) => o.category === category),
  getByOpcode: (opcode) => opcodeMap.get(opcode),
  getCategories: () => CATEGORIES.map((c) => c.id),
  isValidOpcode: (opcode) => opcodeMap.has(opcode),
}
