"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Letter, QuestionFull } from "@/lib/types"
import { SiteLogo } from "@/components/site-logo"

export default function AdminPage() {
  const [questions, setQuestions] = useState<QuestionFull[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("tipo")

      if (error) {
        console.error("Error al cargar preguntas:", error)
        setError(error.message)
      } else if (data) {
        setQuestions(data)
      }
      setLoading(false)
    }

    fetchQuestions()
  }, [])

  const quickQuestions = questions.filter((q) => q.tipo === "quick")
  const mainQuestions = questions.filter((q) => q.tipo === "main")

  return (
    <main className="dark min-h-dvh bg-background text-foreground flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <SiteLogo className="size-8" />
            <h1 className="text-2xl font-bold">Panel de preguntas</h1>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground w-fit"
          >
            <ArrowLeft className="size-4" />
            Inicio
          </Link>

          <div className="space-y-6">
            {loading ? (
              <p className="text-muted-foreground">Cargando preguntas...</p>
            ) : error ? (
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
                <p className="font-semibold text-destructive">Error al cargar preguntas</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            ) : questions.length === 0 ? (
              <p className="text-muted-foreground">No hay preguntas registradas.</p>
            ) : (
              <>
                <h2 className="text-lg font-semibold">
                  Preguntas de clasificación (Quick) — {quickQuestions.length}
                </h2>
                <div className="space-y-3">
                  {quickQuestions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-border bg-card p-4">
                      <p className="font-medium">{q.pregunta}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        {(Object.keys(q.opciones) as Letter[]).map((letter) => (
                          <span key={letter} className={q.correcta === letter ? "text-primary font-semibold" : "text-muted-foreground"}>
                            {letter}. {q.opciones[letter]}
                          </span>
                        ))}
                      </div>
                      <span className="mt-2 inline-block text-xs bg-secondary px-2 py-1 rounded">Activa: {q.activa ? "Sí" : "No"}</span>
                    </div>
                  ))}
                </div>

                <h2 className="text-lg font-semibold">
                  Preguntas de integridad (Main) — {mainQuestions.length}
                </h2>
                <div className="space-y-3">
                  {mainQuestions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-border bg-card p-4">
                      <p className="font-medium">{q.pregunta}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        {(Object.keys(q.opciones) as Letter[]).map((letter) => (
                          <span key={letter} className={q.correcta === letter ? "text-primary font-semibold" : "text-muted-foreground"}>
                            {letter}. {q.opciones[letter]}
                          </span>
                        ))}
                      </div>
                      <span className="mt-2 inline-block text-xs bg-secondary px-2 py-1 rounded">Activa: {q.activa ? "Sí" : "No"}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}