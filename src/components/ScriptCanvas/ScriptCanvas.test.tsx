import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { ScriptCanvas } from './ScriptCanvas'

vi.mock('@/scratch/blockAdapter', () => ({
  changeBlockInput: vi.fn(),
  changeBlockField: vi.fn(),
  deleteBlock: vi.fn(),
  getBlocksForTarget: vi.fn().mockReturnValue([]),
  getScriptRoots: vi.fn().mockReturnValue([]),
}))

function renderWithDnd(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>)
}

describe('ScriptCanvas', () => {
  it('renders the empty state message when no blocks', () => {
    renderWithDnd(<ScriptCanvas />)
    expect(screen.getByText('Drag blocks here')).toBeInTheDocument()
  })

  it('has accessible section label', () => {
    renderWithDnd(<ScriptCanvas />)
    expect(screen.getByLabelText('Script canvas')).toBeInTheDocument()
  })

  it('shows cosmo help text', () => {
    renderWithDnd(<ScriptCanvas />)
    expect(screen.getByText(/ask Cosmo/i)).toBeInTheDocument()
  })
})
