'use client'

import { useEffect, useRef, useState } from 'react'

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) return

    audio.volume = 0.1

    audio.play()
      .then(() => setPlaying(true))
      .catch((err) => {
        console.log('Autoplay bloqueado:', err)
      })
  }, [])

  const toggleMusic = async () => {
    const audio = audioRef.current

    if (!audio) return

    if (audio.paused) {
      await audio.play()
      setPlaying(true)
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <audio ref={audioRef} loop preload="auto">
        <source src="/harry potter musica.mp3" type="audio/mpeg" />
      </audio>

      <button
        onClick={toggleMusic}
        className="fixed bottom-4 right-4 z-50 rounded-lg border bg-background px-4 py-2 shadow-lg"
      >
        {playing ? '🔊 Música ON' : '🔇 Música OFF'}
      </button>
    </>
  )
}