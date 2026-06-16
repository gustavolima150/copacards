import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import { Spinner } from '../../components/ui/Spinner'
import { Eye, EyeOff } from 'lucide-react'

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  async function onSubmit(data) {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
    setLoading(false)
    if (error) return toast({ title: 'Erro ao entrar', description: error.message, type: 'error' })
    toast({ title: 'Bem-vindo de volta! ⚽', type: 'success' })
    navigate('/feed')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark via-brand-blue to-brand-green p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3 animate-bounce">⚽</div>
          <h1 className="text-4xl font-black text-white">
            <span className="text-brand-yellow">COPA</span>CARDS
          </h1>
          <p className="text-white/70 mt-2">Rede Social de Figurinhas da Copa</p>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-6">Entrar na conta</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="label">E-mail</label>
              <input
                {...register('email', { required: 'E-mail obrigatório' })}
                type="email" className="input" placeholder="seu@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Senha obrigatória' })}
                  type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-brand-green hover:underline font-medium">
                Esqueci minha senha
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Spinner size="sm" className="text-white" /> : 'Entrar'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Não tem conta?{' '}
            <Link to="/register" className="text-brand-green font-semibold hover:underline">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
