"use client"

import { useGameState } from "@/lib/use-game-state"
import { HostLobby } from "./host-lobby"
import { HostClassification } from "./host-classification"
import { HostMain } from "./host-main"
import { HostGameover } from "./host-gameover"
import { HostChampion } from "./host-champion"
import { Loader2, ShieldAlert } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"

export function HostScreen({ gameId }: { gameId: string }) {
  const { game, teams, loading, error } = useGameState(gameId)

  if (loading) {
    return (
      <main className="dark flex min-h-dvh items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <SiteLogo className="size-10" />
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  if (error || !game) {
    return (
      <main className="dark flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <SiteLogo className="size-10" />
        <ShieldAlert className="size-12 text-destructive" />
        <h1 className="text-2xl font-bold">No se encontró la sala</h1>
        <p className="text-muted-foreground">
          {error ?? "Es posible que la partida haya finalizado."}
        </p>
      </main>
    )
  }

  return (
    <main className="dark min-h-dvh bg-background text-foreground">
      {game.status === "lobby" && <HostLobby game={game} teams={teams} />}
      {(game.status === "classification" ||
        game.status === "classification_answer") && (
        <HostClassification game={game} teams={teams} />
      )}
      {game.status === "main" && <HostMain game={game} teams={teams} />}
      {game.status === "gameover" && <HostGameover game={game} teams={teams} />}
      {(game.status === "champion" || game.status === "finished") && (
        <HostChampion game={game} teams={teams} />
      )}
    </main>
  )
}
