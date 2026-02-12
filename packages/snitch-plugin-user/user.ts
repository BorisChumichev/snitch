import { EventPayloadParamsProvider, EventSource, MixinProvider } from '../common/plugin-interfaces'
import { EventHandler, TrackerEventPayload } from '../common/tracker-interfaces'

export default function userPlugin(
  userId?: string,
): EventPayloadParamsProvider & MixinProvider & EventSource {
  let uid: string | null = userId ?? null
  let captureEvent: EventHandler

  return {
    setEventHandler(eventHandler: EventHandler) {
      captureEvent = eventHandler
    },

    getEventPayloadParams(): { [key: string]: string | number } {
      if (uid) {
        return { uid }
      }
      return {}
    },

    getMixins() {
      return {
        setUserId(id: string) {
          uid = id
        },
        clearUserId() {
          uid = null
        },
        withUserId(id: string, eventName: string, eventPayload?: TrackerEventPayload) {
          const prevUid = uid
          uid = id
          captureEvent(eventName, eventPayload)
          uid = prevUid
        },
      }
    },
  }
}
