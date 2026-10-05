import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">EcoMart</h1>
      <p>Hoy es {format(new Date(), 'PPP', { locale: es })}</p>
    </main>
  )
}