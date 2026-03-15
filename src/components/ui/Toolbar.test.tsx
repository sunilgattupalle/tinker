import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toolbar } from './Toolbar'

describe('Toolbar', () => {
  it('renders green flag and stop buttons', () => {
    render(<Toolbar />)
    expect(screen.getByLabelText('Green flag')).toBeInTheDocument()
    expect(screen.getByLabelText('Stop')).toBeInTheDocument()
  })

  it('renders project name', () => {
    render(<Toolbar />)
    expect(screen.getByText('My Tinker Project')).toBeInTheDocument()
  })

  it('allows editing the project name', async () => {
    const user = userEvent.setup()
    render(<Toolbar />)

    await user.click(screen.getByLabelText('Edit project name'))

    const input = screen.getByLabelText('Project name')
    expect(input).toHaveFocus()
    await user.clear(input)
    await user.type(input, 'Cool Game')
    await user.keyboard('{Enter}')
    expect(screen.getByText('Cool Game')).toBeInTheDocument()
  })

  it('renders share button', () => {
    render(<Toolbar />)
    expect(screen.getByLabelText('Share project')).toBeInTheDocument()
  })

  it('renders the Cosmo avatar', () => {
    render(<Toolbar />)
    expect(screen.getByText('C')).toBeInTheDocument()
  })
})
