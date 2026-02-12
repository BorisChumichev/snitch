import createUniqueId from '../common/create-unique-id'
import { EventPayloadParamsProvider } from '../common/plugin-interfaces'

const STORAGE_KEY = 'snitch:did'

export default function devicePlugin(): EventPayloadParamsProvider {
  let deviceId: string

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      deviceId = stored
    } else {
      deviceId = createUniqueId()
      localStorage.setItem(STORAGE_KEY, deviceId)
    }
  } catch {
    deviceId = createUniqueId()
  }

  return {
    getEventPayloadParams() {
      return { did: deviceId }
    },
  }
}
