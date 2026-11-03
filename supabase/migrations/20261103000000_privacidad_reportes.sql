-- =====================================================================
-- Privacidad de los reportes en el mapa público
--
-- Cómo aplicarlo: copia todo este archivo en Supabase > SQL Editor y
-- ejecútalo una sola vez (después del esquema inicial).
--
-- Antes, cualquiera con la clave anon podía leer todas las columnas de
-- public.reportes (usuario_id, coordenadas exactas, fotos sin revisar...).
-- Ahora el público lee la vista public.reportes_publicos, que solo trae
-- los datos seguros. La tabla queda para los admins y para el dueño del
-- reporte.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Reportes: solo admins (y el dueño) leen la tabla directamente
-- ---------------------------------------------------------------------
-- "if exists" para que el script se pueda ejecutar más de una vez sin error
drop policy if exists "Reportes visibles para todos" on public.reportes;
drop policy if exists "Admins ven todos los reportes" on public.reportes;
drop policy if exists "Cada usuario ve sus reportes" on public.reportes;

create policy "Admins ven todos los reportes"
  on public.reportes for select to authenticated
  using (public.es_admin());

create policy "Cada usuario ve sus reportes"
  on public.reportes for select to authenticated
  using (usuario_id = (select auth.uid()));

-- anon sigue pudiendo crear reportes, pero ya no leer la tabla
revoke select on public.reportes from anon;


-- ---------------------------------------------------------------------
-- Vista pública para el mapa y el detalle
-- ---------------------------------------------------------------------
-- No lleva "security_invoker" a propósito: así la vista corre con los
-- permisos de su dueño y se salta la RLS de la tabla. Por eso es la vista
-- la que decide qué se ve:
--   * nunca se muestra usuario_id
--   * las coordenadas se redondean a 3 decimales (~100 m)
--   * la foto y la dirección solo salen cuando un admin ya revisó el reporte
--   * los reportes rechazados no aparecen
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
  case when estado in ('en_revision', 'en_proceso', 'resuelto') then direccion end as direccion
from public.reportes
where estado <> 'rechazado';

grant select on public.reportes_publicos to anon, authenticated;


-- ---------------------------------------------------------------------
-- Actualizaciones: no mostrar quién es el admin que la escribió
-- ---------------------------------------------------------------------
revoke select on public.actualizaciones from anon, authenticated;
grant select (id, reporte_id, estado, comentario, created_at)
  on public.actualizaciones to anon, authenticated;
