import { EventTransport } from '../common/plugin-interfaces'
import { TrackerEventPayload } from '../common/tracker-interfaces'

export type S2STransportOptions = {
  hostname: string
  path?: string
  s2sToken?: string
}

export const ERROR_NO_HOSTNAME = 'initErrorNoHostname'

export default function s2sTransportPlugin(options: S2STransportOptions): EventTransport {
  if (!options.hostname) throw TypeError(ERROR_NO_HOSTNAME)

  const path = options.path ?? '/_snitch'

  return {
    sendEvent(eventName: string, eventParams?: TrackerEventPayload) {
      const params = new URLSearchParams({ event: eventName })
      if (eventParams) {
        for (const key of Object.keys(eventParams)) {
          params.set(key, String(eventParams[key]))
        }
      }
      if (options.s2sToken) {
        params.set('s2sToken', options.s2sToken)
      }
      const url = `https://${options.hostname}${path}?${params.toString()}`
      fetch(url).catch(() => {})
    }
  }
}
