const TARGET_TITLE = 'shed a light'
const TARGET_ARTISTS = ['robin schulz', 'david guetta', 'cheat codes']
const TARGET_POSITION_MS = 79_000
const PRELOAD_POSITION_MS = TARGET_POSITION_MS - 10_000

function normalize(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('en-US')
}

export function isTargetTrack(track) {
  if (!track || normalize(track.title) !== TARGET_TITLE || typeof track.artist !== 'string') {
    return false
  }

  const artists = normalize(track.artist)
  return TARGET_ARTISTS.every((artist) => artists.includes(artist))
}

export function createTriggerGuard() {
  let identity = ''
  let lastPositionMs = 0
  let preloaded = false
  let retryRequested = false
  let reachedTarget = false
  let triggered = false

  function observe({ track, status, positionMs }) {
    const nextIdentity = track
      ? `${track.title}\0${track.artist}\0${track.album}\0${track.durationMs}`
      : ''
    let previousPositionMs = lastPositionMs
    let cancelPreload = false
    let reset = false

    if (nextIdentity !== identity) {
      cancelPreload = preloaded
      reset = true
      identity = nextIdentity
      previousPositionMs = positionMs
      preloaded = false
      reachedTarget = false
      triggered = false
    } else if (lastPositionMs >= TARGET_POSITION_MS && positionMs < 1_500) {
      cancelPreload = preloaded
      reset = true
      preloaded = false
      reachedTarget = false
      triggered = false
    } else if (
      preloaded &&
      !triggered &&
      lastPositionMs >= PRELOAD_POSITION_MS &&
      positionMs < PRELOAD_POSITION_MS - 1_500
    ) {
      cancelPreload = true
      preloaded = false
    }

    const targetTrack = isTargetTrack(track)
    const crossedPreloadPosition =
      previousPositionMs < PRELOAD_POSITION_MS && positionMs >= PRELOAD_POSITION_MS
    const preload =
      !preloaded &&
      targetTrack &&
      positionMs >= PRELOAD_POSITION_MS &&
      positionMs < TARGET_POSITION_MS &&
      (crossedPreloadPosition || reset || retryRequested)

    if (preload) {
      preloaded = true
      retryRequested = false
    }

    if (previousPositionMs < TARGET_POSITION_MS && positionMs >= TARGET_POSITION_MS) {
      reachedTarget = true
    }
    if (status !== 'playing' && positionMs >= TARGET_POSITION_MS) {
      reachedTarget = true
    }
    lastPositionMs = positionMs

    let trigger = false
    if (!triggered && reachedTarget && status === 'playing' && targetTrack) {
      triggered = true
      trigger = true
    }

    return { preload, trigger, cancelPreload, reset }
  }

  return {
    observe,
    retryPreload() {
      preloaded = false
      retryRequested = true
    },
    shouldOpen(snapshot) {
      return observe(snapshot).trigger
    }
  }
}
