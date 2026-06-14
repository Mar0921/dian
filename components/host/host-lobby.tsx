"use client"

import { useState } from "react"
import type { Game, Team } from "@/lib/types"
import { TEAM_COLORS } from "@/lib/types"
import { rpcStartGame } from "@/lib/rpc"
import { toast } from "sonner"
import { Users, Loader2, Play } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"

export function HostLobby({ game, teams }: { game: Game; teams: Team[] }) {
  const [starting, setStarting] = useState(false)

  async function handleStart() {
    setStarting(true)
    try {
      await rpcStartGame(game.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo iniciar")
      setStarting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center gap-3">
        <SiteLogo className="size-8" />
        <div>
          <h1 className="text-xl font-bold leading-none">Sala de espera</h1>
        </div>
      </header>

      <div className="grid flex-1 gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* PIN panel */}
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-card p-8 text-center">
          <p className="text-lg text-muted-foreground">
            Ingresa en <span className="font-semibold text-foreground">este sitio</span> y
            escribe el PIN:
          </p>
          <div className="rounded-3xl bg-primary px-8 py-6">
            <p className="font-mono text-6xl font-extrabold tracking-[0.2em] text-primary-foreground sm:text-7xl">
              {game.pin}
            </p>
          </div>
          <p className="text-pretty text-sm text-muted-foreground leading-relaxed">
            Abre la opción <span className="font-semibold">“Unirme con mi equipo”</span> en
            tu celular para participar.
          </p>
        </div>

        {/* Teams */}
        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <h2 className="text-lg font-bold">Equipos conectados</h2>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
              {teams.length} / {game.max_teams}
            </span>
          </div>

          {teams.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">
              <p>Esperando a que los equipos se unan…</p>
            </div>
          ) : (
            <ul className="grid flex-1 content-start gap-3 sm:grid-cols-2">
              {teams.map((team, i) => (
                <li
                  key={team.id}
                  className="animate-pop-in flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3"
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: TEAM_COLORS[i % TEAM_COLORS.length] }}
                  >
                    {team.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate font-semibold">{team.name}</span>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={handleStart}
            disabled={starting || teams.length < 2}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gold px-6 py-4 text-lg font-bold text-gold-foreground transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Play className="size-5" />
            )}
            {teams.length < 2 ? "Se necesitan al menos 2 equipos" : "Iniciar juego"}
          </button>
        </div>
      </div>
    </div>
  )
}
