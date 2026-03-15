import { render, screen } from '@testing-library/react'
import { App } from './App'

vi.mock('@/scratch/setup', () => ({
  initializeScratchVM: () => ({
    runtime: { targets: [] },
    start: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    editingTarget: null,
    setEditingTarget: vi.fn(),
    greenFlag: vi.fn(),
    stopAll: vi.fn(),
    saveProjectSb3: vi.fn().mockResolvedValue(new Blob()),
    loadProject: vi.fn().mockResolvedValue(undefined),
    attachRenderer: vi.fn(),
    attachStorage: vi.fn(),
    postIOData: vi.fn(),
  }),
  loadDefaultProject: vi.fn().mockResolvedValue(undefined),
  getVM: () => null,
}))

vi.mock('@/scratch/blockAdapter', () => ({
  setVM: vi.fn(),
  createBlock: vi.fn().mockReturnValue('mock-block-id'),
  connectBlocks: vi.fn(),
  disconnectBlock: vi.fn(),
  deleteBlock: vi.fn(),
  changeBlockInput: vi.fn(),
  changeBlockField: vi.fn(),
  moveBlock: vi.fn(),
  getBlocksForTarget: vi.fn().mockReturnValue([]),
  getScriptRoots: vi.fn().mockReturnValue([]),
  blockAdapter: {},
}))

vi.mock('@/scratch/spriteAdapter', () => ({
  setSpriteVM: vi.fn(),
  addDefaultSprite: vi.fn().mockResolvedValue(undefined),
  deleteSprite: vi.fn(),
  getTargets: vi.fn().mockReturnValue([]),
  getActiveTarget: vi.fn().mockReturnValue(null),
  setActiveTarget: vi.fn(),
  getSpriteInfo: vi.fn().mockReturnValue(null),
  spriteAdapter: {},
}))

vi.mock('@/sharing/import', () => ({
  setupDropZone: vi.fn().mockReturnValue(() => {}),
  importProject: vi.fn().mockResolvedValue(undefined),
  validateSb3File: vi.fn(),
}))

vi.mock('@/sharing/urlShare', () => ({
  getProjectFromCurrentURL: vi.fn().mockReturnValue(null),
  clearURLFragment: vi.fn(),
  encodeProjectToURL: vi.fn().mockResolvedValue(null),
  decodeProjectFromURL: vi.fn().mockReturnValue(null),
}))

describe('App', () => {
  it('renders welcome screen on first load', () => {
    render(<App />)
    expect(screen.getByText('What do you want to make?')).toBeInTheDocument()
  })
})
