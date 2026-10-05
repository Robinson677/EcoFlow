# Especificación de Arquitectura – EcoTech Inventory

## Propósito
Este documento es el plano del proyecto: define dónde vive cada responsabilidad
antes de escribir código, siguiendo Desarrollo Basado en Especificaciones (SDD).
Un equipo junior que sigue un plano claro comete menos errores y acumula menos
deuda técnica.

## Principio rector: separación de preocupaciones
El problema original es mezclar lógica de negocio con la interfaz. Por eso el
flujo de dependencias es unidireccional:

components/pages → hooks → services → services/supabase → Supabase

Ninguna capa conoce a las que están por encima ni se salta una intermedia.

## Decisiones por carpeta
- **components/**: solo presentación. Se divide en `ui` (genéricos), `layout`
  (estructura) y carpetas de dominio (`inventory`). Un componente que necesite
  datos los recibe por props o desde un hook, nunca consulta la base de datos.
- **pages/**: composición de componentes por ruta.
- **hooks/**: encapsulan lógica reutilizable y estado asíncrono
  (`loading`, `error`, `data`). Son el puente entre la UI y los servicios.
- **context/**: estado verdaderamente global (sesión, tema), evitando el
  "prop drilling".
- **types/**: contratos TypeScript únicos, reflejo de las tablas de Supabase.
  Si el esquema cambia, el compilador señala todo lo afectado.
- **utils/**: funciones puras sin efectos secundarios, fáciles de probar.

## Relación con Supabase (capa de servicios)
`services/supabase/` contiene el cliente único (`createClient`) configurado con
variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Sobre él,
cada archivo `*.service.ts` agrupa las operaciones de una entidad (consultar,
crear, actualizar, eliminar) y devuelve datos tipados.

Esto aporta:
1. **Un solo punto de acceso**: si cambian las tablas, las políticas RLS o
   incluso el proveedor, solo se modifica la capa de servicios.
2. **Testabilidad**: los hooks se prueban simulando servicios, sin conexión real.
3. **Seguridad**: las credenciales y consultas no se dispersan por la UI.
4. **Onboarding rápido**: el desarrollador junior sabe exactamente dónde agregar
   cada cosa.

## Escalabilidad
Agregar un módulo nuevo (proveedores, reportes) implica sumar
`supplier.service.ts`, `useSuppliers.ts`, sus tipos y componentes, sin tocar
lo existente.

## Convenciones
Componentes en PascalCase, hooks con prefijo `use`, servicios con sufijo
`.service.ts`, exportaciones centralizadas en `index.ts`.