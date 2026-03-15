import { render, screen } from '@testing-library/react'
import { SpriteStage } from './SpriteStage'

describe('SpriteStage', () => {
  it('renders a canvas element', () => {
    render(<SpriteStage />)
    const canvas = screen.getByLabelText('Stage canvas')
    expect(canvas).toBeInTheDocument()
    expect(canvas.tagName).toBe('CANVAS')
  })

  it('canvas has correct dimensions', () => {
    render(<SpriteStage />)
    const canvas = screen.getByLabelText('Stage canvas') as HTMLCanvasElement
    expect(canvas.width).toBe(480)
    expect(canvas.height).toBe(360)
  })

  it('renders the sprite list placeholder', () => {
    render(<SpriteStage />)
    expect(screen.getByText('Sprite1')).toBeInTheDocument()
  })

  it('has section label for accessibility', () => {
    render(<SpriteStage />)
    expect(screen.getByLabelText('Sprite stage')).toBeInTheDocument()
  })
})
