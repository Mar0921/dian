"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { Game, Team } from "@/lib/types"
import { Trophy, Home, Medal, Loader2 } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"
import { toast } from "sonner"

export function HostChampion({ game, teams }: { game: Game; teams: Team[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const savedRef = useRef(false)
  const winner = teams.find((t) => t.id === game.winner_team_id) ?? null
  const ranking = [...teams].sort((a, b) => b.score - a.score)

  useEffect(() => {
    if (!["champion", "finished"].includes(game.status) || savedRef.current) {
      return
    }

    const controller = new AbortController()
    let active = true

    async function saveResult() {
      setSaving(true)

      try {
        const response = await fetch("/api/game-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: game.id }),
          signal: controller.signal,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error ?? "Error guardando resultado")
        }

        if (result.saved) {
          savedRef.current = true
        }
      } catch (error) {
        if (active) {
          console.error(error)
          toast.error("No se pudo guardar el resultado en el historial")
        }
      } finally {
        if (active) {
          setSaving(false)
        }
      }
    }

    saveResult()

    return () => {
      active = false
      controller.abort()
    }
  }, [game.id, game.status])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <div className="animate-pop-in flex flex-col items-center gap-4">
        <SiteLogo className="size-10" />
        <span className="flex size-24 items-center justify-center rounded-full bg-gold text-gold-foreground">
          <Trophy className="size-12" />
        </span>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
          ¡Equipo campeón!
        </p>
        <h1 className="text-balance text-5xl font-extrabold sm:text-6xl">
          {winner?.name ?? "—"}
        </h1>
        <p className="text-pretty max-w-md text-lg text-muted-foreground leading-relaxed">
          ¡Completó las 5 preguntas y demostró su compromiso con la integridad!
          Total: <span className="font-bold text-foreground">{winner?.score ?? 0} pts</span>
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5">
        <p className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Medal className="size-4" />
          Clasificación final
        </p>
        <ul className="space-y-2">
          {ranking.map((t, i) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-lg bg-secondary px-4 py-2 text-base"
            >
              <span className="flex items-center gap-3">
                <span className="font-bold text-muted-foreground">{i + 1}.</span>
                {t.name}
              </span>
              <span className="font-bold tabular-nums">{t.score}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.99]"
      >
        {saving ? <Loader2 className="size-5 animate-spin" /> : <Home className="size-5" />}
        Volver al inicio
      </button>
      {saving && (
        <p className="text-sm text-muted-foreground">
          Guardando resultado en el historial...
        </p>
      )}
    </div>
  )
}
