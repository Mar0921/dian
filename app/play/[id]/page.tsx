"use client"

import { useGameState } from "@/lib/use-game-state"
import { useQuestion } from "@/lib/use-question"
import { TimerDisplay } from "@/components/timer-display"
import { LETTERS, Letter } from "@/lib/types"
import { AnswerOption } from "@/components/answer-option"
import {
  rpcBuzz,
  rpcAnswerClassification,
  rpcAnswerMain,
  rpcUse5050,
  rpcUseAudience,
  rpcVoteAudience,
  rpcAudienceStatus
} from "@/lib/rpc"

import { Loader2, Hand, Volume2, HelpCircle, BarChart3 } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"
import { useState, useEffect, useMemo, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { use } from "react"


export default function TeamGamePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id: teamId } = use(params) as { id: string }

  const [gameId, setGameId] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)

  // Estado local para bloquear 50/50
  const [used5050, setUsed5050] = useState(false)

  const [hidden5050Options, setHidden5050Options] = useState<Letter[]>([])

  const [usedAudience, setUsedAudience] = useState(false)
  const [audienceVotes, setAudienceVotes] = useState<Record<Letter, number> | null>(null)
  const [votingAudience, setVotingAudience] = useState(false)
  const [audiencePollOpenLocal, setAudiencePollOpenLocal] = useState(false)
  const [audienceResultsLocal, setAudienceResultsLocal] = useState<Record<Letter, number> | null>(null)
  const [audienceVoteSubmitted, setAudienceVoteSubmitted] = useState(false)
  const [audienceVotedTeams, setAudienceVotedTeams] = useState(0)
  const [audienceRequiredVotes, setAudienceRequiredVotes] = useState(0)

  const correctAudioRef = useRef<HTMLAudioElement>(null)
  const incorrectAudioRef = useRef<HTMLAudioElement>(null)

  const previousAnswerRef = useRef<boolean | null>(null)

  // Obtener game_id
  useEffect(() => {

    if (!teamId) return

    createClient()
      .from("teams")
      .select("game_id")
      .eq("id", teamId)
      .single()
      .then(({ data }: { data: { game_id: string } | null }) => {

        if (data) {
          setGameId(data.game_id)
        }

      })

  }, [teamId])


  const {
    game,
    teams,
    loading,
    error
  } = useGameState(gameId)



  useEffect(() => {
    console.log(
      "last_answer_correct =",
      game?.last_answer_correct
    )

    const current = game?.last_answer_correct

    if (
      current === null ||
      current === undefined
    ) {
      return
    }

    if (previousAnswerRef.current === current) {
      return
    }

    previousAnswerRef.current = current

    const audio = current
      ? correctAudioRef.current
      : incorrectAudioRef.current

    console.log("PLAYING", current ? "CORRECT" : "INCORRECT")

    audio?.play().catch(console.error)

  }, [game?.last_answer_correct])



  const question = useQuestion(
    game?.status === "classification" ||
      game?.status === "classification_answer"

      ? game?.classification_question_id

      : game?.current_question_id
  )


  const team = teams.find((t) => t.id === teamId)





  const activeQuestionId =
    game?.status === "classification" ||
      game?.status === "classification_answer"
      ? game.classification_question_id
      : game?.current_question_id

  const hasUsed5050ThisQuestion =
    team?.last_5050_question_id === activeQuestionId &&
    !!team?.fifty_options?.length

  const teamFiftyOptions =
    hasUsed5050ThisQuestion ? team?.fifty_options ?? [] : []

  const audiencePollOpenByTeam =
    teams.some(
      (t) =>
        t.id !== teamId &&
        t.last_audience_question_id === activeQuestionId &&
        !t.audience_votes
    )

  const teamAudienceResult =
    teams.find(
      (t) =>
        t.last_audience_question_id === activeQuestionId &&
        t.audience_votes
    )?.audience_votes ?? null

  const isHiddenBy5050 = useMemo(() => {
    const hidden = new Set<Letter>([
      ...teamFiftyOptions,
      ...hidden5050Options,
    ])

    return (letter: Letter) => hidden.has(letter)
  }, [teamFiftyOptions, hidden5050Options])


  const hasUsedAudienceThisQuestion =
    team?.last_audience_question_id === activeQuestionId

  const audiencePollOpen =
    audiencePollOpenLocal ||
    audiencePollOpenByTeam ||
    (
      game?.audience_question_id === activeQuestionId &&
      !game?.audience_votes
    )

  const audienceResults =
    game?.audience_question_id === activeQuestionId
      ? game?.audience_votes
      : audienceResultsLocal ?? teamAudienceResult

  const teamAudienceVotes =
    audienceResults ??
    (hasUsedAudienceThisQuestion ? team?.audience_votes : null) ??
    audienceVotes


  // Reactivar comodines en nueva pregunta
  useEffect(() => {

    if (!activeQuestionId) return

    setUsed5050(false)
    setHidden5050Options([])
    setAudienceVotes(null)
    setVotingAudience(false)
    setAudiencePollOpenLocal(false)
    setAudienceResultsLocal(null)
    setAudienceVoteSubmitted(false)
    setAudienceVotedTeams(0)
    setAudienceRequiredVotes(0)

  }, [activeQuestionId])


  useEffect(() => {
    if (!audiencePollOpen || !teamId) return

    const refreshAudienceStatus = async () => {
      try {
        const status = await rpcAudienceStatus(teamId)

        setAudiencePollOpenLocal(status.poll_open)
        setAudienceResultsLocal(status.audience_votes)
        setAudienceVotes(status.audience_votes)
        setAudienceVotedTeams(status.voted_teams)
        setAudienceRequiredVotes(status.required_votes)
      } catch {
        // Keep local poll state if status cannot be refreshed.
      }
    }

    refreshAudienceStatus()

    const interval = setInterval(refreshAudienceStatus, 1000)

    return () => clearInterval(interval)
  }, [audiencePollOpen, teamId])



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



  if (error) {

    return (

      <main className="dark flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">

        <SiteLogo className="size-10" />

        <h1 className="text-2xl font-bold">
          Error
        </h1>

        <p className="text-muted-foreground">
          {error}
        </p>

      </main>

    )

  }



  if (!game) {

    return (

      <main className="dark flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">

        <SiteLogo className="size-10" />

        <h1 className="text-2xl font-bold">
          Error
        </h1>

        <p className="text-muted-foreground">
          No se encontró la partida
        </p>

      </main>

    )

  }



  const canBuzz =
    game.status === "classification" &&
    !game.buzzer_team_id


  const isBuzzer =
    game.buzzer_team_id === teamId


  const isCurrentTeam =
    game.current_team_id === teamId

  const canVoteAudience =
    audiencePollOpen && !isCurrentTeam


  const isAnswering =
    isBuzzer ||
    (
      isCurrentTeam &&
      (
        game.status === "main" ||
        game.status === "classification_answer"
      )
    )



  async function handleBuzz() {

    if (!canBuzz) return

    setSubmitting(true)

    try {

      await rpcBuzz(teamId)

    } catch (err) {

      alert(err instanceof Error ? err.message : "Error")

    }

    setSubmitting(false)

  }



  async function handleAnswer(choice: Letter) {


    if (!isAnswering || !game) return


    setSubmitting(true)


    try {


      if (
        game.status === "classification" ||
        game.status === "classification_answer"
      ) {


        await rpcAnswerClassification(
          teamId,
          choice
        )


      } else {


        await rpcAnswerMain(
          teamId,
          choice
        )


      }


    } catch (err) {

      alert(
        err instanceof Error
          ? err.message
          : "Error"
      )

    }


    setSubmitting(false)

  }



  async function handle5050() {


    if (
      question?.tipo === "quick" ||
      used5050 ||
      hidden5050Options.length > 0 ||
      hasUsed5050ThisQuestion
    ) return


    try {


      const options = await rpcUse5050(teamId)

      // Bloquea inmediatamente
      setUsed5050(true)
      setHidden5050Options(options)



    } catch (err) {


      alert(
        err instanceof Error
          ? err.message
          : "Error"
      )


    }

  }




  async function handleAudience() {

    if (
      question?.tipo === "quick" ||
      audiencePollOpen ||
      hasUsedAudienceThisQuestion ||
      !!audienceVotes
    ) return

    try {

      const votes = await rpcUseAudience(teamId)

      setAudiencePollOpenLocal(true)
      setAudienceResultsLocal(null)
      setAudienceVotes(votes)

    } catch (err) {

      alert(
        err instanceof Error
          ? err.message
          : "Error"
      )

    }

  }


  async function handleAudienceVote(choice: Letter) {

    if (!canVoteAudience || votingAudience) return

    setVotingAudience(true)

    try {

      const votes = await rpcVoteAudience(teamId, choice)

      if (votes) {
        setAudienceResultsLocal(votes)
        setAudienceVotes(votes)
        setAudiencePollOpenLocal(false)
      } else {
        setAudienceVotes(null)
        setAudienceVoteSubmitted(true)
      }

    } catch (err) {

      alert(
        err instanceof Error
          ? err.message
          : "Error"
      )

    } finally {

      setVotingAudience(false)

    }

  }



  const isMainPhase =
    game.status === "main"

  // Obtener el equipo ganador
  const winnerTeam = game.winner_team_id
    ? teams.find(t => t.id === game.winner_team_id)
    : null


  return (

    <main className="dark min-h-dvh bg-background text-foreground flex flex-col">

      <audio ref={correctAudioRef} preload="auto">
        <source src="/correct.mp3" type="audio/mpeg" />
      </audio>

      <audio ref={incorrectAudioRef} preload="auto">
        <source src="/incorrect.mp3" type="audio/mpeg" />
      </audio>


      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">


        <div className="flex min-w-0 flex-1 items-center gap-3">

          <SiteLogo className="size-10" />


          <div>

            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Equipo
            </p>


            <span className="block truncate text-lg font-bold">

              {team?.name ?? "Equipo"}

            </span>


          </div>


        </div>



        <div className="flex flex-col items-end">


          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Puntaje
          </p>


          <span className="text-2xl font-extrabold">

            {team?.score ?? 0}

          </span>


        </div>


      </header>




      <div className="flex-1 flex flex-col gap-6 px-4 py-6">


        {game.status === "champion" || game.status === "finished" ? (

          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-yellow-500">🏆 ¡CAMPEONES! 🏆</h2>
              <p className="mt-2 text-muted-foreground">
                {winnerTeam?.name || "Un equipo"} ha ganado la partida.
              </p>
            </div>
          </div>

        ) : game.status === "lobby" ? (

          <div className="flex flex-1 items-center justify-center">

            <p className="text-lg text-muted-foreground">
              Esperando a que inicie el juego...
            </p>

          </div>


        ) : isMainPhase && !isCurrentTeam && !audiencePollOpen ? (


          <div className="flex flex-1 items-center justify-center">

            <p className="text-lg text-muted-foreground">
              Esperando tu turno...
            </p>

          </div>


        ) : (


          <>


            <div className="flex min-h-12 flex-wrap items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2 text-center">


              <TimerDisplay
                key={`${activeQuestionId ?? "no-question"}-${question?.id ?? "no-question-id"}`}
                questionDeadline={
                  ["classification", "classification_answer", "main"]
                    .includes(game.status)
                    && question?.tipo !== "quick"
                    ? game.question_deadline
                    : null
                }
                defaultSeconds={60}
              />


              {
                canBuzz ?

                  <p className="animate-pulse text-lg font-semibold text-white">
                    ¡Presiona el buzzer!
                  </p>

                  :

                  isAnswering ?

                    <p className="text-lg font-semibold">
                      Selecciona tu respuesta
                    </p>

                    :

                    <p className="text-lg font-semibold text-muted-foreground">
                      Esperando...
                    </p>

              }


            </div>





            <div className="flex-1 flex items-center justify-center rounded-3xl border border-border bg-card p-6 text-center">


              <h1 className="text-xl font-bold">

                {question?.pregunta ?? "Cargando pregunta..."}

              </h1>


            </div>






            {question && isAnswering && (

              <div className="grid gap-3">


                {LETTERS.map(letter => (


                  <AnswerOption

                    key={letter}

                    letter={letter}

                    text={question.opciones[letter]}

                    onClick={() =>
                      handleAnswer(letter)
                    }

                    disabled={
                      !isAnswering ||
                      submitting
                    }


                    hidden={isHiddenBy5050(letter)}


                    reveal={null}

                  />


                ))}


              </div>

            )}







            {canBuzz && (

              <button

                onClick={handleBuzz}

                disabled={submitting}

                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-5 text-xl font-bold disabled:opacity-60"

              >

                {
                  submitting
                    ?
                    <Loader2 className="size-6 animate-spin" />
                    :
                    <Hand className="size-6" />
                }


                Buzzer


              </button>


            )}







            {isAnswering && (

              <div className="flex gap-2">


                <button

                  onClick={handle5050}

                  disabled={
                    question?.tipo === "quick" ||
                    used5050 ||
                    hidden5050Options.length > 0 ||
                    hasUsed5050ThisQuestion
                  }


                  className="flex-1 rounded-xl bg-secondary px-4 py-3 font-semibold disabled:opacity-40"


                >

                  <HelpCircle className="mx-auto mb-1 size-5" />

                  50/50


                </button>





                <button

                  onClick={handleAudience}

                  disabled={
                    question?.tipo === "quick" ||
                    audiencePollOpen ||
                    hasUsedAudienceThisQuestion ||
                    !!audienceVotes
                  }

                  className="flex-1 rounded-xl bg-secondary px-4 py-3 font-semibold disabled:opacity-40"

                >

                  <Volume2 className="mx-auto mb-1 size-5" />

                  Audiencia


                </button>


              </div>

            )}


            {audiencePollOpen && (
              <div className="w-full rounded-2xl border border-border bg-card p-5">
                <div className="mb-4 text-center">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Ayuda del público
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {isCurrentTeam ? "Esperando votos de los demás equipos" : "Vota por la opción correcta"}
                  </p>
                </div>

                {canVoteAudience && (
                  audienceVoteSubmitted ? (
                    <div className="rounded-xl bg-primary/10 px-4 py-5 text-center text-lg font-semibold text-primary">
                      Tu voto fue registrado. Esperando a los demás equipos...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {LETTERS.map((letter) => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => handleAudienceVote(letter)}
                          disabled={votingAudience}
                          className="rounded-xl bg-primary px-4 py-4 text-2xl font-extrabold text-white transition disabled:opacity-50 hover:brightness-110 active:scale-[0.98]"
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  )
                )}

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {isCurrentTeam
                    ? "Tu equipo no vota en la ayuda del público."
                    : audienceVoteSubmitted
                      ? `Tu voto fue registrado. Votos: ${audienceVotedTeams}/${audienceRequiredVotes}.`
                      : `Votos registrados: ${audienceVotedTeams}/${audienceRequiredVotes}.`}
                </p>
              </div>
            )}


            {isAnswering && teamAudienceVotes && !audiencePollOpen && (
              <div className="w-full rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <BarChart3 className="size-4" />
                  Ayuda del público
                </div>

                <div className="flex items-end justify-around gap-3" style={{ height: 120 }}>
                  {LETTERS.map((letter) => (
                    <div key={letter} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-sm font-bold">{teamAudienceVotes[letter]}%</span>

                      <div
                        className="w-full rounded-t-md bg-primary transition-all"
                        style={{
                          height: `${teamAudienceVotes[letter]}%`,
                          minHeight: 6,
                        }}
                      />

                      <span className="text-sm font-semibold text-muted-foreground">
                        {letter}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </>

        )}

      </div>


    </main>

  )


}