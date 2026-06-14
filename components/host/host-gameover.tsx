"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Game, Team } from "@/lib/types"
import { rpcNextClassification } from "@/lib/rpc"
import { toast } from "sonner"
import { XCircle, ArrowRight, Loader2, Home } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"

export function HostGameover({ game, teams }: { game: Game; teams: Team[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const failedTeam = teams.find((t) => t.id === game.current_team_id) ?? null

  const remaining = teams.filter(
    (t) => !game.eliminated_team_ids.includes(t.id),
  )

  async function handleNext() {
    setLoading(true)
    try {
      await rpcNextClassification(game.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <SiteLogo className="size-10" />
      <XCircle className="size-20 text-destructive" />
      <div className="space-y-3">
        <h1 className="text-balance text-4xl font-extrabold">
          {failedTeam?.name} quedó eliminado
        </h1>
        <p className="text-pretty text-lg text-muted-foreground leading-relaxed">
          Respuesta incorrecta. Conserva {failedTeam?.score ?? 0} puntos.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Puntajes
        </p>
        <ul className="space-y-2">
          {[...teams]
            .sort((a, b) => b.score - a.score)
            .map((t) => {
              const out = game.eliminated_team_ids.includes(t.id)
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between text-base"
                  data-out={out}
                >
                  <span className={out ? "text-muted-foreground line-through" : ""}>
                    {t.name}
                  </span>
                  <span className="font-bold tabular-nums">{t.score}</span>
                </li>
              )
            })}
        </ul>
      </div>

      {remaining.length > 0 ? (
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ArrowRight className="size-5" />
          )}
          Siguiente ronda de clasificación
        </button>
      ) : (
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center justify-center gap-2 rounded-2xl bg-secondary px-8 py-4 text-lg font-bold text-secondary-foreground transition hover:bg-accent"
        >
          <Home className="size-5" />
          Finalizar y volver al inicio
        </button>
      )}
    </div>
  )
}
