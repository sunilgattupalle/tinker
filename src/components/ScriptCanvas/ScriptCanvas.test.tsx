import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { ScriptCanvas } from './ScriptCanvas'

function renderWithDnd(ui: React.ReactNode) {
  return render(<DndContext>{ui}</DndContext>)
}

describe('ScriptCanvas', () => {
  it('renders the empty state message when no blocks', () => {
    renderWithDnd(<ScriptCanvas />)
    expect(
      screen.getByText('Drag blocks here or ask Cosmo to help!'),
    ).toBeInTheDocument()
  })

  it('has section label for accessibility', () => {
    renderWithDnd(<ScriptCanvas />)
    expect(screen.getByLabelText('Script canvas')).toBeInTheDocument()
  })

  it('has a dot-grid background', () => {
    renderWithDnd(<ScriptCanvas />)
    const section = screen.getByLabelText('Script canvas')
    expect(section.style.backgroundImage).toContain('radial-gradient')
  })
})
