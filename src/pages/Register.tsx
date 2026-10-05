import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

// Solo se permiten rutas internas (evita open redirect y javascript:)
const isSafePath = (p: string | null): p is string =>
  !!p && p.startsWith('/') && !p.startsWith('//') && !p.includes('\\')

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [welcome, setWelcome] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanName = name.trim()
    if (cleanName.length < 2 || cleanName.length > 60) {
      return setError('El nombre debe tener entre 2 y 60 caracteres.')
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError('Correo no válido.')
    }
    if (password.length < 8 || password.length > 72) {
      return setError('La contraseña debe tener entre 8 y 72 caracteres.')
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: cleanName } }, // sin role: lo asigna el servidor
    })
    if (error) {
      // Mensaje genérico: evita enumeración de usuarios
      return setError('No se pudo completar el registro.')
    }

    setWelcome(cleanName)
    const next = new URLSearchParams(window.location.search).get('next')
    navigate(isSafePath(next) ? next : '/')
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <input
          className="w-full rounded border p-2"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <input
          className="w-full rounded border p-2"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="w-full rounded border p-2"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <button className="w-full rounded bg-emerald-600 p-2 text-white">
          Registrarme
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-red-700">
          {error}
        </p>
      )}
      {/* Texto escapado por React: sin dangerouslySetInnerHTML */}
      {welcome && <p className="mt-3">Bienvenido, {welcome}</p>}
    </main>
  )
}