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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #FFB800, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🍽️</div>
          <h1 className="text-3xl font-black leading-tight">
            <span className="text-brand-red">El Rincón</span><br/>
            <span className="text-brand-gold">de Las Delicias</span>
          </h1>
          <p className="text-white/40 text-sm mt-2 uppercase tracking-widest">Panel Admin</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8"
             style={{ background: '#111', border: '1px solid rgba(255,184,0,0.25)' }}>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="admin@rincon.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30
                           focus:outline-none transition-all"
                style={{ background:'#1a1a1a', border:'1px solid rgba(255,184,0,0.25)' }}
                onFocus={e => e.target.style.borderColor = '#FFB800'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,184,0,0.25)'}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30
                           focus:outline-none transition-all"
                style={{ background:'#1a1a1a', border:'1px solid rgba(255,184,0,0.25)' }}
                onFocus={e => e.target.style.borderColor = '#FFB800'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,184,0,0.25)'}
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm text-brand-red"
                   style={{ background: 'rgba(232,0,28,0.1)', border: '1px solid rgba(232,0,28,0.3)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full font-black py-3.5 rounded-xl transition-all mt-2 disabled:opacity-40"
              style={{ background:'#FFB800', color:'#000',
                       boxShadow: loading ? 'none' : '0 0 20px rgba(255,184,0,0.4)' }}>
              {loading ? 'Ingresando…' : 'Ingresar →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
