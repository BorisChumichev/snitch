// Server-safe entry point — no browser APIs required.
// Usage: import { snitch, userPlugin, ... } from '@borisch/snitch/server'

// Core
export { default as snitch } from './packages/snitch/index'
export { default } from './packages/snitch/index'

// Types
export type {
  Plugin,
  EventPayloadParamsProvider,
  InitializationHandler,
  EventSource,
  BeforeCaptureEventHandler,
  EventTransport,
  MixinProvider,
} from './packages/common/plugin-interfaces'

export type {
  TrackerEventPayload,
  EventHandler,
  TrackerInitializationOptions,
} from './packages/common/tracker-interfaces'

// Server-safe plugins
export { default as screenPlugin } from './packages/snitch-plugin-screens/index'
export { default as debugLoggerPlugin } from './packages/snitch-plugin-debug-logger/index'
export { default as devicePlugin } from './packages/snitch-plugin-device/index'
export { default as userPlugin } from './packages/snitch-plugin-user/index'

// Server-safe transports
export { default as s2sTransportPlugin } from './packages/snitch-plugin-s2s-transport/index'
