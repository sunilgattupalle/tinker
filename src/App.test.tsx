import { render, screen } from '@testing-library/react'
import { App } from './App'

vi.mock('@/scratch/setup', () => ({
  initializeScratchVM: () => ({
    runtime: { targets: [] },
  }),
}))

describe('App', () => {
  it('renders Tinker heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Tinker' })).toBeInTheDocument()
  })
})
