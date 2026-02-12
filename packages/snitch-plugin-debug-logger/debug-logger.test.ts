import debugLoggerPlugin from './debug-logger'

describe('debugLogger plugin', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('does not log when snitch:debug is not set', () => {
    const plugin = debugLoggerPlugin()
    console.log = jest.fn()
    plugin.onInit()
    plugin.beforeCaptureEvent('testEvent', { hello: 'bye' })
    expect(console.log).not.toHaveBeenCalled()
  })

  it('logs when snitch:debug is set to "true"', () => {
    localStorage.setItem('snitch:debug', 'true')
    const plugin = debugLoggerPlugin()
    console.log = jest.fn()
    plugin.onInit()
    expect(console.log).toBeCalledTimes(1)
  })

  it('logs capture event call', () => {
    localStorage.setItem('snitch:debug', 'true')
    const plugin = debugLoggerPlugin()
    console.log = jest.fn()
    plugin.beforeCaptureEvent('testEvent')
    expect(console.log).toBeCalledTimes(1)
  })

  it('logs capture event call with params as table', () => {
    localStorage.setItem('snitch:debug', 'true')
    const plugin = debugLoggerPlugin()
    console.log = jest.fn()
    console.table = jest.fn()
    plugin.beforeCaptureEvent('testEvent', { hello: 'bye' })
    expect(console.log).toBeCalledTimes(1)
    expect(console.table).toBeCalledTimes(1)
  })

  it('does not log when snitch:debug is set to something other than "true"', () => {
    localStorage.setItem('snitch:debug', 'false')
    const plugin = debugLoggerPlugin()
    console.log = jest.fn()
    plugin.onInit()
    expect(console.log).not.toHaveBeenCalled()
  })
})
