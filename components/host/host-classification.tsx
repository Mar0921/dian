"use client"

import type { Game, Team, Letter } from "@/lib/types"
import { LETTERS, TEAM_COLORS } from "@/lib/types"
import { useQuestion } from "@/lib/use-question"
import { AnswerOption } from "@/components/answer-option"
import { TimerDisplay } from "@/components/timer-display"
import { Zap, Hand } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"

export function HostClassification({
  game,
  teams,
}: {
  game: Game
  teams: Team[]
}) {
  const question = useQuestion(game.classification_question_id)
  const buzzer = teams.find((t) => t.id === game.buzzer_team_id) ?? null
  const isAnswering = game.status === "classification_answer"
  const reveal = game.reveal_correct
  const lastWrong = game.last_answer_correct === false

  const activeTeams = teams.filter(
    (t) => !(game.eliminated_team_ids ?? []).includes(t.id),
  )

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-white">
          <Zap className="mr-2 inline size-4" />
          Ronda de clasificación
        </div>
        <div className="flex items-center gap-3">
          <TimerDisplay questionDeadline={game.question_deadline} defaultSeconds={60} />
          <SiteLogo className="size-8" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        ¡Presiona el buzzer en tu celular para responder!
      </p>

      {/* Buzzer status banner */}
      <div className="flex min-h-16 items-center justify-center rounded-2xl border border-border bg-card px-6 py-3 text-center">
        {isAnswering && buzzer ? (
          <p className="flex items-center gap-2 text-xl font-bold">
            <Hand className="size-6 text-primary" />
            <span
              className="rounded-lg px-3 py-1 text-white"
              style={{
                backgroundColor:
                  TEAM_COLORS[
                    activeTeams.findIndex((t) => t.id === buzzer.id) %
                      TEAM_COLORS.length
                  ],
              }}
            >
              {buzzer.name}
            </span>
            está respondiendo…
          </p>
        ) : lastWrong && reveal ? (
          <p className="text-lg font-semibold text-destructive">
            Respuesta incorrecta. ¡El buzzer está libre de nuevo!
          </p>
        ) : (
          <p className="animate-pulse text-lg font-semibold text-white">
            Buzzer abierto — ¡el primero en presionar responde!
          </p>
        )}
      </div>

      {/* Question */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex min-h-28 items-center justify-center rounded-3xl border border-border bg-card p-6 text-center">
          <h1 className="text-balance text-2xl font-bold leading-snug sm:text-3xl">
            {question?.pregunta ?? (game.classification_question_id ? "Cargando pregunta…" : "Esperando pregunta…")}
          </h1>
        </div>

        {question && (
          <div className="grid gap-3 sm:grid-cols-2">
            {LETTERS.map((letter) => (
              <AnswerOption
                key={letter}
                letter={letter}
                text={question.opciones[letter]}
                disabled
                reveal={
                  reveal
                    ? reveal === letter
                      ? "correct"
                      : "wrong"
                    : null
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Team chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {activeTeams.map((t, i) => {
          const failed = Array.isArray(game.classification_failed_ids) && game.classification_failed_ids.includes(t.id)
          return (
            <span
              key={t.id}
              className="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-white data-[failed=true]:opacity-40"
              data-failed={failed}
              style={{ backgroundColor: TEAM_COLORS[i % TEAM_COLORS.length] }}
            >
              {t.name}
              <span className="rounded-full bg-white/25 px-1.5 text-xs">
                {t.score}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
