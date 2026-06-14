export type Letter = "A" | "B" | "C" | "D"

export type GameStatus =
  | "lobby"
  | "classification"
  | "classification_answer"
  | "main"
  | "gameover"
  | "champion"
  | "finished"

export interface Options {
  A: string
  B: string
  C: string
  D: string
}

export interface QuestionPublic {
  id: string
  tipo: "quick" | "main"
  pregunta: string
  opciones: Options
  activa: boolean
  created_at: string
}

export interface QuestionFull extends QuestionPublic {
  correcta: Letter
}

export interface Game {
  id: string
  pin: string
  status: GameStatus
  max_teams: number
  current_team_id: string | null
  current_question_id: string | null
  current_question_index: number
  buzzer_team_id: string | null
  classification_question_id: string | null
  main_question_ids: string[]
  used_question_ids: string[]
  eliminated_team_ids: string[]
  classification_failed_ids: string[]
  fifty_options: Letter[] | null
  audience_question_id: string | null
  audience_votes: Record<Letter, number> | null
  reveal_correct: Letter | null
  last_answer_correct: boolean | null
  round_points: number | null
  winner_team_id: string | null
  created_at: string
  updated_at: string
  question_deadline: string | null
}

export interface Team {
  id: string
  game_id: string
  name: string
  score: number
  used_5050: boolean
  fifty_options: Letter[] | null
  last_5050_question_id: string | null
  used_audience: boolean
  audience_votes: Record<Letter, number> | null
  last_audience_question_id: string | null
  buzzed_at: string | null
  created_at: string
}

export interface GameHistory {
  id: string
  pin: string | null
  winner_name: string | null
  winner_score: number | null
  teams: { name: string; score: number }[]
  played_at: string
}

// Points ladder for the 5 main questions
export const POINTS_LADDER = [2, 5, 10, 25, 50] as const

export const LETTERS: Letter[] = ["A", "B", "C", "D"]

export const TEAM_COLORS = [
  "oklch(0.62 0.21 25)",
  "oklch(0.6 0.17 250)",
  "oklch(0.74 0.16 70)",
  "oklch(0.62 0.15 155)",
  "oklch(0.65 0.2 320)",
  "oklch(0.7 0.13 180)",
]
