import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { gameId?: unknown }

    if (typeof body.gameId !== "string" || body.gameId.length === 0) {
      return NextResponse.json({ error: "gameId requerido" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, pin, status")
      .eq("id", body.gameId)
      .single()

    if (gameError || !game) {
      return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 })
    }

    if (game.status !== "champion" && game.status !== "finished") {
      return NextResponse.json({ error: "La partida aún no ha terminado" }, { status: 400 })
    }

    if (typeof game.pin !== "string" || game.pin.length === 0) {
      return NextResponse.json({ error: "PIN de partida inválido" }, { status: 400 })
    }

    const { data: teamRows, error: teamsError } = await supabase
      .from("teams")
      .select("name, score")
      .eq("game_id", body.gameId)
      .order("score", { ascending: false })

    if (teamsError || !teamRows || teamRows.length === 0) {
      return NextResponse.json({ error: "No hay equipos para guardar" }, { status: 400 })
    }

    const teams = teamRows.map((team) => ({
      name: team.name,
      score: team.score,
    }))

    const winner = teams[0]

    const { data: existing } = await supabase
      .from("game_results")
      .select("id")
      .eq("id", body.gameId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ saved: false, existing: true })
    }

    const { error: insertError } = await supabase.from("game_results").insert({
      id: body.gameId,
      pin: game.pin,
      winner_name: winner.name,
      winner_score: winner.score,
      teams,
    })

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error("Error guardando resultado:", error)
    return NextResponse.json(
      { error: "No se pudo guardar el resultado" },
      { status: 500 },
    )
  }
}
