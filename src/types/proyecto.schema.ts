import { z } from 'zod'
import type { NuevoProyecto } from './database.types'

// Valores tal como los escribe el usuario (todo texto)
export interface FormValores {
  nombre: string
  cliente: string
  direccion: string
  potencia_kw: string
  instalador_id: string // '' = sin asignar
  fecha_inicio: string // '' = sin fecha
}

export type ErroresForm = Partial<Record<keyof FormValores, string>>

export const proyectoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(80, 'El nombre no puede superar 80 caracteres.'),
  cliente: z
    .string()
    .trim()
    .min(2, 'El cliente debe tener al menos 2 caracteres.')
    .max(80, 'El cliente no puede superar 80 caracteres.'),
  direccion: z
    .string()
    .trim()
    .min(5, 'La dirección debe tener al menos 5 caracteres.')
    .max(150, 'La dirección no puede superar 150 caracteres.'),
  potencia_kw: z.coerce
    .number({ error: 'Ingresa un número válido.' })
    .positive('La potencia debe ser mayor que 0.')
    .max(9999.99, 'La potencia máxima es 9999.99 kW.'),
  instalador_id: z.string(),
  fecha_inicio: z.union([z.literal(''), z.iso.date('Fecha no válida.')]),
})

export type ResultadoValidacion =
  | { ok: true; datos: NuevoProyecto }
  | { ok: false; errores: ErroresForm }

// Valida y transforma al formato que espera la tabla "proyectos"
export function validarProyecto(valores: FormValores): ResultadoValidacion {
  const r = proyectoSchema.safeParse(valores)

  if (!r.success) {
    const errores: ErroresForm = {}
    for (const issue of r.error.issues) {
      const campo = issue.path[0]
      if (typeof campo === 'string' && !(campo in errores)) {
        errores[campo as keyof FormValores] = issue.message
      }
    }
    return { ok: false, errores }
  }

  const d = r.data
  return {
    ok: true,
    datos: {
      nombre: d.nombre,
      cliente: d.cliente,
      direccion: d.direccion,
      potencia_kw: d.potencia_kw,
      instalador_id: d.instalador_id || null,
      fecha_inicio: d.fecha_inicio || null,
    },
  }
}
