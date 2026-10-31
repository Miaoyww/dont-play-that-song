export interface TriggerTrack {
  title: string
  artist: string
  album: string
  durationMs: number
}

export interface PlayerSnapshot {
  track: TriggerTrack | null
  status: string
  positionMs: number
}

export function isTargetTrack(track: TriggerTrack | null): boolean

export function createTriggerGuard(): {
  observe(snapshot: PlayerSnapshot): {
    preload: boolean
    trigger: boolean
    cancelPreload: boolean
    reset: boolean
  }
  retryPreload(): void
  shouldOpen(snapshot: PlayerSnapshot): boolean
}
