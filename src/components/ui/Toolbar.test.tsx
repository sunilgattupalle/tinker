import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toolbar } from './Toolbar'

vi.mock('@/scratch/setup', () => ({
  initializeScratchVM: () => ({
    runtime: { targets: [] },
    start: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    editingTarget: null,
    setEditingTarget: vi.fn(),
    postIOData: vi.fn(),
  }),
  loadDefaultProject: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/scratch/spriteAdapter', () => ({
  setSpriteVM: vi.fn(),
  addDefaultSprite: vi.fn().mockResolvedValue(undefined),
  deleteSprite: vi.fn(),
}))

describe('Toolbar', () => {
  it('renders green flag and stop buttons', () => {
    render(<Toolbar />)
    expect(screen.getByLabelText('Green flag')).toBeInTheDocument()
    expect(screen.getByLabelText('Stop')).toBeInTheDocument()
  })

  it('renders project name', () => {
    render(<Toolbar />)
    expect(screen.getByLabelText('Project name')).toBeInTheDocument()
  })

  it('allows editing the project name', async () => {
    const user = userEvent.setup()
    render(<Toolbar />)

    await user.click(screen.getByLabelText('Project name'))

    const input = screen.getByLabelText('Project name')
    expect(input.tagName).toBe('INPUT')

    await user.clear(input)
    await user.type(input, 'Cool Game')
    await user.keyboard('{Enter}')

    const nameButton = screen.getByLabelText('Project name')
    expect(nameButton.textContent).toBe('Cool Game')
  })

  it('renders the Cosmo avatar', () => {
    render(<Toolbar />)
    expect(screen.getByLabelText('Cosmo avatar')).toBeInTheDocument()
  })
})
