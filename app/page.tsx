import Link from "next/link"
import { MonitorPlay, Smartphone, Settings, Trophy } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"

export default function HomePage() {
  return (
    <main className="dark min-h-dvh bg-background text-foreground flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-3xl flex flex-col items-center text-center gap-1">
          <SiteLogo className="size-16" />

          <div className="space-y-1">
            <h2 className="mt-0 text-balance text-4xl font-extrabold sm:text-5xl">
              El reto de la integridad 
            </h2>
            <p className="text-pretty mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
              Un juego de trivia multijugador en tiempo real sobre transparencia,
              ética y lucha contra la corrupción. Compite con tu equipo y escala la
              tabla de puntos.
            </p>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2">
            <Link
              href="/host"
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-6 text-left transition hover:border-primary hover:bg-accent"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MonitorPlay className="size-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold">Pantalla principal</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Para el moderador. Proyecta el juego y crea la sala.
                </p>
              </div>
            </Link>

            <Link
              href="/play"
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-6 text-left transition hover:border-primary hover:bg-accent"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-gold text-gold-foreground">
                <Smartphone className="size-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold">Unirme con mi equipo</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Desde tu celular. Ingresa el PIN de la sala.
                </p>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
            >
              <Settings className="size-4" />
              Panel de preguntas
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/history"
              className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
            >
              <Trophy className="size-4" />
              Historial de partidas
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
