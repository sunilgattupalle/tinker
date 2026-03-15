import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CosmoChat } from './CosmoChat'

describe('CosmoChat', () => {
  it('renders the welcome message', () => {
    render(<CosmoChat />)
    expect(
      screen.getByText(/Tell me what you want to build/),
    ).toBeInTheDocument()
  })

  it('renders the Cosmo avatar', () => {
    render(<CosmoChat />)
    expect(screen.getByLabelText('Cosmo avatar')).toBeInTheDocument()
  })

  it('renders a focusable chat input', () => {
    render(<CosmoChat />)
    const input = screen.getByLabelText('Chat input')
    expect(input).toBeInTheDocument()
    input.focus()
    expect(input).toHaveFocus()
  })

  it('accepts text input', async () => {
    const user = userEvent.setup()
    render(<CosmoChat />)
    const input = screen.getByLabelText('Chat input')
    await user.type(input, 'make the cat jump')
    expect(input).toHaveValue('make the cat jump')
  })

  it('clears input on send', async () => {
    const user = userEvent.setup()
    render(<CosmoChat />)
    const input = screen.getByLabelText('Chat input')
    await user.type(input, 'make the cat jump')
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
