import userPlugin from './user'
import createSnitch from '../snitch'

// Minimal mock transport plugin that records sent events
function mockTransportPlugin() {
  const events: Array<{ name: string; payload: any }> = []
  return {
    events,
    sendEvent(eventName: string, eventPayload?: any) {
      events.push({ name: eventName, payload: { ...eventPayload } })
    },
  }
}

describe('userPlugin', () => {
  it('does not attach uid when no user ID is set', () => {
    const plugin = userPlugin()
    const params = plugin.getEventPayloadParams()
    expect(params).toEqual({})
    expect('uid' in params).toBe(false)
  })

  it('accepts an initial userId at construction', () => {
    const plugin = userPlugin('user-init')
    expect(plugin.getEventPayloadParams()).toEqual({ uid: 'user-init' })
  })

  it('setUserId() attaches uid to subsequent events', () => {
    const plugin = userPlugin()
    plugin.getMixins().setUserId('user-123')
    expect(plugin.getEventPayloadParams()).toEqual({ uid: 'user-123' })
  })

  it('clearUserId() removes uid from subsequent events', () => {
    const plugin = userPlugin('user-456')
    plugin.getMixins().clearUserId()
    expect(plugin.getEventPayloadParams()).toEqual({})
    expect('uid' in plugin.getEventPayloadParams()).toBe(false)
  })

  it('setUserId() can be called multiple times to change the user', () => {
    const plugin = userPlugin()
    const mixins = plugin.getMixins()
    mixins.setUserId('user-a')
    expect(plugin.getEventPayloadParams()).toEqual({ uid: 'user-a' })
    mixins.setUserId('user-b')
    expect(plugin.getEventPayloadParams()).toEqual({ uid: 'user-b' })
  })

  it('does not use localStorage', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem')
    const getItem = jest.spyOn(Storage.prototype, 'getItem')
    const plugin = userPlugin('user-789')
    plugin.getMixins().setUserId('user-new')
    plugin.getMixins().clearUserId()
    expect(setItem).not.toHaveBeenCalled()
    expect(getItem).not.toHaveBeenCalled()
    setItem.mockRestore()
    getItem.mockRestore()
  })

  describe('.withUserId()', () => {
    it('sends an event with the specified uid', () => {
      const transport = mockTransportPlugin()
      const captureEvent = createSnitch(userPlugin(), transport) as any
      captureEvent.withUserId('temp-user', 'purchase', { item: 'book' })
      expect(transport.events).toHaveLength(1)
      expect(transport.events[0].name).toBe('purchase')
      expect(transport.events[0].payload).toMatchObject({ uid: 'temp-user', item: 'book' })
    })

    it('restores previous uid after sending', () => {
      const transport = mockTransportPlugin()
      const user = userPlugin('original-user')
      const captureEvent = createSnitch(user, transport) as any

      captureEvent.withUserId('temp-user', 'impersonated_action')
      // The event should have temp-user
      expect(transport.events[0].payload.uid).toBe('temp-user')
      // After the call, uid should be restored to original-user
      captureEvent('normal_action')
      expect(transport.events[1].payload.uid).toBe('original-user')
    })

    it('restores to no uid when none was previously set', () => {
      const transport = mockTransportPlugin()
      const captureEvent = createSnitch(userPlugin(), transport) as any

      captureEvent.withUserId('one-shot-user', 'server_event')
      expect(transport.events[0].payload.uid).toBe('one-shot-user')
      // After the call, uid should be omitted again
      captureEvent('anonymous_event')
      expect('uid' in transport.events[1].payload).toBe(false)
    })

    it('sends an event without extra payload when payload is omitted', () => {
      const transport = mockTransportPlugin()
      const captureEvent = createSnitch(userPlugin(), transport) as any

      captureEvent.withUserId('user-x', 'simple_event')
      expect(transport.events[0].name).toBe('simple_event')
      expect(transport.events[0].payload.uid).toBe('user-x')
    })
  })
})
