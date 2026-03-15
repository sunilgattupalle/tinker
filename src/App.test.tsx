import { render, screen } from '@testing-library/react'
import { App } from './App'

vi.mock('@/scratch/setup', () => ({
  initializeScratchVM: () => ({
    runtime: { targets: [] },
    start: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    editingTarget: null,
    setEditingTarget: vi.fn(),
  }),
}))

describe('App', () => {
  it('renders all five layout areas', () => {
    render(<App />)

    expect(screen.getByLabelText('Green flag')).toBeInTheDocument()
    expect(screen.getByLabelText('Stop')).toBeInTheDocument()
    expect(screen.getByLabelText('Block palette')).toBeInTheDocument()
    expect(screen.getByLabelText('Script canvas')).toBeInTheDocument()
    expect(screen.getByLabelText('Sprite stage')).toBeInTheDocument()
    expect(screen.getByLabelText('Cosmo chat')).toBeInTheDocument()
  })

  it('renders the project name', () => {
    render(<App />)
    expect(screen.getByLabelText('Project name')).toBeInTheDocument()
  })

  it('renders the cosmo welcome message', () => {
    render(<App />)
    expect(
      screen.getByText(/Tell me what you want to build/),
    ).toBeInTheDocument()
  })

  it('renders the stage canvas element', () => {
    render(<App />)
    expect(screen.getByLabelText('Stage canvas')).toBeInTheDocument()
    expect(screen.getByLabelText('Stage canvas').tagName).toBe('CANVAS')
  })
})
