"use client"

import type { Game, Team } from "@/lib/types"
import { LETTERS, POINTS_LADDER, TEAM_COLORS } from "@/lib/types"
import { useQuestion } from "@/lib/use-question"
import { AnswerOption } from "@/components/answer-option"
import { PointsLadder } from "@/components/points-ladder"
import { TimerDisplay } from "@/components/timer-display"
import { Crown, Users2, BarChart3 } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"

export function HostMain({ game, teams }: { game: Game; teams: Team[] }) {
  const question = useQuestion(game.current_question_id)
  const currentTeam = teams.find((t) => t.id === game.current_team_id) ?? null
  const idx = game.current_question_index
  const reveal = game.reveal_correct
  const fifty =
    currentTeam?.last_5050_question_id === game.current_question_id
      ? currentTeam?.fifty_options
      : null
  const votes =
    currentTeam?.last_audience_question_id === game.current_question_id
      ? currentTeam?.audience_votes
      : null
  const audiencePollOpen =
    game.audience_question_id === game.current_question_id &&
    !votes

  const teamColor =
    TEAM_COLORS[
      teams.findIndex((t) => t.id === game.current_team_id) % TEAM_COLORS.length
    ] ?? TEAM_COLORS[0]

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <TimerDisplay questionDeadline={game.question_deadline} defaultSeconds={60} className="text-base" />
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            En juego
          </p>
          <p className="text-3xl font-extrabold text-gold">
            {POINTS_LADDER[idx]} pts
          </p>
        </div>
      </div>

      <header className="flex items-center justify-between gap-4">
        <SiteLogo className="size-8" />
        <div className="flex items-center gap-3">
          <Crown className="size-6 text-gold" />
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Turno de
            </p>
            <p
              className="rounded-lg px-3 py-0.5 text-lg font-bold text-white"
              style={{ backgroundColor: teamColor }}
            >
              {currentTeam?.name ?? "—"}
            </p>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_240px]">
        <div className="flex flex-col gap-6">
          <div className="flex min-h-32 items-center justify-center rounded-3xl border border-border bg-card p-6 text-center">
            <h1 className="text-balance text-2xl font-bold leading-snug sm:text-3xl">
              {question?.pregunta ?? "Cargando pregunta…"}
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
                  hidden={!!fifty && !fifty.includes(letter)}
                  reveal={
                    reveal ? (reveal === letter ? "correct" : "wrong") : null
                  }
                />
              ))}
            </div>
          )}

          {/* Audience help visualization */}
          {(votes || audiencePollOpen) && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <BarChart3 className="size-4" />
                Ayuda del público
              </div>

              {!votes && audiencePollOpen ? (
                <p className="text-center text-sm font-semibold text-muted-foreground">
                  Esperando votos de los equipos...
                </p>
              ) : votes ? (
                <div className="flex items-end justify-around gap-3" style={{ height: 120 }}>
                  {LETTERS.map((letter) => (
                    <div key={letter} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-sm font-bold">{votes[letter]}%</span>
                      <div
                        className="w-full rounded-t-md bg-primary transition-all"
                        style={{ height: `${votes[letter]}%`, minHeight: 4 }}
                      />
                      <span className="text-sm font-semibold text-muted-foreground">
                        {letter}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Ladder + scoreboard */}
        <aside className="flex flex-col gap-5">
          <PointsLadder currentIndex={idx} />
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Users2 className="size-4" />
              Puntajes
            </div>
            <ul className="space-y-1.5">
              {[...teams]
                .sort((a, b) => b.score - a.score)
                .map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{t.name}</span>
                    <span className="font-bold tabular-nums">{t.score}</span>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
