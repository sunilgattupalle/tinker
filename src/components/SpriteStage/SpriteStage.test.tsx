import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpriteStage } from './SpriteStage'
import { useProjectStore } from '@/store/project'

vi.mock('@/scratch/setup', () => ({
  initializeScratchVM: () => ({
    runtime: { targets: [] },
    start: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    editingTarget: null,
    setEditingTarget: vi.fn(),
    postIOData: vi.fn(),
  }),
  loadDefaultProject: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/scratch/spriteAdapter', () => ({
  setSpriteVM: vi.fn(),
  addDefaultSprite: vi.fn().mockResolvedValue(undefined),
  deleteSprite: vi.fn(),
  spriteAdapter: {
    getTargets: () => [],
    getActiveTarget: () => null,
    setActiveTarget: vi.fn(),
    addDefaultSprite: vi.fn().mockResolvedValue(undefined),
    deleteSprite: vi.fn(),
    getSpriteInfo: () => null,
  },
}))

const mockTargets = [
  {
    id: 'sprite-1',
    name: 'Cat',
    x: 10,
    y: 20,
    direction: 90,
    size: 100,
    visible: true,
    costumeName: 'costume1',
    isStage: false,
  },
  {
    id: 'sprite-2',
    name: 'Dog',
    x: -30,
    y: 40,
    direction: 180,
    size: 50,
    visible: false,
    costumeName: 'costume1',
    isStage: false,
  },
]

describe('SpriteStage', () => {
  const mockVM = {
    runtime: { targets: [] },
    start: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    editingTarget: null,
    setEditingTarget: vi.fn(),
    postIOData: vi.fn(),
  }

  beforeEach(() => {
    useProjectStore.setState({
      targets: [],
      editingTargetId: null,
      vm: mockVM as never,
    })
  })

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

  it('has section label for accessibility', () => {
    render(<SpriteStage />)
    expect(screen.getByLabelText('Sprite stage')).toBeInTheDocument()
  })

  it('renders sprite thumbnails from store', () => {
    useProjectStore.setState({
      targets: mockTargets,
      editingTargetId: 'sprite-1',
      vm: mockVM as never,
    })
    render(<SpriteStage />)
    expect(screen.getByLabelText('Select sprite Cat')).toBeInTheDocument()
    expect(screen.getByLabelText('Select sprite Dog')).toBeInTheDocument()
  })

  it('renders add sprite button', () => {
    render(<SpriteStage />)
    expect(screen.getByLabelText('Add sprite')).toBeInTheDocument()
  })

  it('shows sprite info for active sprite', () => {
    useProjectStore.setState({
      targets: mockTargets,
      editingTargetId: 'sprite-1',
      vm: mockVM as never,
    })
    render(<SpriteStage />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('switches active sprite when thumbnail is clicked', async () => {
    const user = userEvent.setup()
    const setEditingTarget = vi.fn()
    useProjectStore.setState({
      targets: mockTargets,
      editingTargetId: 'sprite-1',
      setEditingTarget,
      vm: mockVM as never,
    })
    render(<SpriteStage />)
    await user.click(screen.getByLabelText('Select sprite Dog'))
    expect(setEditingTarget).toHaveBeenCalledWith('sprite-2')
  })

  it('shows delete button when multiple sprites exist', () => {
    useProjectStore.setState({
      targets: mockTargets,
      editingTargetId: 'sprite-1',
      vm: mockVM as never,
    })
    render(<SpriteStage />)
    expect(screen.getByLabelText('Delete sprite')).toBeInTheDocument()
  })

  it('hides delete button with single sprite', () => {
    useProjectStore.setState({
      targets: [mockTargets[0]],
      editingTargetId: 'sprite-1',
      vm: mockVM as never,
    })
    render(<SpriteStage />)
    expect(screen.queryByLabelText('Delete sprite')).not.toBeInTheDocument()
  })
})
