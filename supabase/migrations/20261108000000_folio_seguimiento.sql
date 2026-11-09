-- =====================================================================
-- Folio de seguimiento (MGD-0001, MGD-0002, ...)
--
-- Cómo aplicarlo: copia todo este archivo en Supabase > SQL Editor y
-- ejecútalo una sola vez (después de las dos migraciones anteriores).
-- Se puede volver a ejecutar sin romper nada.
--
-- Cada reporte recibe un folio corto que genera la base de datos (el
-- cliente no lo puede elegir ni cambiar). Con él, cualquiera puede
-- consultar el estado de su reporte en /seguimiento sin tener cuenta,
-- usando la función consultar_folio().
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Columna y contador
-- ---------------------------------------------------------------------
create sequence if not exists public.reportes_folio_seq;

alter table public.reportes add column if not exists folio text;


-- ---------------------------------------------------------------------
-- 2. Darle folio a los reportes que ya existían, del más viejo al más nuevo
-- ---------------------------------------------------------------------
-- Se apaga el trigger un momento para que no cambie el updated_at de
-- todos los reportes viejos.
alter table public.reportes disable trigger proteger_campos_reporte;

update public.reportes r
set folio = 'MGD-' || lpad(n.num::text, greatest(4, length(n.num::text)), '0')
from (
  select id, row_number() over (order by created_at, id) as num
  from public.reportes
) n
where r.id = n.id
  and r.folio is null;

alter table public.reportes enable trigger proteger_campos_reporte;

-- El contador sigue después del folio más alto que ya exista.
-- (setval no acepta 0, por eso el greatest y el tercer parámetro:
-- si no hay reportes, el primero que llegue será el 1.)
select setval(
  'public.reportes_folio_seq',
  greatest(coalesce(max(substring(folio from 5)::bigint), 0), 1),
  coalesce(max(substring(folio from 5)::bigint), 0) > 0
)
from public.reportes;

alter table public.reportes alter column folio set not null;
create unique index if not exists reportes_folio_key on public.reportes (folio);

-- El trigger corre con el rol de quien inserta (anon o authenticated),
-- así que necesitan poder usar el contador.
grant usage on sequence public.reportes_folio_seq to anon, authenticated;


-- ---------------------------------------------------------------------
-- 3. El trigger que protege campos ahora también pone el folio
-- ---------------------------------------------------------------------
-- Es la misma función del esquema inicial, con dos líneas nuevas.
create or replace function public.proteger_campos_reporte()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  numero bigint;
begin
  if tg_op = 'INSERT' then
    new.estado := 'pendiente';
    new.usuario_id := auth.uid();
    new.created_at := now();
    -- Aunque el cliente mande un folio, aquí se reemplaza.
    -- greatest(4, ...) evita que lpad corte el número al pasar de 9999.
    numero := nextval('public.reportes_folio_seq');
    new.folio := 'MGD-' || lpad(numero::text, greatest(4, length(numero::text)), '0');
  else
    new.usuario_id := old.usuario_id;
    new.created_at := old.created_at;
    new.folio := old.folio;  -- el folio nunca cambia
  end if;
  new.updated_at := now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- 4. La vista pública también trae el folio
-- ---------------------------------------------------------------------
-- Es la misma vista de la migración de privacidad. "create or replace"
-- solo deja agregar columnas al final, por eso folio va hasta abajo.
create or replace view public.reportes_publicos as
select
  id,
  titulo,
  descripcion,
  estado,
  categoria_id,
  created_at,
  round(lat::numeric, 3)::double precision as lat,
  round(lng::numeric, 3)::double precision as lng,
  case when estado in ('en_revision', 'en_proceso', 'resuelto') then foto_path end as foto_path,
  case when estado in ('en_revision', 'en_proceso', 'resuelto') then direccion end as direccion,
  folio
from public.reportes
where estado <> 'rechazado';

grant select on public.reportes_publicos to anon, authenticated;


-- ---------------------------------------------------------------------
-- 5. Consulta pública por folio
-- ---------------------------------------------------------------------
-- Es "security definer" porque los rechazados no salen en la vista y
-- aun así queremos decirle a quien reportó que se rechazó. Las reglas:
--   * reporte normal: los mismos datos que la vista pública + historial
--   * reporte rechazado: solo folio, estado y fechas (sin título,
--     descripción, foto, dirección ni comentarios)
--   * nunca devuelve id, usuario_id, autor_id ni coordenadas
--   * si el folio no existe devuelve null
create or replace function public.consultar_folio(p_folio text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_estado public.estado_reporte;
  v_folio text;
  v_creado timestamptz;
  resultado jsonb;
begin
  select id, estado, folio, created_at
  into v_id, v_estado, v_folio, v_creado
  from public.reportes
  where folio = upper(trim(p_folio));

  if v_id is null then
    return null;
  end if;

  if v_estado = 'rechazado' then
    return jsonb_build_object(
      'folio', v_folio,
      'estado', v_estado,
      'created_at', v_creado,
      'historial', coalesce((
        select jsonb_agg(
          jsonb_build_object('id', a.id, 'estado', a.estado, 'comentario', null, 'created_at', a.created_at)
          order by a.created_at
        )
        from public.actualizaciones a
        where a.reporte_id = v_id
      ), '[]'::jsonb)
    );
  end if;

  -- Los datos salen de la vista, así las reglas de privacidad siguen
  -- en un solo lugar (foto y dirección solo si ya se revisó, etc.)
  select jsonb_build_object(
    'folio', p.folio,
    'titulo', p.titulo,
    'descripcion', p.descripcion,
    'estado', p.estado,
    'created_at', p.created_at,
    'foto_path', p.foto_path,
    'direccion', p.direccion,
    'categoria', jsonb_build_object('nombre', c.nombre, 'color', c.color),
    'historial', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', a.id, 'estado', a.estado, 'comentario', a.comentario, 'created_at', a.created_at)
        order by a.created_at
      )
      from public.actualizaciones a
      where a.reporte_id = v_id
    ), '[]'::jsonb)
  )
  into resultado
  from public.reportes_publicos p
  left join public.categorias c on c.id = p.categoria_id
  where p.id = v_id;

  return resultado;
end;
$$;

revoke execute on function public.consultar_folio(text) from public;
grant execute on function public.consultar_folio(text) to anon, authenticated;

commit;

-- Para que la API de Supabase vea la función nueva de inmediato
notify pgrst, 'reload schema';
