alter table teams add column if not exists last_5050_question_id uuid;
alter table teams add column if not exists fifty_options text[];

drop function if exists use_5050(uuid);

create or replace function use_5050(p_team_id uuid)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_current_question_id uuid;
  v_correcta text;
  v_used boolean;
  v_last_5050_question_id uuid;
  v_team_fifty_options text[];
  v_hidden text[];
begin
  select 
    t.game_id,
    t.used_5050,
    t.last_5050_question_id,
    t.fifty_options,
    coalesce(g.current_question_id, g.classification_question_id),
    q.correcta
  into 
    v_game_id,
    v_used,
    v_last_5050_question_id,
    v_team_fifty_options,
    v_current_question_id,
    v_correcta
  from teams t
  join games g on g.id = t.game_id
  join questions q 
    on q.id = coalesce(g.current_question_id, g.classification_question_id)
  where t.id = p_team_id;

  if not found then
    raise exception 'Equipo no encontrado';
  end if;

  if v_current_question_id is null then
    raise exception 'No hay pregunta activa';
  end if;

  if v_team_fifty_options is not null and v_last_5050_question_id = v_current_question_id then
    raise exception 'El comodin 50/50 ya fue usado en esta pregunta';
  end if;

  if v_used = true and v_last_5050_question_id = v_current_question_id then
    raise exception 'El comodin 50/50 ya fue usado en esta pregunta';
  end if;

  select array(
    select opcion
    from (
      values 
        ('A'),
        ('B'),
        ('C'),
        ('D')
    ) as opciones(opcion)
    where opcion <> v_correcta
    order by random()
    limit 2
  )
  into v_hidden;

  update teams
  set used_5050 = true,
      last_5050_question_id = v_current_question_id,
      fifty_options = v_hidden
  where id = p_team_id;

  update games
  set fifty_options = null
  where id = v_game_id;

  return v_hidden;
end;
$$;
