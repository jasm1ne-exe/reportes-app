-- =====================================================================
-- Colores de las categorías (versión 2)
--
-- Cómo aplicarlo: copia todo este archivo en Supabase > SQL Editor y
-- ejecútalo una sola vez (después de las migraciones anteriores).
-- Se puede volver a ejecutar sin romper nada.
--
-- Los colores originales se confundían: baches, alumbrado y señalización
-- (naranja, ámbar y rojo), basura y zonas verdes (dos verdes casi
-- iguales) y agua y mobiliario (azul y morado).
--
-- Esta paleta usa un tono distinto para cada categoría (café, ámbar,
-- turquesa, azul, fucsia, rojo, verde oliva y gris) y todos los colores
-- tienen contraste de al menos 3:1 contra el borde blanco del marcador,
-- para que se vean bien sobre el mapa gris claro.
--
-- Si ya aplicaste 20261108000001_colores_categorias.sql no pasa nada:
-- este archivo reemplaza esos colores.
-- =====================================================================

begin;

update public.categorias set color = '#8b5a2b' where slug = 'baches';        -- café (tierra y asfalto)
update public.categorias set color = '#d97706' where slug = 'alumbrado';     -- ámbar (luz de lámpara)
update public.categorias set color = '#0d9488' where slug = 'basura';        -- turquesa (contenedores de reciclaje)
update public.categorias set color = '#2563eb' where slug = 'agua';          -- azul (agua)
update public.categorias set color = '#c026d3' where slug = 'mobiliario';    -- fucsia
update public.categorias set color = '#dc2626' where slug = 'senalizacion';  -- rojo (señales de alto)
update public.categorias set color = '#4d7c0f' where slug = 'zonas-verdes';  -- verde oliva (pasto y árboles)
update public.categorias set color = '#6b7280' where slug = 'otro';          -- gris neutro

commit;
