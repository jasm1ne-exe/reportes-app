# Sistema web de gestion y monitoreo de reportes ciudadanos
### Nombre corto: reportApp

Aplicación web para que los habitantes de un municipio reporten problemas de la vía pública (baches, alumbrado, basura, fugas de agua, etc.) marcando el punto exacto en un mapa. El personal municipal puede revisar los reportes, cambiar su estado y publicar respuestas.

El proyecto está pensado inicialmente para **Magdalena, Jalisco (México)**, aunque puede usarse en cualquier municipio.

> Estado: en desarrollo. Ya se pueden crear reportes desde el mapa, gestionar cuentas y administrar reportes desde el panel admin. La consulta pública de reportes sigue pendiente.

## Demo

- Sitio en vivo: _https://sigeremu.netlify.app/_
- Capturas: _(agrega imágenes en una carpeta `docs/` y enlázalas aquí, por ejemplo `![Mapa](docs/mapa.png)`)_

## Funcionalidades

**Disponibles**

- Mapa interactivo (OpenStreetMap + Leaflet) centrado en la ubicación del dispositivo, con un punto predeterminado si no se concede el permiso.
- Marcador que se puede arrastrar para ajustar la ubicación exacta del problema.
- Formulario de reporte con categoría, título y descripción.
- Filtro de reportes por categoría en el mapa.
- Página de detalle de cada reporte.
- Registro con confirmación por correo, inicio y cierre de sesión, y recuperación de contraseña.
- Los reportes se pueden enviar **con o sin cuenta**; si hay sesión, el reporte queda asociado al usuario.
- Panel administrativo protegido para cambiar el estado de los reportes y publicar respuestas.
- Medidas de seguridad y privacidad: en el mapa público se muestran ubicaciones redondeadas a 3 decimales (100 m aprox.) y las imágenes solo se muestran cuando un admin cambia el estado del reporte. Además, las imágenes se comprimen al subirse para eliminar los metadatos con información sensible.

## Roles

| Rol | Qué puede hacer |
| --- | --- |
| Ciudadano sin cuenta | Ver el mapa y enviar reportes |
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
├── pages/        # Pantallas: Inicio (mapa), Login, Registro, Admin, DetalleReporte...
├── components/   # Mapa, formularios, marcadores, filtro y componentes de UI
├── context/      # Manejo de la sesión del usuario (AuthProvider)
└── lib/          # Cliente de Supabase y funciones para los reportes
```

## Despliegue

El proyecto se publica en Netlify. El comando de build es `npm run build` y la carpeta a publicar es `dist`. Las variables de entorno de Supabase se configuran en el panel de Netlify.

## Próximos pasos

- Consulta pública de reportes y su estado.
- Notificaciones al ciudadano cuando su reporte cambia de estado.
- Estadísticas de reportes por categoría y colonia.

## Autor 

Hecho por Jasmine.

## Licencia

Este proyecto usa la licencia [MIT](LICENSE).
