import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import { Spinner } from '../../components/ui/Spinner'
import { ArrowLeft, Mail } from 'lucide-react'

export function ForgotPassword() {
  const { register, handleSubmit } = useForm()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  async function onSubmit({ email }) {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) return toast({ title: 'Erro', description: error.message, type: 'error' })
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">⚽</div>
          <h1 className="text-3xl font-black text-white"><span className="text-brand-yellow">COPA</span>CARDS</h1>
        </div>
        <div className="card p-6">
          <Link to="/login" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          {sent ? (
            <div className="text-center py-6">
              <Mail className="w-12 h-12 text-brand-green mx-auto mb-3" />
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2">E-mail enviado!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Verifique sua caixa de entrada para redefinir a senha.</p>
              <Link to="/login" className="btn-primary mt-4 inline-flex">Voltar ao login</Link>
            </div>
          ) : (
            <>
              <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Esqueci minha senha</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Digite seu e-mail e enviaremos um link de redefinição.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div>
                  <label className="label">E-mail</label>
                  <input {...register('email', { required: true })} type="email" className="input" placeholder="seu@email.com" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? <Spinner size="sm" className="text-white" /> : 'Enviar link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
