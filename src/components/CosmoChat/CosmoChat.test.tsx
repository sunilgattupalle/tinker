import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CosmoChat } from './CosmoChat'

vi.mock('@/ai/client', () => ({
  askCosmo: vi.fn().mockResolvedValue({ explanation: 'Test response' }),
}))

vi.mock('@/ai/context', () => ({
  buildProjectContext: vi.fn().mockReturnValue({
    sprites: [],
    activeSpriteName: 'Sprite1',
    activeSpriteId: '',
  }),
}))

vi.mock('@/ai/proposalToBlocks', () => ({
  applyProposal: vi.fn(),
}))

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('CosmoChat', () => {
  it('renders the welcome message', () => {
    render(<CosmoChat />)
    expect(
      screen.getByText(/tell me what you want to build/i),
    ).toBeInTheDocument()
  })

  it('renders the Cosmo avatar', () => {
    render(<CosmoChat />)
    expect(screen.getAllByText('C').length).toBeGreaterThan(0)
  })

  it('renders a focusable chat input', () => {
    render(<CosmoChat />)
    const input = screen.getByLabelText('Chat input')
    expect(input).toBeInTheDocument()
    expect(input).not.toBeDisabled()
  })

  it('accepts text input', async () => {
    const user = userEvent.setup()
    render(<CosmoChat />)
    const input = screen.getByLabelText('Chat input')
    await user.type(input, 'make the cat dance')
    expect(input).toHaveValue('make the cat dance')
  })

  it('clears input on send', async () => {
    const user = userEvent.setup()
    render(<CosmoChat />)
    const input = screen.getByLabelText('Chat input')
    await user.type(input, 'hello')
    await user.keyboard('{Enter}')
    expect(input).toHaveValue('')
  })

  it('renders a send button', () => {
    render(<CosmoChat />)
    expect(screen.getByLabelText('Send message')).toBeInTheDocument()
  })

  it('has section label for accessibility', () => {
    render(<CosmoChat />)
    expect(screen.getByLabelText('Cosmo chat')).toBeInTheDocument()
  })
})
