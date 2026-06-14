"use client"

import { cn } from "@/lib/utils"
import type { Letter } from "@/lib/types"
import { Check, X } from "lucide-react"

const OPTION_BG: Record<Letter, string> = {
  A: "bg-option-a",
  B: "bg-option-b",
  C: "bg-option-c",
  D: "bg-option-d",
}

interface AnswerOptionProps {
  letter: Letter
  text: string
  onClick?: () => void
  disabled?: boolean
  /** dimmed because removed by 50/50 */
  hidden?: boolean
  /** reveal state */
  reveal?: "correct" | "wrong" | null
  selected?: boolean
  size?: "sm" | "lg"
}

export function AnswerOption({
  letter,
  text,
  onClick,
  disabled,
  hidden,
  reveal,
  selected,
  size = "lg",
}: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || hidden}
      aria-label={`Opción ${letter}: ${text}`}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-2xl text-left font-semibold text-white shadow-lg transition",
        OPTION_BG[letter],
        size === "lg" ? "gap-4 p-5 text-xl sm:text-2xl" : "p-4 text-base",
        hidden && "pointer-events-none bg-muted text-muted-foreground grayscale shadow-none",
        reveal === "correct" && "ring-4 ring-white scale-[1.02]",
        reveal === "wrong" && "opacity-50",
        selected && !reveal && "ring-4 ring-white",
        !disabled && !hidden && "hover:brightness-110 active:scale-[0.98] cursor-pointer",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-white/25 font-extrabold",
          size === "lg" ? "size-12 text-2xl" : "size-9 text-lg",
        )}
      >
        {letter}
      </span>
      <span className="flex-1 leading-tight">{text}</span>
      {reveal === "correct" && (
        <Check className={cn("shrink-0", size === "lg" ? "size-8" : "size-6")} />
      )}
      {reveal === "wrong" && (
        <X className={cn("shrink-0", size === "lg" ? "size-8" : "size-6")} />
      )}
    </button>
  )
}
