import assert from 'node:assert/strict'
import test from 'node:test'
import { createTriggerGuard, isTargetTrack } from '../frontend/trigger.mjs'

const target = {
  title: 'Shed a Light',
  artist: 'Robin Schulz / David Guetta / Cheat Codes',
  album: 'Uncovered',
  durationMs: 187_000
}

test('matches the requested title and all artists independent of artist separators', () => {
  assert.equal(isTargetTrack(target), true)
  assert.equal(
    isTargetTrack({ ...target, artist: 'Robin Schulz, David Guetta & Cheat Codes' }),
    true
  )
  assert.equal(isTargetTrack({ ...target, artist: 'Robin Schulz / David Guetta' }), false)
  assert.equal(isTargetTrack({ ...target, title: 'Shed a Light (Remix)' }), false)
})

test('preloads once at 69 seconds and retries after a failed preload', () => {
  const guard = createTriggerGuard()
  assert.equal(
    guard.observe({ track: target, status: 'playing', positionMs: 68_900 }).preload,
    false
  )
  assert.equal(
    guard.observe({ track: target, status: 'playing', positionMs: 69_000 }).preload,
    true
  )
  assert.equal(
    guard.observe({ track: target, status: 'playing', positionMs: 69_300 }).preload,
    false
  )

  guard.retryPreload()
  assert.equal(
    guard.observe({ track: target, status: 'playing', positionMs: 69_400 }).preload,
    true
  )
})

test('preloads when first observed after 69 seconds and cancels on track changes or seeks back', () => {
  const late = createTriggerGuard()
  assert.equal(late.observe({ track: target, status: 'playing', positionMs: 74_000 }).preload, true)

  const changed = late.observe({
    track: { ...target, title: 'Other' },
    status: 'playing',
    positionMs: 74_100
  })
  assert.equal(changed.cancelPreload, true)

  const seek = createTriggerGuard()
  assert.equal(seek.observe({ track: target, status: 'playing', positionMs: 69_000 }).preload, true)
  assert.equal(
    seek.observe({ track: target, status: 'playing', positionMs: 65_000 }).cancelPreload,
    true
  )
})

test('opens once when the target track crosses 79 seconds while playing', () => {
  const guard = createTriggerGuard()
  const snapshot = { track: target, status: 'playing', positionMs: 78_900 }

  assert.equal(guard.shouldOpen(snapshot), false)
  assert.equal(guard.shouldOpen({ track: target, status: 'playing', positionMs: 79_000 }), true)
  assert.equal(guard.shouldOpen({ ...snapshot, positionMs: 79_250 }), false)
})

test('does not trigger when first observed after the target point and waits if crossed while paused', () => {
  const late = createTriggerGuard()
  assert.equal(late.shouldOpen({ track: target, status: 'playing', positionMs: 90_000 }), false)

  const paused = createTriggerGuard()
  assert.equal(paused.shouldOpen({ track: target, status: 'paused', positionMs: 78_900 }), false)
  assert.equal(paused.shouldOpen({ track: target, status: 'paused', positionMs: 79_000 }), false)
  assert.equal(paused.shouldOpen({ track: target, status: 'playing', positionMs: 79_000 }), true)
})

test('remains closed after triggering until playback restarts', () => {
  const guard = createTriggerGuard()
  const snapshot = { track: target, status: 'playing', positionMs: 78_900 }

  assert.equal(guard.shouldOpen(snapshot), false)
  assert.equal(guard.shouldOpen({ ...snapshot, positionMs: 79_000 }), true)
  assert.equal(guard.shouldOpen({ ...snapshot, positionMs: 79_250 }), false)
})

test('waits for resume and resets when the track changes or restarts', () => {
  const guard = createTriggerGuard()
  assert.equal(guard.shouldOpen({ track: target, status: 'paused', positionMs: 79_000 }), false)
  assert.equal(guard.shouldOpen({ track: target, status: 'playing', positionMs: 79_000 }), true)
  assert.equal(guard.shouldOpen({ track: target, status: 'playing', positionMs: 0 }), false)
  assert.equal(guard.shouldOpen({ track: target, status: 'playing', positionMs: 79_000 }), true)
  assert.equal(
    guard.shouldOpen({
      track: { ...target, title: 'Other' },
      status: 'playing',
      positionMs: 79_000
    }),
    false
  )
  assert.equal(guard.shouldOpen({ track: target, status: 'playing', positionMs: 78_900 }), false)
  assert.equal(guard.shouldOpen({ track: target, status: 'playing', positionMs: 79_000 }), true)
})
