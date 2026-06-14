"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Game, Team } from "@/lib/types"

interface UseGameStateResult {
  game: Game | null
  teams: Team[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Subscribes to a single game row and its teams via Supabase Realtime.
 * Falls back to periodic polling so state stays fresh even if a
 * realtime event is missed.
 */
export function useGameState(gameId: string | null): UseGameStateResult {
  const [game, setGame] = useState<Game | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())

  const refresh = useCallback(async () => {
    if (!gameId) return
    const supabase = supabaseRef.current
    const [{ data: g, error: gErr }, { data: t }] = await Promise.all([
      supabase.from("games").select("*").eq("id", gameId).single(),
      supabase.from("teams").select("*").eq("game_id", gameId).order("created_at"),
    ])
    if (gErr) {
      setError(gErr.message)
    } else {
      setGame(g as unknown as Game)
      setError(null)
    }
    if (t) setTeams(t as unknown as Team[])
    setLoading(false)
  }, [gameId])

  useEffect(() => {
    if (!gameId) return
    const supabase = supabaseRef.current
    refresh()

    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload: { eventType: string; new?: Game }) => {
          if (payload.eventType === "DELETE") setGame(null)
          else if (payload.new) setGame(payload.new)
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams", filter: `game_id=eq.${gameId}` },
        () => {
          // team rows change shape less predictably (scores, buzz) — re-pull list
          supabase
            .from("teams")
            .select("*")
            .eq("game_id", gameId)
            .order("created_at")
            .then(({ data }: { data: Team[] | null }) => {
              if (data) setTeams(data as unknown as Team[])
            })
        },
      )
      .subscribe()

    // safety-net polling every 4s
    const interval = setInterval(refresh, 4000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [gameId, refresh])

  return { game, teams, loading, error, refresh }
}
