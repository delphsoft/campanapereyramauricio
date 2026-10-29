# Arquitectura

## Principios
1. **Lo público y lo privado no comparten deploy ni dominio.** La estrategia, las zonas y los contactos de vecinos nunca viajan en el sitio de campaña.
2. **La seguridad vive en la base de datos (RLS)**, no en el front. La pantalla de login es cosmética; aunque alguien la saltee, Postgres devuelve vacío.
3. **Sin build.** HTML + JS plano + CDN con versión fija. Se edita y se despliega.
4. **Datos personales mínimos.** Contactos: nombre, zona, tema, temperatura, WhatsApp; cargados con consentimiento. Es información personal (Ley 25.326): ver "Pendientes".

## Mapa
```
GitHub (este repo)
 ├─ apps/sitio  ──► Vercel proyecto "campana-sitio"  ──► dominio público
 └─ apps/centro ──► Vercel proyecto "campana-centro" ──► dominio privado (noindex)
                          │  supabase-js (anon key + sesión del usuario)
                          ▼
                    Supabase: Auth (email OTP, sin registro abierto)
                              Postgres + RLS + Realtime
```

## Centro de mando (`apps/centro`)
Scripts cargados en este orden (comparten ámbito global):

| Archivo | Responsabilidad |
|---|---|
| `js/config.js` | URL y anon key de Supabase |
| `js/data.js` | Datos base: municipios `D`, circuitos `POLY`, escuelas `SCH` |
| `js/estado.js` | Estado, zonas A/B/C, fórmula de prioridad, modelo de actividades |
| `js/escena3d.js` | Escena three.js (extrusión de circuitos, cámara, picking) |
| `js/ficha.js` | Ficha lateral por municipio y gráficos |
| `js/actividades.js` | Tablero, gantt y editor de actividades |
| `js/backend.js` | Elige backend (Claude / Supabase / ninguno) y hace el login |
| `js/persistencia.js` | `persist()` con debounce, suscripciones en tiempo real, sin pisar lo que se está editando |
| `js/vistas.js` | Contactos, Elección (escenarios y fiscalización), Presupuesto, puntos 3D |
| `js/estrategia.js` | Estrategia, KPIs, fases, enlaces y arranque |

`backend.js` expone una `db` con la interfaz `doc(path).set/delete/onSnapshot` y `collection(c).onSnapshot`. Hoy la implementan Claude (artefacto) y Supabase; sumar otro backend es escribir ese adaptador.

## Modelo de datos (`supabase/migrations/0001_centro_mando.sql`)
| Tabla | Contenido | Lee | Escribe |
|---|---|---|---|
| `profiles` | rol y alta de cada persona | cada una el suyo; admin todos | admin |
| `cfg` | plan por municipio, zonas, KPIs, enlaces, escenarios | miembros | editor, admin |
| `acts` | actividades | miembros | editor, admin |
| `puntos` | carteles, eventos, puntos de votación | miembros | editor, admin |
| `contactos` | una fila por capitán `{cap, items[]}` | el dueño; editor y admin (lectura) | solo el dueño |

Roles: `admin` (dueño), `editor` (comando), `capitan`. Un usuario nuevo queda `activo=false` hasta que un admin lo habilita. Verificado con un Postgres local y usuarios de cada rol (capitán no ve contactos ajenos, no escribe actividades, no se auto-promueve; anónimo no lee).

## Puesta en marcha
1. **Supabase:** crear proyecto. Authentication → Providers → Email (OTP) y **desactivar "Allow new users to sign up"**. SQL Editor → ejecutar `supabase/migrations/0001_centro_mando.sql`.
2. **Primer admin:** invitar tu email (Auth → Users → Invite). Luego en SQL: `update public.profiles set rol='admin', activo=true where email='tu@email';`
3. **Equipo:** invitar a cada persona y habilitarla: `update public.profiles set activo=true, rol='capitan' where email='...';` (rol `editor` para el comando).
4. **Front:** completar `apps/centro/js/config.js` con la URL y la anon key (Project Settings → API). Authentication → URL Configuration: agregar el dominio del centro como Site URL / Redirect.
5. **Vercel:** dos proyectos sobre este repo. `campana-sitio` con Root Directory `apps/sitio`; `campana-centro` con Root Directory `apps/centro`. Framework "Other", sin build. Recomendado en el centro: Deployment Protection como segunda capa (el código y los datos base de `data.js` se sirven a quien abra la URL; los datos reales del equipo están solo en Supabase).

> **Sitio público sin cambios en Vercel:** el `vercel.json` de la raíz publica `apps/sitio` (`outputDirectory`), así que el proyecto actual sigue funcionando con Root Directory vacío. Si preferís, podés poner Root Directory `apps/sitio` y borrar ese archivo. El centro va siempre en un proyecto aparte con Root Directory `apps/centro`.

## Pendientes
- Pedir a la Junta Electoral: locales y mesas 2023, escrutinio definitivo por mesa y lista, calendario 2027 (la página "Elección" genera la carta).
- Registrar la base de contactos y definir consentimiento y retención (Ley 25.326 / AAIP).
- Rotar la anon key no es necesario; nunca subir la `service_role`.
- Sin mapa de calles: la capa de puntos usa coordenadas manuales.
