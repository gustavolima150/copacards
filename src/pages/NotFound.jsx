import { Link } from 'react-router-dom'
export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
      <div className="text-8xl animate-bounce">⚽</div>
      <h1 className="font-black text-4xl text-gray-900 dark:text-white">Página não encontrada</h1>
      <p className="text-gray-500 dark:text-gray-400">A página que você procura não existe ou foi movida.</p>
      <Link to="/feed" className="btn-primary px-8 py-3">Voltar ao Feed</Link>
    </div>
  )
}
