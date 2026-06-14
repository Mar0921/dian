"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { QuestionPublic, Options } from "@/lib/types"

const cache = new Map<string, QuestionPublic>()

type QuestionRow = {
  id: string
  tipo: "quick" | "main"
  pregunta: string
  opciones: unknown
  activa: boolean
  created_at: string
}

function transformOptions(raw: unknown): Options {
  if (!raw || typeof raw !== 'object') {
    return { A: "", B: "", C: "", D: "" }
  }
  const obj = raw as Record<string, unknown>
  return {
    A: (obj.A as string) ?? "",
    B: (obj.B as string) ?? "",
    C: (obj.C as string) ?? "",
    D: (obj.D as string) ?? "",
  }
}

/** Loads a single question from the public view (no correct answer exposed). */
export function useQuestion(questionId: string | null | undefined, questionType?: string) {
  const [question, setQuestion] = useState<QuestionPublic | null>(
    questionId ? cache.get(questionId) ?? null : null,
  )
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    if (!questionId) {
      setQuestion(null)
      return
    }
    const cached = cache.get(questionId)
    if (cached) {
      setQuestion(cached)
      return
    }
    let active = true
    // Try questions_public first, then questions
    supabaseRef.current
      .from("questions_public")
      .select("*")
      .eq("id", questionId)
      .single()
      .then(({ data }: { data: QuestionRow | null }) => {
        if (!active) return
        if (data) {
          const transformed: QuestionPublic = {
            id: data.id,
            tipo: data.tipo,
            pregunta: data.pregunta,
            opciones: transformOptions(data.opciones),
            activa: data.activa,
            created_at: data.created_at,
          }
          cache.set(questionId, transformed)
          setQuestion(transformed)
        } else {
          // Fallback to questions table
          supabaseRef.current
            .from("questions")
            .select("*")
            .eq("id", questionId)
              .single()
              .then(({ data }: { data: QuestionRow | null }) => {
                if (active && data) {
                const transformed: QuestionPublic = {
                  id: data.id,
                  tipo: data.tipo,
                  pregunta: data.pregunta,
                  opciones: transformOptions(data.opciones),
                  activa: data.activa,
                  created_at: data.created_at,
                }
                cache.set(questionId, transformed)
                setQuestion(transformed)
              }
            })
        }
      })
    return () => {
      active = false
    }
  }, [questionId])

  return question
}
