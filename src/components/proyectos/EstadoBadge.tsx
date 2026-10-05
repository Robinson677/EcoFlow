import type { EstadoProyecto } from '../../types/database.types'

const CLASES: Record<EstadoProyecto, string> = {
  Pendiente: 'bg-amber-100 text-amber-800',
  'En Progreso': 'bg-sky-100 text-sky-800',
  Completado: 'bg-emerald-100 text-emerald-800',
}

export default function EstadoBadge({ estado }: { estado: EstadoProyecto }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CLASES[estado]}`}>
      {estado}
    </span>
  )
}
