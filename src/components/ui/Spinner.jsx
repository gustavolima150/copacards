import { cn } from '../../lib/utils'

export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', sizes[size], className)} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl animate-bounce">⚽</div>
        <p className="text-brand-green font-bold text-lg">Carregando...</p>
      </div>
    </div>
  )
}
