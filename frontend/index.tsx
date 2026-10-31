import { useEffect, useMemo, useRef, useState } from 'react'
import { reportCaughtError, usePlayer, usePluginWindows } from '@nonsplayer/plugin-sdk'
import { createTriggerGuard, isTargetTrack } from './trigger.mjs'

const VIDEO_URL = new URL('./assets/genshen-start.mp4', import.meta.url).href
const WINDOW_OPTIONS = () => {
  const screen = window.screen as Screen & { availLeft?: number; availTop?: number }
  return {
    title: 'genshin-start',
    width: screen.width,
    height: screen.height,
    x: screen.availLeft ?? 0,
    y: screen.availTop ?? 0,
    decorations: false,
    alwaysOnTop: true
  }
}

export function GenshinStartTrigger() {
  const player = usePlayer()
  const windows = usePluginWindows()
  const guard = useMemo(() => createTriggerGuard(), [])
  const pending = useRef<Promise<void> | null>(null)
  const generation = useRef(0)
  const preloaded = useRef(false)

  useEffect(() => {
    const { preload, trigger, cancelPreload, reset } = guard.observe(player)
    if (reset || cancelPreload) generation.current += 1
    const currentGeneration = generation.current
    let cleanup = Promise.resolve()

    if (cancelPreload) {
      preloaded.current = false
      if (!pending.current) {
        cleanup = windows.close('cutscene').catch((cause) => {
          reportCaughtError('genshin-start.window.cancel-preload', cause)
        })
      }
    }

    if ((preload || trigger) && !preloaded.current && !pending.current) {
      const opening = cleanup
        .then(() => {
          if (generation.current !== currentGeneration) return
          return windows.open('cutscene', { ...WINDOW_OPTIONS(), ...{ visible: false } })
        })
        .then(() => {
          if (generation.current !== currentGeneration) {
            guard.retryPreload()
            return windows.close('cutscene')
          }
          preloaded.current = true
        })
        .catch((cause) => {
          preloaded.current = false
          guard.retryPreload()
          reportCaughtError('genshin-start.window.preload', cause)
        })
        .finally(() => {
          if (pending.current === opening) pending.current = null
        })
      pending.current = opening
    }
  }, [guard, player, windows])

  return null
}

export function CutsceneWindow() {
  const player = usePlayer()
  const windows = usePluginWindows()
  const guard = useMemo(() => createTriggerGuard(), [])
  const video = useRef<HTMLVideoElement>(null)
  const startRequested = useRef(false)
  const startPending = useRef(false)
  const started = useRef(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const element = video.current
    if (!element) return

    element.muted = true
    element.controls = false
    element.load()

    return () => {
      element.pause()
    }
  }, [])

  async function start() {
    const element = video.current
    if (!element || started.current || startPending.current || !startRequested.current) return

    startPending.current = true
    try {
      await element.play()
      started.current = true
      await windows.show('cutscene')
    } catch (cause) {
      startPending.current = false
      reportCaughtError('genshin-start.video.play', cause)
      setFailed(true)
      void windows
        .show('cutscene')
        .catch((showCause) => reportCaughtError('genshin-start.window.show-fallback', showCause))
    }
  }

  useEffect(() => {
    const result = guard.observe(player)
    const reachedTargetWhilePlaying =
      player.status === 'playing' && player.positionMs >= 79_000 && isTargetTrack(player.track)
    if (!result.trigger && !reachedTargetWhilePlaying) return
    startRequested.current = true
    void start()
  }, [guard, player, windows])

  function close() {
    void windows
      .close('cutscene')
      .catch((cause) => reportCaughtError('genshin-start.window.close', cause))
  }

  return (
    <main
      onKeyDown={(event) => {
        if (event.key === 'Escape') close()
      }}
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
        margin: 0,
        padding: 0
      }}
    >
      <video
        ref={video}
        muted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        src={VIDEO_URL}
        onCanPlay={() => void start()}
        onEnded={close}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          border: 'none',
          outline: 'none'
        }}
      />
      {failed && (
        <button
          onClick={() => void start()}
          style={{ position: 'absolute', inset: 'auto 1rem 1rem', zIndex: 1 }}
        >
          点击开始播放
        </button>
      )}
    </main>
  )
}
