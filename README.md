# Campaña Colón 2027

Monorepo con dos aplicaciones independientes:

| Carpeta | Qué es | Público | Deploy (Vercel, Root Directory) |
|---|---|---|---|
| `apps/sitio` | Sitio de campaña de Mauricio Pereyra (La Calera 2027): propuestas, diagnóstico, sumate | Sí | `apps/sitio` (o raíz con `outputDirectory`) |
| `apps/centro` | Centro de mando: mapa 3D, estrategia, actividades, contactos, elección, presupuesto | **No** (login) | `apps/centro` |
| `supabase/` | Esquema SQL y permisos (RLS) del centro de mando | — | Supabase |
| `data/` | Datos fuente (escuelas y mesas de la Cámara Electoral) | — | — |
| `docs/` | Arquitectura, datos y puesta en marcha | — | — |

Sitio público: [campanapereyramauricio.vercel.app](https://campanapereyramauricio.vercel.app). Arquitectura: [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

## Para dejar el sitio 100 % operativo

1. **Contacto.** En `apps/sitio/js/campana.js` cargá WhatsApp (`549351…` solo dígitos) e Instagram/Facebook.
2. **Correo del formulario Sumate.** En el proyecto de Vercel del sitio: `CAMPANA_TO_EMAIL` (destino del equipo) y `RESEND_API_KEY`. Opcional: `CAMPANA_FROM_EMAIL`.
3. **Foto del candidato.** Guardar `apps/sitio/img/candidato.jpg`.
4. **Centro de mando.** Proyecto Vercel aparte, Root Directory `apps/centro`. Completar `apps/centro/js/config.js` con URL y anon key de Supabase. Pasos en `docs/ARQUITECTURA.md`.
5. **Mapa A/B/C y contactos** quedan en el centro, no en el sitio público.
