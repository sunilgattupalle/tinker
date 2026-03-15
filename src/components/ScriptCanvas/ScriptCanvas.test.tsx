import { render, screen } from '@testing-library/react'
import { ScriptCanvas } from './ScriptCanvas'

describe('ScriptCanvas', () => {
  it('renders the empty state message', () => {
    render(<ScriptCanvas />)
    expect(
      screen.getByText('Drag blocks here or ask Cosmo to help!'),
    ).toBeInTheDocument()
  })

  it('has section label for accessibility', () => {
    render(<ScriptCanvas />)
    expect(screen.getByLabelText('Script canvas')).toBeInTheDocument()
  })

  it('has a dot-grid background', () => {
    render(<ScriptCanvas />)
    const section = screen.getByLabelText('Script canvas')
    expect(section.style.backgroundImage).toContain('radial-gradient')
  })
})
