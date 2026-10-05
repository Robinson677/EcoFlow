import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import {
  validarProyecto,
  type ErroresForm,
  type FormValores,
} from '../../types/proyecto.schema'
import type { Instalador, NuevoProyecto } from '../../types/database.types'

const VACIO: FormValores = {
  nombre: '',
  cliente: '',
  direccion: '',
  potencia_kw: '',
  instalador_id: '',
  fecha_inicio: '',
}

const INPUT = 'w-full rounded border border-slate-300 p-2 text-sm'

function Campo({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="mt-1 font-normal">{children}</div>
      {error && (
        <span role="alert" className="mt-1 block text-xs text-red-700">
          {error}
        </span>
      )}
    </label>
  )
}

interface Props {
  instaladores: Instalador[]
  onCrear: (input: NuevoProyecto) => Promise<unknown>
}

export default function ProyectoForm({ instaladores, onCrear }: Props) {
  const [valores, setValores] = useState<FormValores>(VACIO)
  const [errores, setErrores] = useState<ErroresForm>({})
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)

  const cambiar =
    (campo: keyof FormValores) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValores((prev) => ({ ...prev, [campo]: e.target.value }))

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setExito(false)
    setErrorEnvio(null)

    // Se valida ANTES de enviar a Supabase
    const resultado = validarProyecto(valores)
    if (!resultado.ok) {
      setErrores(resultado.errores)
      return
    }
    setErrores({})

    setEnviando(true)
    try {
      await onCrear(resultado.datos)
      setValores(VACIO)
      setExito(true)
    } catch (err) {
      setErrorEnvio(err instanceof Error ? err.message : 'No se pudo crear el proyecto.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">Nuevo proyecto</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo label="Nombre" error={errores.nombre}>
          <input className={INPUT} value={valores.nombre} onChange={cambiar('nombre')} />
        </Campo>
        <Campo label="Cliente" error={errores.cliente}>
          <input className={INPUT} value={valores.cliente} onChange={cambiar('cliente')} />
        </Campo>
        <Campo label="Dirección" error={errores.direccion}>
          <input className={INPUT} value={valores.direccion} onChange={cambiar('direccion')} />
        </Campo>
        <Campo label="Potencia (kW)" error={errores.potencia_kw}>
          <input
            className={INPUT}
            inputMode="decimal"
            value={valores.potencia_kw}
            onChange={cambiar('potencia_kw')}
          />
        </Campo>
        <Campo label="Instalador" error={errores.instalador_id}>
          <select className={INPUT} value={valores.instalador_id} onChange={cambiar('instalador_id')}>
            <option value="">Sin asignar</option>
            {instaladores.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Fecha de inicio (opcional)" error={errores.fecha_inicio}>
          <input
            type="date"
            className={INPUT}
            value={valores.fecha_inicio}
            onChange={cambiar('fecha_inicio')}
          />
        </Campo>
      </div>

      {errorEnvio && (
        <p role="alert" className="text-sm text-red-700">
          {errorEnvio}
        </p>
      )}
      {exito && <p role="status" className="text-sm text-emerald-700">Proyecto creado.</p>}

      <button
        disabled={enviando}
        className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {enviando ? 'Guardando…' : 'Crear proyecto'}
      </button>
    </form>
  )
}
