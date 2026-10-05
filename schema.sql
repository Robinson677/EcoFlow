-- EcoFlow: esquema, RLS y trigger
-- Se aplica de forma atómica: si algo falla, no se crea nada.

-- 1. Tablas
create table public.instaladores (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text not null,
  telefono   text,
  rol        text not null default 'instalador'
             check (rol in ('instalador', 'admin')),
  created_at timestamptz not null default now()
);

create table public.proyectos (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null check (length(trim(nombre)) > 0),
  cliente       text not null check (length(trim(cliente)) > 0),
  direccion     text not null,
  potencia_kw   numeric(6,2) not null check (potencia_kw > 0),
  estado        text not null default 'Pendiente'
                check (estado in ('Pendiente', 'En Progreso', 'Completado')),
  instalador_id uuid references public.instaladores (id) on delete set null,
  fecha_inicio  date,
  created_at    timestamptz not null default now()
);

create table public.materiales (
  id             uuid primary key default gen_random_uuid(),
  proyecto_id    uuid not null references public.proyectos (id) on delete cascade,
  nombre         text not null check (length(trim(nombre)) > 0),
  cantidad       integer not null check (cantidad > 0),
  costo_unitario numeric(10,2) not null default 0 check (costo_unitario >= 0),
  created_at     timestamptz not null default now()
);

-- 2. Índices
create index idx_proyectos_instalador on public.proyectos (instalador_id);
create index idx_proyectos_estado     on public.proyectos (estado);
create index idx_materiales_proyecto  on public.materiales (proyecto_id);

-- 3. Función auxiliar (evita recursión en RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.instaladores
    where id = (select auth.uid()) and rol = 'admin'
  );
$$;

-- 4. RLS
alter table public.instaladores enable row level security;
alter table public.proyectos    enable row level security;
alter table public.materiales   enable row level security;

-- instaladores: cada uno ve y edita lo suyo; el admin ve todos
create policy "instaladores_select" on public.instaladores for select
  to authenticated using ((select auth.uid()) = id or public.is_admin());
create policy "instaladores_update_own" on public.instaladores for update
  to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- proyectos: el instalador solo ve los asignados a él
create policy "proyectos_select" on public.proyectos for select
  to authenticated
  using (instalador_id = (select auth.uid()) or public.is_admin());
create policy "proyectos_insert_admin" on public.proyectos for insert
  to authenticated with check (public.is_admin());
create policy "proyectos_update" on public.proyectos for update
  to authenticated
  using (instalador_id = (select auth.uid()) or public.is_admin())
  with check (instalador_id = (select auth.uid()) or public.is_admin());
create policy "proyectos_delete_admin" on public.proyectos for delete
  to authenticated using (public.is_admin());

-- materiales: se heredan los permisos del proyecto
create policy "materiales_select" on public.materiales for select
  to authenticated using (exists (
    select 1 from public.proyectos p
    where p.id = materiales.proyecto_id
      and (p.instalador_id = (select auth.uid()) or public.is_admin())));
create policy "materiales_insert" on public.materiales for insert
  to authenticated with check (exists (
    select 1 from public.proyectos p
    where p.id = materiales.proyecto_id
      and (p.instalador_id = (select auth.uid()) or public.is_admin())));

-- 5. Privilegios por columna: un instalador solo cambia el estado de un proyecto
revoke update on public.proyectos from authenticated;
grant update (estado) on public.proyectos to authenticated;
revoke update on public.instaladores from authenticated;
grant update (nombre, telefono) on public.instaladores to authenticated;

-- 6. Crear el instalador al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.instaladores (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
