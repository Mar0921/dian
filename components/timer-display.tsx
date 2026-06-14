"use client"

import { useEffect, useMemo, useState } from "react"
import { Timer } from "lucide-react"

interface TimerDisplayProps {
  questionDeadline: string | null
  defaultSeconds?: number
  className?: string
}

function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.ceil(totalSeconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, "0")}`
}

export function TimerDisplay({
  questionDeadline,
  defaultSeconds,
  className = "",
}: TimerDisplayProps) {
  const [now, setNow] = useState(() => Date.now())
  const [startedAt, setStartedAt] = useState<number | null>(null)

  useEffect(() => {
    if (questionDeadline) {
      setStartedAt(new Date(questionDeadline).getTime())
    } else if (defaultSeconds) {
      setStartedAt(Date.now())
    } else {
      setStartedAt(null)
    }
  }, [questionDeadline, defaultSeconds])

  useEffect(() => {
    if (!startedAt) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [startedAt])

  const secondsLeft = useMemo(() => {
    if (!startedAt) return null
    if (questionDeadline) return (startedAt - now) / 1000
    if (defaultSeconds) return defaultSeconds - (now - startedAt) / 1000
    return null
  }, [startedAt, now, questionDeadline, defaultSeconds])

  if (startedAt === null || secondsLeft === null || secondsLeft <= 0) return null

  const urgent = secondsLeft <= 15

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold tabular-nums ${
        urgent
          ? "border-destructive/60 bg-destructive/10 text-destructive animate-pulse"
          : "border-border bg-secondary text-foreground"
      } ${className}`}
    >
      <Timer className={`size-4 ${urgent ? "text-destructive" : "text-muted-foreground"}`} />
      {formatTime(secondsLeft)}
    </div>
  )
}
