import s2sTransportPlugin, { ERROR_NO_HOSTNAME } from './s2s-transport'

let fetchMock: jest.Mock

beforeEach(() => {
  fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 })
  ;(global as any).fetch = fetchMock
})

afterEach(() => {
  delete (global as any).fetch
})

describe('S2S Transport Plugin', () => {
  it('throws if hostname is not provided', () => {
    expect(() => s2sTransportPlugin({ hostname: '' })).toThrow(ERROR_NO_HOSTNAME)
  })

  it('sends event as GET request with query params', () => {
    const plugin = s2sTransportPlugin({ hostname: 'analytics.example.com' })
    plugin.sendEvent('purchase', { amount: 100 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url] = fetchMock.mock.calls[0]
    const parsed = new URL(url)
    expect(parsed.origin).toBe('https://analytics.example.com')
    expect(parsed.pathname).toBe('/_snitch')
    expect(parsed.searchParams.get('event')).toBe('purchase')
    expect(parsed.searchParams.get('amount')).toBe('100')
  })

  it('sends no request body or headers', () => {
    const plugin = s2sTransportPlugin({ hostname: 'tracker.io' })
    plugin.sendEvent('test')

    const callArgs = fetchMock.mock.calls[0]
    expect(callArgs.length).toBe(1)
  })

  it('uses /_snitch as default path', () => {
    const plugin = s2sTransportPlugin({ hostname: 'tracker.io' })
    plugin.sendEvent('test')

    const [url] = fetchMock.mock.calls[0]
    expect(new URL(url).pathname).toBe('/_snitch')
  })

  it('allows configuring a custom path', () => {
    const plugin = s2sTransportPlugin({ hostname: 'tracker.io', path: '/events/ingest' })
    plugin.sendEvent('test')

    const [url] = fetchMock.mock.calls[0]
    expect(new URL(url).pathname).toBe('/events/ingest')
  })

  it('includes s2sToken as query param when provided', () => {
    const plugin = s2sTransportPlugin({
      hostname: 'tracker.io',
      s2sToken: 'secret-token-123'
    })
    plugin.sendEvent('redeem', { code: 'PROMO50' })

    const [url] = fetchMock.mock.calls[0]
    const parsed = new URL(url)
    expect(parsed.searchParams.get('s2sToken')).toBe('secret-token-123')
    expect(parsed.searchParams.get('event')).toBe('redeem')
    expect(parsed.searchParams.get('code')).toBe('PROMO50')
  })

  it('does not include s2sToken when omitted', () => {
    const plugin = s2sTransportPlugin({ hostname: 'tracker.io' })
    plugin.sendEvent('test')

    const [url] = fetchMock.mock.calls[0]
    expect(new URL(url).searchParams.has('s2sToken')).toBe(false)
  })

  it('sends only event when no params provided', () => {
    const plugin = s2sTransportPlugin({ hostname: 'tracker.io' })
    plugin.sendEvent('init')

    const [url] = fetchMock.mock.calls[0]
    const parsed = new URL(url)
    expect(parsed.searchParams.get('event')).toBe('init')
    expect(Array.from(parsed.searchParams.keys())).toEqual(['event'])
  })

  it('silently catches fetch errors', () => {
    fetchMock.mockRejectedValue(new Error('network failure'))
    const plugin = s2sTransportPlugin({ hostname: 'tracker.io' })

    expect(() => plugin.sendEvent('test')).not.toThrow()
  })
})
