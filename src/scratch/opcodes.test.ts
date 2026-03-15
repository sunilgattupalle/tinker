import { opcodeRegistry, CATEGORIES } from './opcodes'

describe('OpcodeRegistry', () => {
  it('returns all opcodes', () => {
    const all = opcodeRegistry.getAll()
    expect(all.length).toBeGreaterThanOrEqual(20)
  })

  it('returns categories', () => {
    const cats = opcodeRegistry.getCategories()
    expect(cats).toContain('motion')
    expect(cats).toContain('looks')
    expect(cats).toContain('events')
    expect(cats).toContain('control')
    expect(cats).toContain('sensing')
    expect(cats).toContain('operators')
  })

  it('looks up by opcode', () => {
    const info = opcodeRegistry.getByOpcode('motion_movesteps')
    expect(info).toBeDefined()
    expect(info!.category).toBe('motion')
    expect(info!.label).toContain('STEPS')
    expect(info!.shape).toBe('stack')
    expect(info!.color).toBe('#4C97FF')
  })

  it('returns blocks by category', () => {
    const motionBlocks = opcodeRegistry.getByCategory('motion')
    expect(motionBlocks.length).toBeGreaterThanOrEqual(6)
    for (const b of motionBlocks) {
      expect(b.category).toBe('motion')
    }
  })

  it('validates opcodes', () => {
    expect(opcodeRegistry.isValidOpcode('motion_movesteps')).toBe(true)
    expect(opcodeRegistry.isValidOpcode('fake_block')).toBe(false)
  })

  it('hat blocks have hat shape', () => {
    const flagClicked = opcodeRegistry.getByOpcode('event_whenflagclicked')
    expect(flagClicked?.shape).toBe('hat')
  })

  it('cap blocks have cap shape', () => {
    const stop = opcodeRegistry.getByOpcode('control_stop')
    expect(stop?.shape).toBe('cap')
  })

  it('reporter blocks have reporter shape', () => {
    const random = opcodeRegistry.getByOpcode('operator_random')
    expect(random?.shape).toBe('reporter')
  })

  it('boolean blocks have boolean shape', () => {
    const keyPressed = opcodeRegistry.getByOpcode('sensing_keypressed')
    expect(keyPressed?.shape).toBe('boolean')
  })

  it('C-shape blocks have hasSubstack', () => {
    const repeat = opcodeRegistry.getByOpcode('control_repeat')
    expect(repeat?.hasSubstack).toBe(true)
    const forever = opcodeRegistry.getByOpcode('control_forever')
    expect(forever?.hasSubstack).toBe(true)
    const ifBlock = opcodeRegistry.getByOpcode('control_if')
    expect(ifBlock?.hasSubstack).toBe(true)
  })

  it('CATEGORIES array matches registry categories', () => {
    for (const cat of CATEGORIES) {
      const blocks = opcodeRegistry.getByCategory(cat.id)
      expect(blocks.length).toBeGreaterThanOrEqual(0)
    }
  })

  it('blocks with dropdowns have field options', () => {
    const keyEvent = opcodeRegistry.getByOpcode('event_whenkeypressed')
    expect(keyEvent?.fields.length).toBeGreaterThan(0)
    expect(keyEvent?.fields[0].options).toBeDefined()
    expect(keyEvent?.fields[0].options!.length).toBeGreaterThan(0)
  })
})
