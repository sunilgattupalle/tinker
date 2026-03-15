import { render, screen } from '@testing-library/react'
import { Block } from './Block'
import { opcodeRegistry } from '@/scratch/opcodes'

describe('Block', () => {
  it('renders a stack block with label', () => {
    const info = opcodeRegistry.getByOpcode('motion_movesteps')!
    render(<Block info={info} isPalette />)
    expect(screen.getByText('move')).toBeInTheDocument()
    expect(screen.getByText('steps')).toBeInTheDocument()
  })

  it('renders a hat block', () => {
    const info = opcodeRegistry.getByOpcode('event_whenflagclicked')!
    const { container } = render(<Block info={info} isPalette />)
    const body = container.querySelector('[class*="rounded-t-"]')
    expect(body).toBeInTheDocument()
  })

  it('renders a reporter block with pill shape', () => {
    const info = opcodeRegistry.getByOpcode('operator_random')!
    const { container } = render(<Block info={info} isPalette />)
    const body = container.querySelector('[class*="rounded-reporter"]')
    expect(body).toBeInTheDocument()
  })

  it('renders a boolean block', () => {
    const info = opcodeRegistry.getByOpcode('sensing_keypressed')!
    const { container } = render(<Block info={info} isPalette />)
    const body = container.querySelector('[style*="clip-path"]')
    expect(body).toBeInTheDocument()
  })

  it('renders inline input values in palette mode', () => {
    const info = opcodeRegistry.getByOpcode('motion_movesteps')!
    render(<Block info={info} isPalette />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('renders C-shape for blocks with substacks', () => {
    const info = opcodeRegistry.getByOpcode('control_repeat')!
    const { container } = render(<Block info={info} isPalette />)
    expect(container.querySelectorAll('div').length).toBeGreaterThan(2)
  })

  it('renders dropdown values in palette mode', () => {
    const info = opcodeRegistry.getByOpcode('event_whenkeypressed')!
    render(<Block info={info} isPalette />)
    expect(screen.getByText(/space/)).toBeInTheDocument()
  })

  it('uses category color for background', () => {
    const info = opcodeRegistry.getByOpcode('motion_movesteps')!
    const { container } = render(<Block info={info} isPalette />)
    const blockBody = container.querySelector('[style*="background-color"]')
    expect(blockBody).toBeInTheDocument()
  })
})
