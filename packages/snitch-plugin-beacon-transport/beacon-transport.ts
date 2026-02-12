import { EventTransport } from '../common/plugin-interfaces'
import { TrackerEventPayload } from '../common/tracker-interfaces'

export type BeaconTransportOptions = {
  hostname?: string
  path?: string
}

export default function beaconTransportPlugin(options?: BeaconTransportOptions): EventTransport {
  const hostname = options?.hostname ?? window.location.hostname
  const path = options?.path ?? '/_snitch'

  return {
    sendEvent(eventName: string, eventParams?: TrackerEventPayload) {
      const protocol = window.location.protocol
      const params = new URLSearchParams({ event: eventName })
      if (eventParams) {
        for (const key of Object.keys(eventParams)) {
          params.set(key, String(eventParams[key]))
        }
      }
      const url = `${protocol}//${hostname}${path}?${params.toString()}`
      navigator.sendBeacon(url)
    }
  }
}
