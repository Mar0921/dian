"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"
import { rpcJoinGame } from "@/lib/rpc"
import { toast } from "sonner"

export default function JoinGamePage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [name, setName] = useState("")
  const [joining, setJoining] = useState(false)

  async function handleJoin() {
    if (!pin || !name) return
    setJoining(true)
    console.log("Intentando unir con PIN:", pin, "nombre:", name)
    try {
      const result = await rpcJoinGame(pin, name)
      console.log("Resultado RPC:", result)
      if (!result || !result.team_uuid) {
        throw new Error("Respuesta vacía del servidor")
      }
      router.push(`/play/${result.team_uuid}`)
    } catch (err) {
      console.error("Error al unir:", err)
      toast.error(err instanceof Error ? err.message : "No se pudo unir al equipo")
      setJoining(false)
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
            <h1 className="text-2xl font-bold">Unirme con mi equipo</h1>
            <p className="text-pretty text-sm text-muted-foreground leading-relaxed">
              Ingresa el PIN de la sala y el nombre de tu equipo.
            </p>
          </div>

          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                PIN de la sala
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="123456"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-center font-mono text-2xl tracking-widest"
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Nombre del equipo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Los Guardianes"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleJoin}
            disabled={joining || !pin || !name}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
          >
            {joining ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Uniendo...
              </>
            ) : (
              "Unirme"
            )}
          </button>
        </div>
      </div>
    </main>
  )
}