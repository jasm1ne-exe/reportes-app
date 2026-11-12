# Sistema web de gestion y monitoreo de reportes ciudadanos
### Nombre corto: reportApp

Aplicación web para que los habitantes de un municipio reporten problemas de la vía pública (baches, alumbrado, basura, fugas de agua, etc.) marcando el punto exacto en un mapa. El personal municipal puede revisar los reportes, cambiar su estado y publicar respuestas.

El proyecto está pensado inicialmente para **Magdalena, Jalisco (México)**, aunque puede usarse en cualquier municipio.

> Estado: en desarrollo. Ya se pueden crear reportes desde el mapa, consultarlos con su folio, gestionar cuentas y administrar reportes desde el panel admin.

## Demo

- Sitio en vivo: _https://sigeremu.netlify.app/_


## Funcionalidades

**Disponibles**

- Mapa interactivo (OpenStreetMap + Leaflet) centrado en la ubicación del dispositivo, con un punto predeterminado si no se concede el permiso, y botón **GPS** para volver a buscar la ubicación.
- Marcador que se puede arrastrar (o tocar el mapa) para ajustar la ubicación exacta del problema.
- Formulario de reporte con categoría, título, descripción y **foto opcional**.
- Cada reporte recibe un **folio de seguimiento** (por ejemplo `MGD-0007`) que se puede copiar al enviarlo.
- Página pública `/seguimiento` donde cualquiera, con o sin cuenta, consulta el estado y el historial de su reporte usando el folio.
- Marcadores con el **ícono y color de su categoría** y un indicador de estado (punto oscuro = en revisión o en proceso, palomita verde = resuelto), con leyenda en la versión de escritorio.
- Filtro de reportes por categoría en el mapa.
- Página de detalle de cada reporte con su **historial** de cambios y los comentarios del municipio.
- Registro con confirmación por correo, inicio y cierre de sesión, y recuperación de contraseña.
- Los reportes se pueden enviar **con o sin cuenta**; si hay sesión, el reporte queda asociado al usuario.
- Panel administrativo protegido para cambiar el estado de los reportes y publicar respuestas.
- Medidas de seguridad y privacidad: en el mapa público se muestran ubicaciones redondeadas a 3 decimales (100 m aprox.); la foto y la dirección solo se muestran cuando el reporte pasa a *en revisión*, *en proceso* o *resuelto*, y los reportes rechazados no aparecen en el mapa. Además, las imágenes se comprimen al subirse para eliminar los metadatos con información sensible (como el GPS).

## Roles

| Rol | Qué puede hacer |
| --- | --- |
| Ciudadano sin cuenta | Ver el mapa, enviar reportes y consultar su folio |
| Ciudadano con cuenta | Lo anterior, y sus reportes quedan ligados a su cuenta |
| Administrador | Entrar al panel `/admin`, cambiar estados y publicar respuestas |

## Tecnologías

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) y React-Leaflet con mapas de OpenStreetMap
- [Supabase](https://supabase.com/) (autenticación, base de datos y almacenamiento de imágenes)
- React Router
- browser-image-compression
- Despliegue en [Netlify](https://www.netlify.com/)

## Cómo correrlo localmente

1. Clona el repositorio e instala las dependencias:

   ```bash
   git clone <url-del-repositorio>
   cd reportes-app
   npm install
   ```

2. Crea un archivo `.env.local` en la raíz con tus datos de Supabase:

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publica
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

Otros comandos: `npm run build` (genera la versión final en `dist/`), `npm run preview` y `npm run lint`.

## Estructura del proyecto

```
src/
├── pages/        # Pantallas: Inicio (mapa), Login, Registro, Admin, DetalleReporte, Seguimiento...
├── components/   # Mapa, formularios, marcadores, filtro, historial y componentes de UI
├── context/      # Manejo de la sesión del usuario (AuthProvider)
└── lib/          # Cliente de Supabase y funciones para los reportes
public/           # Archivos que se copian tal cual (favicon)
supabase/
└── migrations/   # Esquema de la base de datos: tablas, vistas, permisos y funciones
```

## Despliegue

El proyecto se publica en Netlify. El comando de build es `npm run build` y la carpeta a publicar es `dist`. Las variables de entorno de Supabase se configuran en el panel de Netlify.

## Próximos pasos

- Panel admin: contadores por estado, buscador por título y paginación.
- Notificaciones al ciudadano cuando su reporte cambia de estado.
- Estadísticas de reportes por categoría y colonia.

## Autor 

Hecho por Jasmine.

## Licencia

Este proyecto usa la licencia [MIT](LICENSE).
