# Snitch

Modular analytics tracking library. Compose your tracker from small, focused plugins and transports.

## Install

```bash
npm install @borisch/snitch
```

## Quick Start

```ts
import { snitch, sessionPlugin, scrollPlugin, beaconTransportPlugin } from '@borisch/snitch'

const captureEvent = snitch(
  sessionPlugin(),
  scrollPlugin({ threshold: 25 }),
  beaconTransportPlugin({ url: 'https://analytics.example.com/collect' })
)

// Manually capture events
captureEvent('button_click', { buttonId: 'signup' })
```

The `snitch()` function accepts any number of plugins and returns a `captureEvent` function. Plugins can:

- **Provide event parameters** (automatically attached to every event)
- **Emit events** on their own (e.g. scroll milestones, page views)
- **Transport events** to a backend (Beacon API, fetch, VK Bridge, etc.)
- **Intercept events** before they are sent

## Plugins

| Plugin             | Factory                  | Description                                                |
| ------------------ | ------------------------ | ---------------------------------------------------------- |
| Session            | `sessionPlugin()`        | Generates a unique session ID, attaches it to every event  |
| Launch             | `launchPlugin()`         | Captures a `launch` event on initialization                |
| Scroll             | `scrollPlugin(opts)`     | Tracks scroll depth milestones (default: 25/50/75/100%)    |
| Location           | `locationPlugin()`       | Attaches page URL and referrer to every event              |
| Engagement         | `engagementPlugin(opts)` | Tracks time spent on page, emits engagement events         |
| Screens            | `screenPlugin()`         | Tracks screen/page view events                             |
| Exceptions         | `exceptionsPlugin()`     | Captures unhandled errors and unhandled promise rejections |
| Web Vitals         | `webVitalsPlugin()`      | Reports Core Web Vitals (LCP, FID, CLS, etc.)              |
| Flag               | `flagPlugin(opts)`       | Attaches a static key-value flag to every event            |
| User Agent         | `useragentPlugin()`      | Attaches `navigator.userAgent` to every event              |
| Debug Logger       | `debugLoggerPlugin()`    | Logs all events to the console (for development)           |
| VK Mini App Launch | `vkmaLaunchPlugin()`     | Parses VK Mini App launch parameters                       |

## Transports

| Transport   | Factory                          | Description                                                                     |
| ----------- | -------------------------------- | ------------------------------------------------------------------------------- |
| Beacon      | `beaconTransportPlugin(opts)`    | Sends events as URL query params via `navigator.sendBeacon()`                   |
| S2S         | `s2sTransportPlugin(opts)`       | Sends events as URL query params via `fetch()` GET (for server-side / Node 18+) |
| Top Mail.ru | `topmailruTransportPlugin(opts)` | Sends events to Top Mail.ru counter                                             |
| VK Bridge   | `vkBridgeTransportPlugin(opts)`  | Sends events via VK Bridge                                                      |

## Types

All public types are exported for TypeScript consumers:

```ts
import type { Plugin, EventTransport, TrackerEventPayload } from '@borisch/snitch'
```

## Writing a Custom Plugin

A plugin is any object that partially implements the `Plugin` interface:

```ts
import type { Plugin } from '@borisch/snitch'

function myPlugin(): Plugin {
  return {
    getEventPayloadParams() {
      return { customParam: 'value' }
    },
    sendEvent(eventName, eventParams) {
      // custom transport logic
    }
  }
}
```

## License

MIT
