"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Hash } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { SiteLogo } from "@/components/site-logo"

type GameResult = {
  id: string
  pin: string
  winner_name: string
  winner_score: number
  teams: {
    name: string
    score: number
  }[]
  played_at: string
}

export default function HistoryPage() {
  const [games, setGames] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadHistory = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("game_results")
        .select("*")
        .order("played_at", { ascending: false })

      if (error) {
        console.error(error)
        setError(error.message)
      } else {
        setGames((data as GameResult[]) || [])
      }

      setLoading(false)
    }

    loadHistory()
  }, [])

  return (
    <main className="dark min-h-dvh bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-5 py-12">
        <div className="flex items-center gap-3 mb-8">
          <SiteLogo className="size-8" />

          <div>
            <h1 className="text-2xl font-bold">
              Historial de partidas
            </h1>
            <p className="text-sm text-muted-foreground">
              {games.length} partidas registradas
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="size-4" />
          Inicio
        </Link>

        {loading ? (
          <div className="text-muted-foreground">
            Cargando historial...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
            <p className="font-semibold text-destructive">
              Error al cargar historial
            </p>
            <p className="text-sm mt-1">
              {error}
            </p>
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-xl border p-6 text-center text-muted-foreground">
            No hay partidas registradas.
          </div>
        ) : (
          <div className="space-y-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="rounded-2xl border bg-card p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      <Hash className="size-4" />
                      PIN: {game.pin}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="size-4" />
                      {new Date(game.played_at).toLocaleString("es-CO")}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg text-primary">
                      🏆 {game.winner_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {game.winner_score} puntos
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">
                    Equipos
                  </h3>

                  <div className="space-y-2">
                    {Array.isArray(game.teams) &&
                      [...game.teams]
                        .sort((a, b) => b.score - a.score)
                        .map((team, index) => (
                          <div
                            key={`${team.name}-${index}`}
                            className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-2"
                          >
                            <span>
                              #{index + 1} {team.name}
                            </span>

                            <span className="font-semibold">
                              {team.score} pts
                            </span>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}