import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase/config'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/admin')
    } catch {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#111111] flex items-center justify-center text-3xl mx-auto mb-4">
            🍽️
          </div>
          <h1 className="text-2xl font-bold text-[#111111]">El Rincón de Las Delicias</h1>
          <p className="text-[#6B7280] text-sm mt-1 uppercase tracking-widest font-medium">Panel Admin</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-card">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                required placeholder="admin@rincon.com"
                className="field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-1.5">
                Contraseña
              </label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••"
                className="field"
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm text-[#E8001C] bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full font-bold py-3.5 rounded-xl transition-all mt-2 disabled:opacity-40 bg-[#FFB800] text-[#111111] shadow-float hover:bg-[#e6a600]">
              {loading ? 'Ingresando…' : 'Ingresar →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
