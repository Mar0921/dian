"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft, Minus, Plus } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"
import { rpcCreateGame } from "@/lib/rpc"
import { toast } from "sonner"

export default function HostSetupPage() {
  const router = useRouter()
  const [maxTeams, setMaxTeams] = useState(4)
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    setCreating(true)
    try {
      const { game_id, game_pin } = await rpcCreateGame(maxTeams)
      router.push(`/host/${game_id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear la sala")
      setCreating(false)
    }
  }

  return (
    <main className="dark min-h-dvh bg-background text-foreground flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Inicio
        </Link>

        <div className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 text-center">
          <SiteLogo className="size-16" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Nueva sala de juego</h1>
            <p className="text-pretty text-sm text-muted-foreground leading-relaxed">
              Crea la sala desde la pantalla que vas a proyectar. Los equipos se
              unirán con el PIN.
            </p>
          </div>

          <div className="w-full space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Número máximo de equipos
            </p>
            <div className="flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => setMaxTeams((n) => Math.max(2, n - 1))}
                className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-accent disabled:opacity-40"
                disabled={maxTeams <= 2}
                aria-label="Menos equipos"
              >
                <Minus className="size-5" />
              </button>
              <span className="w-12 text-center text-4xl font-extrabold tabular-nums">
                {maxTeams}
              </span>
              <button
                type="button"
                onClick={() => setMaxTeams((n) => Math.min(6, n + 1))}
                className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-accent disabled:opacity-40"
                disabled={maxTeams >= 6}
                aria-label="Más equipos"
              >
                <Plus className="size-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Entre 2 y 6 equipos</p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
          >
            {creating ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Creando…
              </>
            ) : (
              "Crear sala"
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
