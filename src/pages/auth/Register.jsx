import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import { Spinner } from '../../components/ui/Spinner'
import { SELECTIONS } from '../../lib/utils'

export function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  async function onSubmit(data) {
    if (data.password !== data.confirm) return toast({ title: 'Senhas não coincidem', type: 'error' })
    setLoading(true)
    const { data: auth, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { username: data.username } }
    })
    if (error) { setLoading(false); return toast({ title: 'Erro ao cadastrar', description: error.message, type: 'error' }) }

    // Create profile
    if (auth.user) {
      await supabase.from('profiles').upsert({
        id: auth.user.id,
        username: data.username,
        bio: '',
        favorite_selection: data.favorite_selection || 'Brasil',
        avatar_url: null,
      })
    }
    setLoading(false)
    toast({ title: 'Conta criada! Bem-vindo! 🎉', type: 'success' })
    navigate('/feed')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark via-brand-blue to-brand-green p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">⚽</div>
          <h1 className="text-3xl font-black text-white">
            <span className="text-brand-yellow">COPA</span>CARDS
          </h1>
          <p className="text-white/70 mt-1 text-sm">Crie sua conta de colecionador</p>
        </div>
        <div className="card p-6">
          <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-5">Criar conta</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="label">Nome de usuário</label>
              <input {...register('username', { required: 'Nome obrigatório', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
                className="input" placeholder="@seu_nome" />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <label className="label">E-mail</label>
              <input {...register('email', { required: 'E-mail obrigatório' })} type="email" className="input" placeholder="seu@email.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Seleção Favorita</label>
              <select {...register('favorite_selection')} className="input">
                {SELECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Senha</label>
              <input {...register('password', { required: 'Senha obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                type="password" className="input" placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirmar Senha</label>
              <input {...register('confirm', { required: 'Confirme a senha' })} type="password" className="input" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Spinner size="sm" className="text-white" /> : 'Criar conta'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Já tem conta? <Link to="/login" className="text-brand-green font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
