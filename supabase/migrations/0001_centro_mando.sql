-- Centro de mando Colón 2027: esquema y permisos (RLS).
-- Roles: admin (dueño), editor (equipo de comando), capitan (ve y carga solo sus contactos).
-- Alta de personas: invitarlas desde Supabase (Auth > Users) con "Disable signups" activado;
-- cada alta crea un perfil con rol 'capitan' y activo=false hasta que un admin la habilite.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nombre text,
  rol text not null default 'capitan' check (rol in ('admin','editor','capitan')),
  activo boolean not null default false,
  created_at timestamptz not null default now()
);

-- Tablas de datos: mismo formato (id + jsonb) que usa el front.
create table public.cfg      (id text primary key, data jsonb not null, updated_at timestamptz not null default now(), updated_by uuid default auth.uid());
create table public.acts     (id text primary key, data jsonb not null, updated_at timestamptz not null default now(), updated_by uuid default auth.uid());
create table public.puntos   (id text primary key, data jsonb not null, updated_at timestamptz not null default now(), updated_by uuid default auth.uid());
create table public.contactos(id text primary key, owner uuid not null default auth.uid(), data jsonb not null, updated_at timestamptz not null default now(),
  constraint contactos_id_es_owner check (id = owner::text));

create index acts_updated on public.acts(updated_at);

-- Funciones de rol (security definer para no recursar en RLS de profiles).
create or replace function public.rol_actual() returns text
language sql stable security definer set search_path = public as $$
  select rol from public.profiles where id = auth.uid() and activo
$$;
create or replace function public.es_miembro() returns boolean
language sql stable security definer set search_path = public as $$ select public.rol_actual() is not null $$;
create or replace function public.es_editor() returns boolean
language sql stable security definer set search_path = public as $$ select public.rol_actual() in ('admin','editor') $$;
create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$ select public.rol_actual() = 'admin' $$;

-- Perfil automático al invitar/crear un usuario.
create or replace function public.nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,email) values (new.id,new.email) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.nuevo_usuario();

-- updated_at automático.
create or replace function public.touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); new.updated_by = auth.uid(); return new; end $$;
create trigger t_cfg before update on public.cfg for each row execute function public.touch();
create trigger t_acts before update on public.acts for each row execute function public.touch();
create trigger t_puntos before update on public.puntos for each row execute function public.touch();

alter table public.profiles  enable row level security;
alter table public.cfg       enable row level security;
alter table public.acts      enable row level security;
alter table public.puntos    enable row level security;
alter table public.contactos enable row level security;

-- profiles: cada persona ve el suyo; admin ve y gestiona todos. Nadie se cambia el rol a sí mismo.
create policy profiles_ver on public.profiles for select to authenticated
  using (id = auth.uid() or public.es_admin());
create policy profiles_admin_upd on public.profiles for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- cfg, acts, puntos: leen los miembros; escriben editores y admin.
do $$ declare t text; begin
  foreach t in array array['cfg','acts','puntos'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.es_miembro())', t||'_ver', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.es_editor())', t||'_ins', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.es_editor()) with check (public.es_editor())', t||'_upd', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.es_editor())', t||'_del', t);
  end loop;
end $$;

-- contactos: datos personales. Cada miembro maneja solo los suyos; editores y admin ven todos (solo lectura).
create policy contactos_ver on public.contactos for select to authenticated
  using (public.es_miembro() and (owner = auth.uid() or public.es_editor()));
create policy contactos_ins on public.contactos for insert to authenticated
  with check (public.es_miembro() and owner = auth.uid());
create policy contactos_upd on public.contactos for update to authenticated
  using (public.es_miembro() and owner = auth.uid()) with check (owner = auth.uid());
create policy contactos_del on public.contactos for delete to authenticated
  using (public.es_miembro() and owner = auth.uid());

-- Nada para el rol anónimo.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on public.cfg, public.acts, public.puntos, public.contactos to authenticated;
grant select, update on public.profiles to authenticated;

-- Tiempo real para el equipo.
alter publication supabase_realtime add table public.cfg, public.acts, public.puntos, public.contactos;
