import { useState, type ChangeEvent } from 'react'
import { format, parseISO } from 'date-fns'
import EstadoBadge from './EstadoBadge'
import { ESTADOS } from '../../utils/estados'
import type { EstadoProyecto, Proyecto } from '../../types/database.types'

interface Props {
  proyecto: Proyecto
  instalador?: string
  onCambiarEstado: (id: string, estado: EstadoProyecto) => Promise<void>
}

export default function ProyectoCard({ proyecto, instalador, onCambiarEstado }: Props) {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cambiar = async (e: ChangeEvent<HTMLSelectElement>) => {
    setGuardando(true)
    setError(null)
    try {
      await onCambiarEstado(proyecto.id, e.target.value as EstadoProyecto)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <article className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{proyecto.nombre}</h3>
        <EstadoBadge estado={proyecto.estado} />
      </div>
      <p className="text-sm text-slate-600">{proyecto.cliente}</p>
      <p className="text-sm text-slate-500">{proyecto.direccion}</p>
      <p className="text-sm text-slate-700">
        {proyecto.potencia_kw} kW
        {proyecto.fecha_inicio && ` · Inicio ${format(parseISO(proyecto.fecha_inicio), 'dd/MM/yyyy')}`}
      </p>
      {instalador && <p className="text-xs text-slate-500">Instalador: {instalador}</p>}

      <label className="block text-xs text-slate-500">
        Cambiar estado
        <select
          value={proyecto.estado}
          onChange={cambiar}
          disabled={guardando}
          className="mt-1 w-full rounded border border-slate-300 p-1.5 text-sm text-slate-800"
        >
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
    </article>
  )
}
