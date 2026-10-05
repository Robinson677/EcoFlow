import { useEffect, useState } from 'react'
import { listarInstaladores } from '../services/instaladores.service'
import type { Instalador } from '../types/database.types'

// "habilitado" evita la consulta cuando el usuario no es admin
export function useInstaladores(habilitado: boolean) {
  const [instaladores, setInstaladores] = useState<Instalador[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!habilitado) return
    let activo = true
    listarInstaladores()
      .then((data) => {
        if (activo) setInstaladores(data)
      })
      .catch((e: unknown) => {
        if (activo) setError(e instanceof Error ? e.message : 'Error desconocido')
      })
    return () => {
      activo = false
    }
  }, [habilitado])

  return { instaladores, error }
}
