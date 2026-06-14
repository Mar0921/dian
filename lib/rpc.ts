"use client"

import { createClient } from "@/lib/supabase/client"
import type { Letter } from "@/lib/types"

const supabase = () => createClient()

export async function rpcCreateGame(maxTeams: number) {
  const { data, error } = await supabase().rpc("create_game", { p_max_teams: maxTeams })
  if (error) throw new Error(error.message)
  return data[0] as { game_id: string; game_pin: string }
}

export async function rpcJoinGame(pin: string, name: string) {
  const { data, error } = await supabase().rpc("join_game", { p_pin: pin, p_name: name })
  if (error) throw new Error(error.message)
  return data[0] as { team_uuid: string; game_uuid: string }
}

export async function rpcStartGame(gameId: string) {
  const { error } = await supabase().rpc("start_game", { p_game_id: gameId })
  if (error) throw new Error(error.message)
}

export async function rpcBuzz(teamId: string) {
  const { error } = await supabase().rpc("buzz", { p_team_id: teamId })
  if (error) throw new Error(error.message)
}

export async function rpcAnswerClassification(teamId: string, choice: Letter) {
  const { data, error } = await supabase().rpc("answer_classification", {
    p_team_id: teamId,
    p_choice: choice,
  })
  if (error) throw new Error(error.message)
  return data as boolean
}

export async function rpcAnswerMain(teamId: string, choice: Letter) {
  const { data, error } = await supabase().rpc("answer_main", {
    p_team_id: teamId,
    p_choice: choice,
  })
  if (error) throw new Error(error.message)
  return data as boolean
}

export async function rpcNextClassification(gameId: string) {
  const { error } = await supabase().rpc("next_classification", { p_game_id: gameId })
  if (error) throw new Error(error.message)
}

export async function rpcStartMain(gameId: string) {
  const { error } = await supabase().rpc("start_main", { p_game_id: gameId })
  if (error) throw new Error(error.message)
}

export async function rpcUse5050(teamId: string) {
  const { data, error } = await supabase().rpc("use_5050", { p_team_id: teamId })
  if (error) throw new Error(error.message)
  return data as Letter[]
}

export async function rpcUseAudience(teamId: string) {
  const { data, error } = await supabase().rpc("use_audience", { p_team_id: teamId })
  if (error) throw new Error(error.message)
  return data as Record<Letter, number>
}

export async function rpcVoteAudience(teamId: string, choice: Letter) {
  const { data, error } = await supabase().rpc("vote_audience", {
    p_team_id: teamId,
    p_choice: choice,
  })
  if (error) throw new Error(error.message)
  return data as Record<Letter, number>
}

export async function rpcAudienceStatus(teamId: string) {
  const { data, error } = await supabase().rpc("audience_status", {
    p_team_id: teamId,
  })
  if (error) throw new Error(error.message)
  return data as {
    poll_open: boolean
    audience_votes: Record<Letter, number> | null
    voted_teams: number
    required_votes: number
  }
}
