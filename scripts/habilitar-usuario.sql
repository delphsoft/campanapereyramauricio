-- Habilitar personas del centro de mando.
-- Paso previo: invitar el email desde Supabase (Authentication > Users > Invite user).
-- Ejecutar en SQL Editor (o `supabase db query`) con el rol postgres; el front no puede hacerlo.
-- Roles: 'capitan' (ve y carga solo sus contactos), 'editor' (comando: edita todo, lee todos los contactos), 'admin' (dueño).

-- 1) Un capitán:
update public.profiles
   set rol = 'capitan', activo = true, nombre = 'Nombre Apellido'
 where email = 'capitan@ejemplo.com';

-- 2) Un editor del comando:
update public.profiles
   set rol = 'editor', activo = true, nombre = 'Nombre Apellido'
 where email = 'editor@ejemplo.com';

-- 3) Varias personas de una vez (capitanes):
-- update public.profiles set rol = 'capitan', activo = true
--  where email in ('a@ejemplo.com', 'b@ejemplo.com');

-- Deshabilitar (no borra sus contactos; deja de ver todo):
-- update public.profiles set activo = false where email = 'alguien@ejemplo.com';

-- Control: cada fila debe mostrar el rol y activo esperados (0 filas = no se invitó todavía).
select email, nombre, rol, activo from public.profiles order by rol, email;
