import { BeforeCaptureEventHandler, InitializationHandler } from '../common/plugin-interfaces'
import { TrackerEventPayload } from '../common/tracker-interfaces'

const STORAGE_KEY = 'snitch:debug'

export default function debugLoggerPlugin(): InitializationHandler & BeforeCaptureEventHandler {
  let enabled = false
  try {
    enabled = localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {}

  let lastLogTS: number | null = null
  function logLine(message: string) {
    if (!enabled) return
    const now = new Date()
    console.log(
      `%c[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]${
        lastLogTS ? ` (+${Math.floor((now.getTime() - (lastLogTS as number)) / 1e3)}s)` : ''
      } %cSnitch: %c${message}`,
      'color: gray',
      'color: black',
      'font-weight: bold',
    )
    lastLogTS = now.getTime()
  }
  return {
    onInit() {
      logLine('snitch instance created')
    },

    beforeCaptureEvent(eventName: string, eventPayload: TrackerEventPayload) {
      logLine(`captured event '${eventName}'`)
      if (enabled && eventPayload && Object.keys(eventPayload).length !== 0)
        console.table(eventPayload)
    },
  }
}
