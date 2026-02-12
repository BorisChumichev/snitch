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

// Plugins
export { default as scrollPlugin } from './packages/snitch-plugin-scroll/index'
export { default as locationPlugin } from './packages/snitch-plugin-location/index'
export { default as sessionPlugin } from './packages/snitch-plugin-session/index'
export { default as launchPlugin } from './packages/snitch-plugin-launch/index'
export { default as engagementPlugin } from './packages/snitch-plugin-engagement/index'
export { default as screenPlugin } from './packages/snitch-plugin-screens/index'
export { default as exceptionsPlugin } from './packages/snitch-plugin-exceptions/index'
export { default as webVitalsPlugin } from './packages/snitch-plugin-web-vitals/index'
export { default as flagPlugin } from './packages/snitch-plugin-flag/index'
export { default as debugLoggerPlugin } from './packages/snitch-plugin-debug-logger/index'
export { default as useragentPlugin } from './packages/snitch-plugin-useragent/index'
export { default as devicePlugin } from './packages/snitch-plugin-device/index'
export { default as userPlugin } from './packages/snitch-plugin-user/index'

// Transports
export { default as beaconTransportPlugin } from './packages/snitch-plugin-beacon-transport/index'
export { default as s2sTransportPlugin } from './packages/snitch-plugin-s2s-transport/index'
export { default as topmailruTransportPlugin } from './packages/snitch-plugin-topmailru-transport/index'
export { default as vkBridgeTransportPlugin } from './packages/snitch-plugin-vkbridge-transport/index'

// Platform-specific
export { default as vkmaLaunchPlugin } from './packages/snitch-plugin-vkma-launch/index'
