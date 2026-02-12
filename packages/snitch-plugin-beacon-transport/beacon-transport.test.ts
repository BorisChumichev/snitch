import beaconTransportPlugin from './beacon-transport'

describe('Beacon Transport Plugin', () => {
  let sendBeaconMock: jest.Mock

  beforeEach(() => {
    sendBeaconMock = jest.fn().mockReturnValue(true)
    Object.defineProperty(navigator, 'sendBeacon', {
      value: sendBeaconMock,
      writable: true,
      configurable: true
    })
  })

  it('sends event as query params via navigator.sendBeacon', () => {
    const plugin = beaconTransportPlugin({ hostname: 'my-tracker-host.com' })
    plugin.sendEvent('pageView', { href: 'https://example.com' })

    expect(sendBeaconMock).toHaveBeenCalledTimes(1)
    const [url] = sendBeaconMock.mock.calls[0]
    const parsed = new URL(url)
    expect(parsed.origin).toBe('http://my-tracker-host.com')
    expect(parsed.pathname).toBe('/_snitch')
    expect(parsed.searchParams.get('event')).toBe('pageView')
    expect(parsed.searchParams.get('href')).toBe('https://example.com')
  })

  it('sends no body', () => {
    const plugin = beaconTransportPlugin({ hostname: 'tracker.io' })
    plugin.sendEvent('test')

    const callArgs = sendBeaconMock.mock.calls[0]
    expect(callArgs.length).toBe(1)
  })

  it('uses current window hostname and /_snitch path by default', () => {
    const plugin = beaconTransportPlugin()
    plugin.sendEvent('click', {})

    const [url] = sendBeaconMock.mock.calls[0]
    const parsed = new URL(url)
    expect(parsed.hostname).toBe(window.location.hostname)
    expect(parsed.pathname).toBe('/_snitch')
    expect(parsed.searchParams.get('event')).toBe('click')
  })

  it('allows configuring custom path', () => {
    const plugin = beaconTransportPlugin({ hostname: 'tracker.io', path: '/events' })
    plugin.sendEvent('scroll', { depthPercent: 50 })

    const [url] = sendBeaconMock.mock.calls[0]
    const parsed = new URL(url)
    expect(parsed.pathname).toBe('/events')
    expect(parsed.searchParams.get('depthPercent')).toBe('50')
  })

  it('sends all event params as query string params', () => {
    const plugin = beaconTransportPlugin({ hostname: 'tracker.io' })
    plugin.sendEvent('pageView', { href: '/home', count: 1 })

    const [url] = sendBeaconMock.mock.calls[0]
    const parsed = new URL(url)
    expect(parsed.searchParams.get('event')).toBe('pageView')
    expect(parsed.searchParams.get('href')).toBe('/home')
    expect(parsed.searchParams.get('count')).toBe('1')
  })

  it('sends only event name when no params provided', () => {
    const plugin = beaconTransportPlugin({ hostname: 'tracker.io' })
    plugin.sendEvent('init')

    const [url] = sendBeaconMock.mock.calls[0]
    const parsed = new URL(url)
    expect(parsed.searchParams.get('event')).toBe('init')
    expect(Array.from(parsed.searchParams.keys())).toEqual(['event'])
  })
})
