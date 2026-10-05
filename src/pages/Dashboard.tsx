import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProyectos } from '../hooks/useProyectos'
import { useInstaladores } from '../hooks/useInstaladores'
import ProyectoCard from '../components/proyectos/ProyectoCard'
import ProyectoForm from '../components/proyectos/ProyectoForm'
import { ESTADOS } from '../utils/estados'

export default function Dashboard() {
  const { user, perfil, esAdmin, cerrarSesion } = useAuth()
  const { proyectos, loading, error, recargar, crear, cambiarEstado } = useProyectos()
  const { instaladores } = useInstaladores(esAdmin)
  const [mostrarForm, setMostrarForm] = useState(false)

  const nombres = useMemo(
    () => new Map(instaladores.map((i) => [i.id, i.nombre])),
    [instaladores],
  )

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard de proyectos</h1>
          <p className="text-sm text-slate-600">
            {perfil?.nombre ?? user?.email} · {esAdmin ? 'Administrador' : 'Instalador'}
          </p>
        </div>
        <div className="flex gap-2">
          {esAdmin && (
            <button
              onClick={() => setMostrarForm((v) => !v)}
              className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
            >
              {mostrarForm ? 'Cerrar formulario' : 'Nuevo proyecto'}
            </button>
          )}
          <button
            onClick={() => void cerrarSesion()}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {esAdmin && mostrarForm && <ProyectoForm instaladores={instaladores} onCrear={crear} />}

      {loading && <p aria-busy="true">Cargando proyectos…</p>}

      {error && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          No se pudieron cargar los proyectos: {error}{' '}
          <button onClick={recargar} className="underline">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && proyectos.length === 0 && (
        <p className="text-slate-600">
          {esAdmin ? 'Aún no hay proyectos. Crea el primero.' : 'No tienes proyectos asignados.'}
        </p>
      )}

      {!loading && !error && proyectos.length > 0 && (
        <section className="grid gap-4 md:grid-cols-3">
          {ESTADOS.map((estado) => {
            const lista = proyectos.filter((p) => p.estado === estado)
            return (
              <div key={estado} className="space-y-3 rounded-lg bg-slate-50 p-3">
                <h2 className="font-semibold text-slate-800">
                  {estado} <span className="text-slate-500">({lista.length})</span>
                </h2>
                {lista.map((p) => (
                  <ProyectoCard
                    key={p.id}
                    proyecto={p}
                    instalador={p.instalador_id ? nombres.get(p.instalador_id) : undefined}
                    onCambiarEstado={cambiarEstado}
                  />
                ))}
              </div>
            )
          })}
        </section>
      )}
    </main>
  )
}
