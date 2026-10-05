# EcoFlow

Plataforma interna de gestión de proyectos de instalación de paneles solares.
Proyecto Final Integrador: **El Arquitecto IA** (Escuela Colombiana de Ingeniería Julio Garavito).

- **Stack:** React 19 + TypeScript + Vite + Tailwind CSS 4 + Supabase (PostgreSQL, Auth, RLS)
- **Video demo:** https://youtu.be/ErfbVUhtFNQ
- **Documento de arquitectura (PDF):** [`docs/EcoFlow_Documento_de_Arquitectura.pdf`](docs/EcoFlow_Documento_de_Arquitectura.pdf)

## Qué hace

Los **administradores** crean proyectos y los asignan a un instalador. Cada **instalador** ve únicamente los proyectos asignados a él y actualiza su estado (Pendiente, En Progreso, Completado). El dashboard agrupa los proyectos por estado con contadores, y el formulario de creación valida los datos antes de enviarlos a Supabase.

La seguridad vive en la base de datos: el filtrado por instalador lo hacen las políticas RLS, no el frontend.

## Dónde está cada cosa

| Ruta | Contenido |
|---|---|
| `schema.sql` | Tablas (`instaladores`, `proyectos`, `materiales`), claves foráneas, índices, función `is_admin()`, políticas RLS, privilegios por columna y trigger de registro |
| `apply-sql.mjs` | Script de Node que aplica un archivo SQL de forma atómica (todo o nada) por el Session pooler de Supabase |
| `admin.sql.example` | Plantilla para asignar el rol `admin` a un usuario |
| `.env.example` | Plantilla de variables de entorno |
| `docs/` | Documento de Arquitectura (PDF): diagrama ER, especificación técnica, RLS, prompts y problema resuelto con IA |
| `src/` | Código React + TypeScript, organizado por capas (ver abajo) |

## Arquitectura del frontend

Flujo de dependencias: `pages/components → hooks → services → services/supabase → Supabase`. Los componentes nunca importan el cliente de Supabase.

```
src/
├── components/   layout/ (ProtectedRoute)  proyectos/ (ProyectoCard, ProyectoForm, EstadoBadge)
├── context/      AuthContext, AuthProvider  (sesión, perfil, esAdmin)
├── hooks/        useAuth, useInstaladores, useProyectos  (loading / error / datos)
├── pages/        Dashboard, Login, Register, Home
├── services/
│   ├── supabase/ client.ts  (cliente único)
│   ├── auth.service.ts
│   ├── instaladores.service.ts
│   └── proyectos.service.ts
├── types/        database.types.ts (tipos del esquema), proyecto.schema.ts (validación zod)
└── utils/        estados.ts
```

## Base de datos y seguridad

```
auth.users 1──1 instaladores 1──N proyectos 1──N materiales
```

- `proyectos.instalador_id` → `instaladores` con `on delete set null`; `materiales.proyecto_id` → `proyectos` con `on delete cascade`.
- RLS activo en las tres tablas. El instalador solo ve sus proyectos; el administrador ve todos; los materiales heredan el permiso del proyecto.
- Privilegios por columna: el cliente solo puede actualizar `proyectos.estado` e `instaladores.nombre/telefono`. El rol no se puede cambiar desde el cliente.

## Cómo ejecutarlo

1. **Instalar**
   ```bash
   git clone https://github.com/Robinson677/EcoFlow.git
   cd EcoFlow
   npm install
   ```
2. **Variables de entorno:** copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Supabase → Project Settings → API).
3. **Crear el esquema** con la cadena del *Session pooler* (Supabase → Connect). En PowerShell:
   ```powershell
   $env:DATABASE_URL = "postgresql://postgres.<REF>:<CLAVE>@aws-0-<REGION>.pooler.supabase.com:5432/postgres"
   node apply-sql.mjs schema.sql
   ```
   Debe responder `OK: schema.sql aplicado correctamente`.
4. **Crear un administrador:** registra un usuario (Authentication → Users → Add user), copia la plantilla y cambia el correo:
   ```powershell
   Copy-Item admin.sql.example admin.sql
   # edita admin.sql con el correo real
   node apply-sql.mjs admin.sql
   ```
5. **Iniciar:**
   ```bash
   npm run dev     # http://localhost:5173/login
   npm run build   # tsc -b + build de producción
   ```

## Nota sobre credenciales

`.env` y `admin.sql` están en `.gitignore` y **no se suben** al repositorio, porque contienen correos y claves reales. Por eso se incluyen `.env.example` y `admin.sql.example`. La cadena `DATABASE_URL` solo se define como variable de entorno en la terminal.

## Limitaciones conocidas

Sin interfaz para materiales (la tabla, tipos y RLS ya existen), sin edición de cliente/potencia desde la app, `Register.tsx` llama a Supabase directamente, tipos escritos a mano y sin pruebas automatizadas. Detalle y plan en la sección 9 del PDF.
