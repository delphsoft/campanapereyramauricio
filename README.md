# Campaña Colón 2027

Monorepo con dos aplicaciones independientes:

| Carpeta | Qué es | Público | Deploy (Vercel, Root Directory) |
|---|---|---|---|
| `apps/sitio` | Sitio de campaña de Mauricio Pereyra (La Calera 2027): propuestas, diagnóstico, simulador | Sí | `apps/sitio` |
| `apps/centro` | Centro de mando: mapa 3D, estrategia, actividades, contactos, elección, presupuesto | **No** (login) | `apps/centro` |
| `supabase/` | Esquema SQL y permisos (RLS) del centro de mando | — | Supabase |
| `data/` | Datos fuente (escuelas y mesas de la Cámara Electoral) | — | — |
| `docs/` | Arquitectura, datos y puesta en marcha | — | — |

Todo es HTML/JS estático, sin build. Arquitectura y puesta en marcha: [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).
