"use client"

import { cn } from "@/lib/utils"
import { POINTS_LADDER } from "@/lib/types"

interface PointsLadderProps {
  /** index of the question currently being played (0-4) */
  currentIndex: number
  className?: string
}

export function PointsLadder({ currentIndex, className }: PointsLadderProps) {
  return (
    <div className={cn("flex flex-col-reverse gap-1.5", className)}>
      {POINTS_LADDER.map((pts, i) => {
        const isCurrent = i === currentIndex
        const isPast = i < currentIndex
        return (
          <div
            key={pts}
            className={cn(
              "flex items-center justify-between rounded-lg px-4 py-2 text-sm font-bold transition",
              isCurrent && "bg-gold text-gold-foreground scale-105 shadow-lg",
              isPast && "bg-primary/25 text-primary",
              !isCurrent && !isPast && "bg-card text-muted-foreground",
            )}
          >
            <span>Pregunta {i + 1}</span>
            <span>{pts} pts</span>
          </div>
        )
      })}
    </div>
  )
}
