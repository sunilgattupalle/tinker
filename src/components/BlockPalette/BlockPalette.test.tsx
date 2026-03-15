import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlockPalette } from './BlockPalette'

describe('BlockPalette', () => {
  const categories = ['Motion', 'Looks', 'Sound', 'Events', 'Control', 'Sensing', 'Operators']

  it('renders all block categories', () => {
    render(<BlockPalette />)
    for (const name of categories) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it('renders category color dots', () => {
    const { container } = render(<BlockPalette />)
    const dots = container.querySelectorAll('span[style]')
    expect(dots.length).toBe(categories.length)
  })

  it('highlights the selected category on click', async () => {
    const user = userEvent.setup()
    render(<BlockPalette />)

    const motionBtn = screen.getByText('Motion').closest('button')!
    await user.click(motionBtn)
    expect(motionBtn).toHaveAttribute('aria-current', 'true')
  })

  it('has section label for accessibility', () => {
    render(<BlockPalette />)
    expect(screen.getByLabelText('Block palette')).toBeInTheDocument()
  })
})
