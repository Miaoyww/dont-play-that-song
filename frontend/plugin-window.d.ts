import '@nonsplayer/plugin-sdk/native'

declare module '@nonsplayer/plugin-sdk/native' {
  interface PluginWindowOptions {
    visible?: boolean
  }
}
