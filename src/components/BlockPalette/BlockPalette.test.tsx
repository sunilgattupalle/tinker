import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndContext } from '@dnd-kit/core'
import { BlockPalette } from './BlockPalette'

function renderWithDnd(ui: React.ReactNode) {
  return render(<DndContext>{ui}</DndContext>)
}

describe('BlockPalette', () => {
  const categoryNames = ['Motion', 'Looks', 'Sound', 'Events', 'Control', 'Sensing', 'Operators']

  it('renders all block categories', () => {
    renderWithDnd(<BlockPalette />)
    for (const name of categoryNames) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it('renders category color dots', () => {
    const { container } = renderWithDnd(<BlockPalette />)
    const dots = container.querySelectorAll('span[style]')
    expect(dots.length).toBeGreaterThanOrEqual(categoryNames.length)
  })

  it('expands category to show blocks on click', async () => {
    const user = userEvent.setup()
    renderWithDnd(<BlockPalette />)

    await user.click(screen.getByText('Motion'))
    expect(screen.getByText('move')).toBeInTheDocument()
    expect(screen.getByText('steps')).toBeInTheDocument()
  })

  it('has a category with aria-expanded=true by default', () => {
    renderWithDnd(<BlockPalette />)
    const expanded = screen.getAllByRole('button', { expanded: true })
    expect(expanded.length).toBeGreaterThanOrEqual(1)
  })

  it('has section label for accessibility', () => {
    renderWithDnd(<BlockPalette />)
    expect(screen.getByLabelText('Block palette')).toBeInTheDocument()
  })

  it('highlights the selected category', async () => {
    const user = userEvent.setup()
    renderWithDnd(<BlockPalette />)

    const motionBtn = screen.getByText('Motion').closest('button')!
    await user.click(motionBtn)
    expect(motionBtn).toHaveAttribute('aria-current', 'true')
  })

  it('toggles categories open and closed', async () => {
    const user = userEvent.setup()
    renderWithDnd(<BlockPalette />)

    const controlBtn = screen.getByText('Control')
    // Open Control
    await user.click(controlBtn)
    expect(controlBtn.closest('button')).toHaveAttribute('aria-expanded', 'true')

    // Close Control
    await user.click(controlBtn)
    expect(controlBtn.closest('button')).toHaveAttribute('aria-expanded', 'false')
  })
})
