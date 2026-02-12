import devicePlugin from './device'

describe('devicePlugin', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('generates a device ID and persists it in localStorage', () => {
    const plugin = devicePlugin()
    const { did } = plugin.getEventPayloadParams()
    expect(did).toBeTruthy()
    expect(typeof did).toBe('string')
    expect(localStorage.getItem('snitch:did')).toBe(did)
  })

  it('reuses the device ID from localStorage on subsequent calls', () => {
    const plugin1 = devicePlugin()
    const did1 = plugin1.getEventPayloadParams().did
    const plugin2 = devicePlugin()
    const did2 = plugin2.getEventPayloadParams().did
    expect(did1).toBe(did2)
  })

  it('returns the same did on every getEventPayloadParams call', () => {
    const plugin = devicePlugin()
    const did1 = plugin.getEventPayloadParams().did
    const did2 = plugin.getEventPayloadParams().did
    expect(did1).toBe(did2)
  })
})
