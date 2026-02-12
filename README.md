# Snitch

Modular analytics tracking library. Compose your tracker from small, focused plugins and transports.

## Install

```bash
npm install @borisch/snitch
```

## Quick Start (Browser)

```ts
import {
  snitch,
  devicePlugin,
  userPlugin,
  sessionPlugin,
  launchPlugin,
  scrollPlugin,
  locationPlugin,
  beaconTransportPlugin,
  debugLoggerPlugin,
} from '@borisch/snitch'

const captureEvent = snitch(
  devicePlugin(),
  userPlugin(),
  sessionPlugin(),
  launchPlugin(),
  scrollPlugin(),
  locationPlugin({ captureLocationChange: true }),
  beaconTransportPlugin({ hostname: 'analytics.example.com' }),
  debugLoggerPlugin(),
)

// Manually capture events
captureEvent('button_click', { buttonId: 'signup' })
```

## Server-Side Usage

Many plugins use browser APIs (`window`, `document`, `localStorage`). Importing `@borisch/snitch` on the server will fail because some plugins reference `window` at the module level.

Use the server entry point instead:

```ts
import {
  snitch,
  userPlugin,
  devicePlugin,
  screenPlugin,
  debugLoggerPlugin,
  s2sTransportPlugin,
} from '@borisch/snitch/server'
```

The server entry point exports only the plugins and transports that work without browser APIs:

| Export               | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `snitch`             | Core factory function                                      |
| `userPlugin`         | In-memory user ID tracking                                 |
| `devicePlugin`       | Device ID (falls back to random ID without `localStorage`) |
| `screenPlugin`       | Screen tracking (pure state management)                    |
| `debugLoggerPlugin`  | Console logger (silently disabled without `localStorage`)  |
| `s2sTransportPlugin` | HTTP transport via `fetch()` (available in Node 18+)       |

All types are also re-exported from `@borisch/snitch/server`.

**Example — server-side event tracking:**

```ts
import { snitch, userPlugin, s2sTransportPlugin } from '@borisch/snitch/server'

const track = snitch(userPlugin(), s2sTransportPlugin({ hostname: 'analytics.example.com' })) as any

// One-shot event with a specific user ID
track.withUserId(req.userId, 'checkout_completed', { orderId: '12345' })
```

The `snitch()` function accepts any number of plugins and returns a `captureEvent` function. Plugins can:

- **Provide event parameters** — automatically attached to every event
- **Emit events** on their own (e.g. scroll milestones, page views)
- **Transport events** to a backend
- **Intercept events** before they are sent
- **Expose mixins** — additional methods attached to the `captureEvent` function

## Plugins

### `sessionPlugin()`

Manages user sessions using `localStorage`. A new session starts when:

- No previous session exists
- The previous session has been inactive for 30+ minutes
- UTM parameters are present in the URL

If a session expires between events, a new session is started automatically before the next event is sent.

Emits: `sessionStart`

Attaches to every event:
| Param | Description |
|-------|-------------|
| `sid` | Unique session ID |
| `scnt` | Total session count for this device |
| `set` | Milliseconds since session started |
| `sutm` | Compact UTM parameters from the URL that started the session |

---

### `launchPlugin()`

Captures a `launch` event when the tracker initializes. Records whether the page runs inside an iframe.

Emits: `launch` with `{ ifr: "true" | "false" }`

Attaches to every event:
| Param | Description |
|-------|-------------|
| `lid` | Unique launch ID (generated per `snitch()` call) |
| `ref` | `document.referrer` at initialization time |

---

### `scrollPlugin()`

Tracks scroll depth. Emits events when the user scrolls past depth milestones (25%, 50%, 75%, 100%). The scroll depth cache resets whenever a `locationChange` or `screenChange` event occurs, so milestones are tracked per-page.

Emits: `scroll` with `{ depthPercent: number }`

---

### `locationPlugin(options)`

Tracks the current page URL and optionally emits events on URL changes (SPA navigation, `pushState`, etc.).

**Options:**
| Option | Type | Description |
|--------|------|-------------|
| `captureLocationChange` | `boolean` | Whether to listen for URL changes and emit events |
| `getLocation` | `() => string` | Custom location getter (defaults to `window.location.href`) |

Emits (when `captureLocationChange` is `true`): `locationChange` with `{ phref: string }` (previous URL)

Attaches to every event:
| Param | Description |
|-------|-------------|
| `href` | Current page URL (truncated to 500 characters) |

---

### `engagementPlugin(options?)`

Periodically emits engagement events while the page is visible. Events are suppressed when the tab is hidden (`document.hidden === true`).

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `engagementTrackingIntervalMsec` | `number` | `10000` | Interval in milliseconds between engagement pings |

Emits: `engage` (at configured interval, only when tab is visible)

---

