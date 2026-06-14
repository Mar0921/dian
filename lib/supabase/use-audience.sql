alter table games add column if not exists audience_question_id uuid;
alter table teams add column if not exists last_audience_question_id uuid;
alter table teams add column if not exists audience_votes jsonb;

create table if not exists public.team_audience_votes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  question_id uuid not null,
  team_id uuid not null references teams(id) on delete cascade,
  vote text not null check (vote in ('A', 'B', 'C', 'D')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, question_id, team_id)
);

create index if not exists team_audience_votes_game_question_idx
  on public.team_audience_votes (game_id, question_id);

drop function if exists use_audience(uuid);
drop function if exists vote_audience(uuid, text);
drop function if exists audience_status(uuid);

create or replace function use_audience(p_team_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_current_question_id uuid;
  v_audience_question_id uuid;
  v_existing_votes jsonb;
  v_zero_votes jsonb := jsonb_build_object('A', 0, 'B', 0, 'C', 0, 'D', 0);
begin
  select
    t.game_id,
    coalesce(g.current_question_id, g.classification_question_id),
    g.audience_question_id,
    g.audience_votes
  into
    v_game_id,
    v_current_question_id,
    v_audience_question_id,
    v_existing_votes
  from teams t
  join games g on g.id = t.game_id
  where t.id = p_team_id;

  if not found then
    raise exception 'Equipo no encontrado';
  end if;

  if v_current_question_id is null then
    raise exception 'No hay pregunta activa';
  end if;

  if v_audience_question_id = v_current_question_id and v_existing_votes is not null then
    return v_existing_votes;
  end if;

  delete from public.team_audience_votes
  where game_id = v_game_id
    and question_id = v_current_question_id;

  update games
  set audience_question_id = v_current_question_id,
      audience_votes = null
  where id = v_game_id;

  update teams
  set used_audience = true,
      last_audience_question_id = v_current_question_id
  where id = p_team_id;

  return v_zero_votes;
end;
$$;

create or replace function vote_audience(p_team_id uuid, p_choice text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_current_question_id uuid;
  v_current_team_id uuid;
  v_audience_question_id uuid;
  v_existing_votes jsonb;
  v_total_teams integer;
  v_required_votes integer;
  v_voted_teams integer;
  v_result jsonb;
begin
  if p_choice not in ('A', 'B', 'C', 'D') then
    raise exception 'Opción de audiencia inválida';
  end if;

  select
    t.game_id,
    coalesce(g.current_question_id, g.classification_question_id),
    g.current_team_id,
    g.audience_question_id,
    g.audience_votes
  into
    v_game_id,
    v_current_question_id,
    v_current_team_id,
    v_audience_question_id,
    v_existing_votes
  from teams t
  join games g on g.id = t.game_id
  where t.id = p_team_id;

  if not found then
    raise exception 'Equipo no encontrado';
  end if;

  if v_current_question_id is null then
    raise exception 'No hay pregunta activa';
  end if;

  if v_current_team_id is not null and p_team_id = v_current_team_id then
    raise exception 'El equipo que responde no vota en la ayuda del público';
  end if;

  if v_audience_question_id is distinct from v_current_question_id or v_existing_votes is not null then
    raise exception 'La ayuda del público no está abierta para esta pregunta';
  end if;

  insert into public.team_audience_votes (game_id, question_id, team_id, vote)
  values (v_game_id, v_current_question_id, p_team_id, p_choice)
  on conflict (game_id, question_id, team_id) do update
  set vote = excluded.vote,
      updated_at = now();

  select count(*)
  into v_total_teams
  from teams
  where game_id = v_game_id;

  if v_current_team_id is not null then
    v_required_votes := v_total_teams - 1;
  else
    v_required_votes := v_total_teams;
  end if;

  select count(distinct team_id)
  into v_voted_teams
  from public.team_audience_votes
  where game_id = v_game_id
    and question_id = v_current_question_id;

  if v_voted_teams >= v_required_votes then
    select jsonb_build_object(
      'A', round(100.0 * count(*) filter (where vote = 'A') / nullif(v_required_votes, 0))::integer,
      'B', round(100.0 * count(*) filter (where vote = 'B') / nullif(v_required_votes, 0))::integer,
      'C', round(100.0 * count(*) filter (where vote = 'C') / nullif(v_required_votes, 0))::integer,
      'D', round(100.0 * count(*) filter (where vote = 'D') / nullif(v_required_votes, 0))::integer
    )
    into v_result
    from public.team_audience_votes
    where game_id = v_game_id
      and question_id = v_current_question_id;

    update games
    set audience_votes = v_result
    where id = v_game_id;

    return v_result;
  end if;

  return v_existing_votes;
end;
$$;

create or replace function audience_status(p_team_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_current_question_id uuid;
  v_current_team_id uuid;
  v_audience_question_id uuid;
  v_existing_votes jsonb;
  v_total_teams integer;
  v_required_votes integer;
  v_voted_teams integer;
begin
  select
    t.game_id,
    coalesce(g.current_question_id, g.classification_question_id),
    g.current_team_id,
    g.audience_question_id,
    g.audience_votes
  into
    v_game_id,
    v_current_question_id,
    v_current_team_id,
    v_audience_question_id,
    v_existing_votes
  from teams t
  join games g on g.id = t.game_id
  where t.id = p_team_id;

  if not found then
    raise exception 'Equipo no encontrado';
  end if;

  if v_audience_question_id is distinct from v_current_question_id or v_existing_votes is not null then
    return jsonb_build_object(
      'poll_open', false,
      'audience_votes', v_existing_votes,
      'voted_teams', 0,
      'required_votes', 0
    );
  end if;

  select count(*)
  into v_total_teams
  from teams
  where game_id = v_game_id;

  if v_current_team_id is not null then
    v_required_votes := v_total_teams - 1;
  else
    v_required_votes := v_total_teams;
  end if;

  select count(distinct team_id)
  into v_voted_teams
  from public.team_audience_votes
  where game_id = v_game_id
    and question_id = v_current_question_id;

  return jsonb_build_object(
    'poll_open', true,
    'audience_votes', null,
    'voted_teams', v_voted_teams,
    'required_votes', v_required_votes
  );
end;
$$;