### `screenPlugin(initialScreen)`

Tracks screen/page views within an app. Maintains current and previous screen state.

**Options:**
| Option | Type | Description |
|--------|------|-------------|
| `screenType` | `string` | Type/category of the initial screen |
| `screenId` | `string?` | Optional screen identifier |

To change screens, call `captureEvent('screenChange', { screenType: 'catalog', screenId: 'page2' })`. The plugin automatically injects previous screen params and removes the raw `screenType`/`screenId` from the event payload.

Attaches to every event:
| Param | Description |
|-------|-------------|
| `sct` | Current screen type |
| `scid` | Current screen ID (or `""`) |

Attaches to `screenChange` events:
| Param | Description |
|-------|-------------|
| `psct` | Previous screen type |
| `pscid` | Previous screen ID (or `""`) |

---

### `exceptionsPlugin()`

Captures unhandled errors and promise rejections globally.

Emits:

- `uncaughtError` with `{ message, filename, lineno, colno, error }`
- `unhandledRejection` with `{ reason }`

---

### `webVitalsPlugin()`

Reports [Core Web Vitals](https://web.dev/vitals/) using the `web-vitals` library. Tracks CLS, FID, LCP, TTFB, and FCP.

Emits: `webVital` with `{ name, value, delta, metricId }`

---

### `flagPlugin(options)`

Feature flag evaluation plugin. Adds `getFlag()` and `getFlags()` methods to the `captureEvent` function via mixins.

**Options:**
| Option | Type | Description |
|--------|------|-------------|
| `flagApiEndpoint` | `string` | URL of the flag evaluation API |
| `userIdResolver` | `() => string \| null \| undefined` | Optional custom user ID resolver |

User ID is resolved in order: custom resolver → VK user ID from URL → Top Mail.ru counter cookie → auto-generated anonymous ID (persisted in `localStorage`).

**Usage:**

```ts
const captureEvent = snitch(flagPlugin({ flagApiEndpoint: 'https://flags.example.com/api' })) as any

const flag = await captureEvent.getFlag('new-feature')
// { flagKey: 'new-feature', match: true, variant: 'control', attachment: '...' }

const flags = await captureEvent.getFlags(['feature-a', 'feature-b'])
```

Emits:

- `flagEvaluationComplete` with full evaluation response
- `flagEvaluationFailed` with `{ flagKey, errorMessage }`

---

### `useragentPlugin()`

Attaches the browser user agent string to every event.

Attaches to every event:
| Param | Description |
|-------|-------------|
| `ua` | `navigator.userAgent` |

---

### `devicePlugin()`

Generates a persistent device (browser) identifier stored in `localStorage` under the key `snitch:did`. The ID is created once and reused forever across all sessions — it survives page reloads, tab closes, and new sessions. It only resets if the user clears their browser storage.

If `localStorage` is unavailable, a new ID is generated per `snitch()` call (in-memory only).

Attaches to every event:
| Param | Description |
|-------|-------------|
| `did` | Persistent device ID |

---

### `userPlugin(userId?)`

Tracks the current user. Exposes `.setUserId(id)` and `.clearUserId()` methods on the `captureEvent` function via mixins. The user ID is stored in-memory only — no `localStorage`, no emitted events. This makes it safe to use in both browser and server-side environments.

When no user ID is set, `uid` is omitted from events entirely.

If the user ID is known at initialization time, it can be passed directly:

```ts
const captureEvent = snitch(
  userPlugin('user-123'),
  // ...
) as any
```

Otherwise, set it later:

```ts
captureEvent.setUserId('user-123')
```

**Methods (mixins):**
| Method | Description |
|--------|-------------|
| `setUserId(id: string)` | Set the user ID. All subsequent events will include `uid`. |
| `clearUserId()` | Clear the user ID. `uid` is no longer attached to events. |
| `withUserId(id: string, eventName: string, eventPayload?)` | Temporarily set the user ID, send a single event, then restore the previous user ID. Designed for server-side use where a single snitch instance handles multiple users. |

Attaches to every event (while user ID is set):
| Param | Description |
|-------|-------------|
| `uid` | Current user ID |

**Usage:**

```ts
const captureEvent = snitch(
  devicePlugin(),
  userPlugin(),
  sessionPlugin(),
  beaconTransportPlugin({ hostname: '...' }),
) as any

// User logs in
captureEvent.setUserId('user-123')

captureEvent('add_to_cart', { productId: 'abc' })
// => { event: 'add_to_cart', productId: 'abc', uid: 'user-123', did: '...', sid: '...' }

// User logs out
captureEvent.clearUserId()
// uid is no longer attached to events

// Server-side (s2s-transport) — pass uid at init, no localStorage needed
const track = snitch(
  userPlugin(req.userId),
  s2sTransportPlugin({ hostname: 'analytics.example.com' }),
)
track('subscriptionRenewalPaymentFailed')
// => { event: 'subscriptionRenewalPaymentFailed', uid: 'user-123' }
```

**Server-side with `.withUserId()`:**

When a single snitch instance handles requests from multiple users (e.g., in an Express handler), use `.withUserId()` to atomically send an event with a specific user ID without affecting other requests. The captureEvent pipeline is synchronous, so the temporary uid swap is safe — no interleaving is possible.

```ts
const track = snitch(userPlugin(), s2sTransportPlugin({ hostname: 'analytics.example.com' })) as any

app.post('/api/checkout', (req, res) => {
  // Sends this one event with uid='user-42', then restores previous state
  track.withUserId(req.userId, 'checkout_completed', { orderId: req.body.orderId })
  res.json({ ok: true })
})
```

---

### `debugLoggerPlugin()`

Development helper. Logs every event to the browser console with timestamps and time deltas between events. When the event has a non-empty payload, it is also rendered via `console.table()`.

**Silent by default.** To enable, set a `localStorage` flag:

```js
localStorage.setItem('snitch:debug', 'true')
```

The flag is read once when `debugLoggerPlugin()` is called. To disable, remove the flag and reload:

```js
localStorage.removeItem('snitch:debug')
```

---

## Transports

### `beaconTransportPlugin(options?)`

Sends events via [`navigator.sendBeacon()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon). All event data is encoded as URL query parameters — designed for CDN log-based analytics where request URLs are parsed from access logs.

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hostname` | `string` | `window.location.hostname` | Target hostname |
| `path` | `string` | `/_snitch` | URL path |

Requests are sent to: `{protocol}//{hostname}{path}?event={name}&...params`

---

### `s2sTransportPlugin(options)`

Sends events via `fetch()` GET requests over HTTPS. Fire-and-forget (errors are silently caught). Designed for server-side environments (Node 18+, Cloudflare Workers) or any environment with `fetch`.

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hostname` | `string` | _required_ | Target hostname |
| `path` | `string` | `/_snitch` | URL path |
| `s2sToken` | `string` | — | Optional auth token (sent as a query parameter) |

Requests are sent to: `https://{hostname}{path}?event={name}&...params[&s2sToken=...]`

---

### `topmailruTransportPlugin(counterId, userIdResolver?)`

Sends events to [Top Mail.ru](https://top.mail.ru/) analytics counter by pushing to the `window._tmr` queue.

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `counterId` | `string` | Top Mail.ru counter ID (required) |
| `userIdResolver` | `() => string \| null \| undefined` | Optional custom user ID resolver |

User ID resolution order: custom resolver → TMR counter cookie → auto-generated anonymous ID.

---

### `vkBridgeTransportPlugin()`

Sends events via [VK Bridge](https://dev.vk.com/mini-apps/bridge) for VK Mini Apps. Extracts `vk_user_id` from the URL. Each event triggers two VK Bridge calls: `VKWebAppTrackEvent` and `VKWebAppSendCustomEvent`. All param values are coerced to strings to work around iOS VK Bridge limitations.

---

## Platform-Specific Plugins

### `vkmaLaunchPlugin()`

A VK Mini Apps variant of `launchPlugin`. Parses VK Mini App launch parameters from the URL (`vk_user_id`, `vk_app_id`, `vk_platform`, `vk_ref`, etc.).

Emits: `launch` (with iframe flag + VKMA params), `mt_internal_launch`

Attaches to every event:
| Param | Description |
|-------|-------------|
| `lid` | Unique launch ID |
| `ref` | `document.referrer` |
| `mauid` | VK user ID |
| `maaid` | VK app ID |
| `malang` | VK language |
| `mac` | VK access token settings |
| `map` | VK platform |
| `maref` | VK ref |

---

## Types

All public types are exported for TypeScript consumers:

```ts
import type {
  Plugin,
  EventTransport,
  EventSource,
  EventPayloadParamsProvider,
  InitializationHandler,
  BeforeCaptureEventHandler,
  MixinProvider,
  TrackerEventPayload,
  EventHandler,
} from '@borisch/snitch'
```

## Writing a Custom Plugin

A plugin is any object that partially implements the `Plugin` interface:

```ts
import type { Plugin } from '@borisch/snitch'

function myPlugin(): Plugin {
  return {
    // Attach params to every event
    getEventPayloadParams() {
      return { customParam: 'value' }
    },
    // React to events before transport
    beforeCaptureEvent(eventName, eventParams) {
      // filter, modify, log, etc.
    },
    // Transport events
    sendEvent(eventName, eventParams) {
      fetch('/analytics', {
        method: 'POST',
        body: JSON.stringify({ eventName, ...eventParams }),
      })
    },
  }
}
```

## License

MIT
